import {createUser,checkUser}  from '../data/users.js'
import {Router} from 'express';
const router = Router();
import help from "../helpers.js";
import multer from 'multer';
import {photos} from "../config/mongoCollections.js";
import { createPost, getPost } from '../data/posts.js';
import { ObjectId } from 'mongodb';

const upload = multer({storage: multer.memoryStorage()});

router
    .route('/create')
    .get(async (req, res) => {
        //go to record page for workout creation
        try {
            return res.render("record", {title: "Record an activity!"});
        }catch (e) {
            return res.status(500).render('error', {title: 'Error',message: "Internal Server Error"})
        }
    })
    .post(upload.single('postImgs'), async (req, res) => {
        //console.log(req.file);
        let fun = "createPostRoute";
        var workoutTypes = ["running", "lifting", "cycling", "other"];
        //create post
        const postData = req.body;
        let userId = req.session.user.id;
        let workoutType = postData.workoutType;
        let postDescription = postData.postDescription;
        let postImgs = []
        //console.log(postImgs);
        let postToGroup = postData.postToGroup;
        let postTitle = postData.postTitle;
        let badData = {};
        let posted;

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
            if (!req.file) {

            }
            else {
                let doc = {
                    imageName: req.file.originalname,
                    imageSrc: `data:${req.file.fieldname};base64,${req.file.buffer.toString('base64')}`
                };
                const photoColl = await photos();
                const insertPhoto = await photoColl.insertOne(doc);
                //test to see if insert was successful
                if (!insertPhoto.acknowledged || !insertPhoto.insertedId) {
                  throw "error could not upload image"
                }
                else {
                    postImgs.push(insertPhoto.insertedId);
                }
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
            posted = await createPost(postObj);
            if (!posted) {
                throw `Error: could not post workout`
            }
        }catch(e) {
            console.log(e);
        }
        let postId = posted._id
        res.redirect(`/posts/${postId}`)
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
            if (thisPost.postImgs.length != 0) {
                const photoColl = await photos();
                for (let x of thisPost.postImgs) {
                    let currImg = await photoColl.findOne({_id: x})
                    if (!currImg) {
                        throw `Error: could not find image with id ${x}`
                    }
                    postImgs.push(currImg.imageSrc);
                }
            }
        }catch(e) {
            console.log(e);
            return res.status(404).send("could not find image");
        }
        return res.render("post", {postTitle: thisPost.postTitle, imgSrc: postImgs[0], postDescription: thisPost.postDescription, workoutType: thisPost.workoutType});
    });
export default router