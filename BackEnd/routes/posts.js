import {createUser,checkUser}  from '../data/users.js'
import {Router} from 'express';
const router = Router();
import help from "../helpers.js";
import multer from 'multer';
import {photos} from "../config/mongoCollections.js";
import { createPost, getPost } from '../data/posts.js';
import { ObjectId } from 'mongodb';
import {uploadPhoto, upload, getPhotoSrc } from '../data/photos.js';

/*const upload = multer({
    storage: multer.memoryStorage(),
    //max 5 files of 10mb
    limits: {fields: 5,
            fileSize: 10 * 1024 * 1024,
            fieldSize: 10 * 1024 * 1024},
    fileFilter: function (req, file, cb) {
        console.log(file.mimetype);
        if (file.mimetype != "image/jpg" && file.mimetype != "image/png" && file.mimetype != "image/jpeg") {
            return cb(new Error("Files must be of type jpg, jpeg, or png"));
        }
        cb(null, true);
    }
});*/

router
    .route('/create')
    .get(async (req, res) => {
        //go to record page for workout creation
        if (!req.session.user){
            console.log("user not authenticated");
            return res.redirect("/login")
        }

        try {
            return res.render("record", {title: "Record an activity!", logged_in: true });
        }catch (e) {
            return res.status(500).render('error', {title: 'Error',message: "Internal Server Error"})
        }
    })
    .post(upload.array('postImgs[]', 5), async (req, res, err) => {

        //console.log(req.file);
        let fun = "createPostRoute";
        var workoutTypes = ["running", "lifting", "cycling", "other"];
        //create post
        const postData = req.body;
        let userId = req.session.user.user_id;
        let workoutType = postData.workoutType;
        console.log(workoutType)
        let postDescription = postData.postDescription;
        let postImgs = []
        //console.log(postImgs);
        let postToGroup = postData.postToGroup;
        let postTitle = postData.postTitle;
        let badData = {};
        let posted;

        if(err instanceof multer.MulterError) {
            res.status(400).render('error', {error: err});
        }

        try {
            //none of these should ever really error because its just pulled from the cookie
            if(!userId) {
                help.err(fun, "could not get user id");
            }
            else if(!ObjectId.isValid(userId)){
                help.err(fun, "userId is not valid")
            }
        }catch (e) {
            badData.userId = e;
        }
        try {
            if(!postTitle) {
                throw "must provide a title";
            }
            else if (!help.isStr(postTitle)){
                throw "title must be a non-empty string";
            }
            let titlelines = postTitle.split('\n')
            let len = postTitle.length - (titlelines.length - 1);
            if (len > 40) {
                throw `title can be max 40 characters`
            }
        }catch(e) {
            badData.postTitle = e;
        }
        try {
            if(!postDescription) {
                throw "must provide a description";
            }
            else if (!help.isStr(postDescription)) {
                throw "description must be a non-empty string";
            }
            let desclines = postDescription.split('\n')
            let len = postDescription.length - (desclines.length - 1);
            if (len > 500) {
                throw "postDescription cannot be over 500 characters"
            }
        } catch(e) {
            badData.postDescription = e;
        }
        try {
            if(!workoutType) {
                throw "must provide a workout type";
            }
            else if (!help.isStr(workoutType)) {
                throw "workout type must be a non-empty string";
            }
            else if (!workoutTypes.includes(workoutType.trim().toLowerCase())) {
                throw "invalid workout type";
            }
        }catch(e) {
            badData.workoutType = e;
        }

        /*will need to change this to probably take in groupNames instead of Ids because
            no user is going to be finding all the proper group ids to input*/
        try {
            if(postToGroup) {
                if (!help.isStr(postToGroup)) {
                    throw "postToGroup must be a string of groupIds seperated by commas"
                }
                else {
                    postToGroup = postToGroup.split(',');
                    for (let x of postToGroup) {
                        if (!ObjectId.isValid(x)) {
                            throw "postToGroup contains a non valid group Id";
                        }
                    }

                }
            }
            else {
                postToGroup = [];
            }
        }catch(e) {
            badData.postToGroup = e;
        }

        try {
            if (!req.files) {
                //do nothing because images arent required
            }
            else {
                //upload image
                for (let x of req.files) {
                    let xId = await uploadPhoto(x)
                    //console.log(xId)
                    postImgs.push(xId);
                }
                //console.log(postImgs);
            }   
        }catch(e) {
            badData.postImgs = e;
            console.log(e);
        }

        let postObj = {
            userId: userId,
            postTitle: postTitle,
            workoutType: workoutType,
            postDescription: postDescription,
            postImgs: postImgs,
            postToGroup: postToGroup
        }
        try {
            console.log(postObj.userId)
            console.log("is userId valid " + ObjectId.isValid(postObj.userId))
            console.log(postObj)
            posted = await createPost(userId, postTitle, workoutType, postDescription, postImgs, postToGroup);
            if (!posted) {
                throw `Error: could not post workout`
            }
            console.log(posted)
            let postId = posted._id
            res.redirect(`/posts/${postId}`)
        }catch(e) {
            console.log(e);
        }
        
    });

router
    .route('/:postId')
    .get(async (req, res) => {
        //get post by id and send to post specific page
        let postId = req.params.postId;
        let thisPost;
        let postImgs = [];
        try {
            if (typeof postId !== "string") {
                throw `postId must be a string`
            }
            postId = postId.trim();
            if (postId == "") {
                throw `postId cannot be empty`
            }
            if (!ObjectId.isValid(new ObjectId(postId))) {
                throw `invalid postId`
            }
        }catch(e) {
            console.log(e);
            return res.status(400).send(e);
        }
        try {
            thisPost = await getPost(postId);
        }catch(e) {
            console.log(e);
            return res.status(404).send("could not find post");
        }
        try {
            //get photos
            if (thisPost.postImgs.length != 0) {
                for (let x of thisPost.postImgs) {
                    let src = await getPhotoSrc(x);
                    postImgs.push(src);
                }
            }
        }catch(e) {
            console.log(e);
            return res.status(404).send("could not find image");
        }
        return res.render("post", {title: thisPost.postTitle, postTitle: thisPost.postTitle, images: postImgs, postDescription: thisPost.postDescription, workoutType: thisPost.workoutType, logged_in: true});
    });
export default router