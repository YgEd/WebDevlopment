import {createUser,checkUser, getUser}  from '../data/users.js'
import {Router} from 'express';
const router = Router();
import help from "../helpers.js";
import multer from 'multer';
import {photos} from "../config/mongoCollections.js";
import { createPost, getPost, updatePost } from '../data/posts.js';
import { ObjectId } from 'mongodb';
import {uploadPhoto, upload, getPhotoSrc } from '../data/photos.js';
import { getGroup } from '../data/groups.js';
import xss from 'xss'
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
        let groups = [];
        if (!req.session.user){
            console.log("user not authenticated");
            return res.redirect("/login")
        }
        try {
            const currUser = await getUser(req.session.user.user_id);
            if (!currUser) {
                throw `failed to get user`
            }
            for (let x of currUser.groupMembers) {
                let id = x.toString()
                let currGroup = await getGroup(id)
                if (!currGroup) {
                    throw `failed to get group`
                }
                //console.log(currGroup);
                let name = currGroup.groupName
                //console.log(name);
                groups.push({id, name});
            }
        }catch(e) {
            return res.status(500).render('error', {title: 'server error', message:e})
        }
        try {
            return res.render("record", {title: "Record an activity!", logged_in: true, groups: groups });
        }catch (e) {
            return res.status(500).render('error', {title: 'Error',message: "Internal Server Error"})
        }
    })
    .post(upload.any(), async (req, res, err) => {

        //console.log(req.file);
        let fun = "createPostRoute";
        var workoutTypes = ["running", "lifting", "cycling", "other"];
        //create post
        const postData = req.body;
        let userId = req.session.user.user_id;
        let workoutType = req.body.workoutType;
        console.log(workoutType)
        let postDescription = req.body.postDescription;
        let postImgs = []
        //console.log(postImgs);


        let postToGroup = req.body.postToGroup;
        let postTitle = req.body.postTitle;

        let badData = {};
        let posted;

        if(err instanceof multer.MulterError) {
            return res.status(400).render('error', {error: err});
        }

        try {
            workoutType = xss(workoutType)
            postDescription = xss(postDescription)
            postTitle = xss(postTitle)
            //none of these should ever really error because its just pulled from the cookie
            if(!userId) {
                help.err(fun, "could not get user id");
            }
            else if(!ObjectId.isValid(userId)){
                help.err(fun, "userId is not valid")
            }
        }catch (e) {
            return res.status(500).render('error', {title: 'error', message:e})
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
            return res.status(400).render('error', {title: 'error', message:e})
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
            return  res.status(400).render('error', {title: 'error', message:e})
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
            return res.status(400).render('error', {title: 'error', message:e})
        }

        try {
            if(postToGroup) {
                if (!Array.isArray(postToGroup)) {
                    throw "postToGroup must be an array of ObjectIds"
                }
                else {
                    for (let x of postToGroup) {
                        if (!ObjectId.isValid(x)) {
                            throw "postToGroup contains a non valid group Id";
                        }
                    }
                }
            }
            else {
                postToGroup = [];
                for (let x of postToGroup) {
                    x = xss(x)
                }

            }
        }catch(e) {
            return res.status(400).render('error', {title: 'error', message:e})
        }

        try {
            if (req.files.length != 0) {
                //upload image
                postImgs = []
                if (req.files.length > 3) {
                    throw `error cannot upload more than 3 files`
                }
                for (let x of req.files) {
                    console.log("x is" , x)
                    if (x.mimetype != "image/jpg" && x.mimetype != "image/png" && x.mimetype != "image/jpeg") {
                        throw `can only upload .jpg, .jpeg, or .png files`
                    }
                    if (x.size > 10 * 1024 * 1024) {
                        throw `image cannot be over 10mb`
                    }
                    let xId = await uploadPhoto(x)
                    //console.log(xId)
                    postImgs.push(xId);
                }
                //console.log(postImgs);
            }      
        }catch(e) {
            return  res.status(400).render('error', {title: 'error', message:e})
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
            /*console.log(postObj.userId)
            console.log("is userId valid " + ObjectId.isValid(postObj.userId))
            console.log(postObj)*/
            posted = await createPost(userId, postTitle, workoutType, postDescription, postImgs, postToGroup);
            if (!posted) {
                throw `Error: could not post workout`
            }
            //console.log(posted)
            let postId = posted._id
            return res.redirect(`/posts/${postId}`)
        }catch(e) {
            return res.status(500).render('error', {title:e, message:e})
        }
        
    });

router
    .route('/:postId')
    .get(async (req, res) => {
        //get post by id and send to post specific page
        let postId = req.params.postId;
        let thisPost;
        let postImgs = [];
        let liked = false;
        let commented = false;
        let isOwner = false;
        var user_id;
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
            return res.status(404).render("not_found", {title: "Post not found"})
        }
        try {
            //get photos
            if (thisPost.postImgs.length != 0) {
                for (let x of thisPost.postImgs) {
                    let src = await getPhotoSrc(x);
                    postImgs.push(src);
                }
            }

            if (!req.session.user) {
                logged_in = false;
                user_id = null;
            }else{
                user_id = req.session.user.user_id;
                //check if user has liked post
                for (let x of thisPost.postLikes) {
                    if (x.toString() == user_id.toString()) {
                        thisPost.liked = true;
                    }
                }

                //check if user has commented on post
                for (let x of thisPost.comments) {
                    if (x.userId.toString() == user_id.toString()) {
                        thisPost.commented = true;
                    }
                }

                //check if user is owner of post
                if (thisPost.userId.toString() == user_id.toString()) {
                    thisPost.owner = true;
                }
            }
        }catch(e) {
            console.log(e);
            return res.status(404).render("not_found", {title: "Post not found"})
        }

        try {
            for(let x of thisPost.postLikes) {
                if (x.toString() == req.session.user.user_id) {
                    liked = true;
                }
            }   
            for(let x of thisPost.comments) {
                if (x.userId.toString() == req.session.user.user_id) {
                    commented = true;
                }
            }
            if (thisPost.userId == req.session.user.user_id) {
                isOwner = true;
            }
        }catch(e) {
            return res.status(500).render('error', {title: 'error', message: e})
        }
        return res.render("post", {title: thisPost.postTitle, postTitle: thisPost.postTitle, images: postImgs, postDescription: thisPost.postDescription, workoutType: thisPost.workoutType, logged_in: true, comments: thisPost.comments, postLikes: thisPost.postLikes, userId: thisPost.userId.toString(), username: thisPost.username, liked: liked, commented: commented, userId: req.session.user.user_id, postId: postId, isOwner: isOwner, postOwner: thisPost.userId});
    })
router
    .route("/:postId/edit")
    .get(async (req, res) => {
        let thisPost;
        let postImgs = []
        let postId = req.params.postId;
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
            thisPost = await getPost(postId);
        }catch(e) {
            console.log(e);
            return res.status(400).send(e);
        }
        try {
            if (thisPost.userId.toString() !== req.session.user.user_id) {
                throw `you are not authorized to do this`
            }
        }catch(e) {
            return res.status(401).render('error', {title: 'error', message: e});
        }
        try {
            for (let x of thisPost.postImgs) {
                const photoColl = await photos();
                let img = await photoColl.findOne({_id: x})
                if (!img) {
                    throw `could not find image with id ${x}`
                }
                postImgs.push({id: x, imageName: img.imageName});
            }
            return res.render('editPost', {title: 'edit post', postTitle: thisPost.postTitle, description: thisPost.postDescription, postImgs: postImgs, postId: postId})
        }catch(e) {
            return res.status(500).render('error', {title: 'error', message: e})
        }
        
    })
    .post(upload.any(), async (req, res) => {
        let fun = "createPostRoute";
        var workoutTypes = ["running", "lifting", "cycling", "other"];
        const postData = req.body;
        let userId = req.session.user.user_id;
        let workoutType = req.body.workoutType;
        let postDescription = req.body.postDescription;
        let postTitle = req.body.postTitle;
        let badData = {};
        let originalPost;
        let postImgs;
        let postToGroup = [];
        let postId = req.body.postId;

        try {

            workoutType = xss(workoutType)
            postDescription = xss(postDescription)
            postTitle = xss(postTitle)
            postId = xss(postId)

            
            if(!req.params.postId) {
                throw `must provide postId`
            }
            originalPost = await getPost(req.params.postId);
            if (!originalPost) {
                throw `Could not retreive original post`
            }
            postImgs = originalPost.postImgs;
        }catch(e) {
            return res.status(400).render('error', {title: 'error', message: e})
        }
        try {
            if(originalPost.userId.toString() !== req.session.user.user_id) {
                throw `You cannot do this`
            }
        }catch(e) {
            return res.status(401).render('error', {title:'error', message:e})
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
            return res.status(400).render('error', {title:'error', message:e})
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
            return res.status(400).render('error', {title:'error', message:e})
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
            return res.status(400).render('error', {title:'error', message:e})
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
            return res.status(400).render('error', {title:'error', message:e})
        }

        /* wanted to be able to select images for removal but multer was being weird about it :(
        try {
            if(Array.isArray(removeImgs)) {
                for (let x of removeImgs) {
                    let i = postImgs.indexOf(new ObjectId(x));
                    postImgs.splice(i, 1)
                }
                console.log(postImgs);
            }
        }catch(e) {
            return res.status(500).render('error', {title: 'error', message: e})
        }*/
        try {
            //console.log(req.files)
            if (req.files.length != 0) {
                //upload image
                postImgs = []
                if (req.files.length > 3) {
                    throw `error cannot upload more than 3 files`
                }
                for (let x of req.files) {
                    if (x.mimetype != "image/jpg" && x.mimetype != "image/png" && x.mimetype != "image/jpeg") {
                        throw `can only upload .jpg, .jpeg, or .png files`
                    }
                    if (x.size > 10 * 1024 * 1024) {
                        throw `image cannot be over 10mb`
                    }
                    let xId = await uploadPhoto(x)
                    //console.log(xId)
                    postImgs.push(xId);
                }
                //console.log(postImgs);
            }   
        }catch(e) {
            return res.status(400).render('error', {title:'error', message:e})
        }

        try {
            let updated = await updatePost(postId, postTitle, workoutType, postDescription, postImgs, originalPost.postLikes, originalPost.comments, postToGroup);
            if (!updated) {
                throw `Error: could not update workout`
            }
            return res.redirect(`/posts/${postId}`)
        }catch(e) {
            return res.status(500).render('error', {title:'error', message:e})
        }
       
    });

export default router