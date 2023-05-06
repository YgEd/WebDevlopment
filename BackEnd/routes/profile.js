import {Router} from 'express';
import { ObjectId } from 'mongodb';
const router = Router();
import multer from 'multer';
import {createUser,checkUser,getUser,updateUser}  from '../data/users.js'
import {photos} from "../config/mongoCollections.js";
import * as help from "../helpers.js"
import {uploadPhoto, upload, getPhotoSrc } from '../data/photos.js';




router
  .route('/')
  .get(async (req, res) => {
    //code here for GET
    let imgSrc;
    try {
      let logged_in = false;
      if(req.session.user){
          logged_in = true
      }
      //console.log(req.session.user)
      const userstuff = await getUser(req.session.user.user_id)
      let goals = userstuff.goals
      let aboutme = "N/A"
      if(userstuff.aboutMe.length !== 0){
        aboutme = userstuff.aboutMe
      }
      if (userstuff.profileimg == "default" || !ObjectId.isValid(userstuff.profileimg)) {
        imgSrc = "/public/img/cutedog.jpg"
      }
      else {
        imgSrc = await getPhotoSrc(userstuff.profileimg)
      }
      return res.render('profile', {name: `${userstuff.firstName} ${userstuff.lastName}`,  streak: userstuff.userStreak, description: aboutme, goals: goals,  logged_in: true, isCurr: true, imgSrc: imgSrc})
    }catch (e) {
      return res.status(500).render("error", {message: e});
    }
  })

router
  .route('/edit')
  .get(async (req, res) =>{
      let userstuff;
      let imgSrc;
      try {
        userstuff = await getUser(req.session.user.user_id)
      } catch(e) {
        return res.status(400).send("could not get user");
      }

      try {
        if (userstuff.profileimg != "default" && ObjectId.isValid(userstuff.profileimg)) { 
          const photoColl = await photos();
          let profilePic = await photoColl.findOne({_id: new ObjectId(userstuff.profileimg)})
          imgSrc = profilePic.imageSrc
        }
        else {
          imgSrc = "/public/img/cutedog.jpg"
        }
      }catch(e) {
        console.log(e);
        return res.status(500).send("could not get profile picture");
      }
      return res.render('editprofile', {logged_in: true, userid: userstuff.username, imgsrc: imgSrc, aboutme: userstuff.aboutMe, goals:userstuff.goals})
    })
   .post(upload.single('photo'), async (req, res, next) => {
        let fun = "editProfile"
        const updates = req.body;
        let userId = req.session.user.user_id;
        let aboutme = updates.aboutme;
        let goals = updates.goals;
        let badData = {};
        let profileimg;
        let userInfo;

        try {
          //none of these should ever really error because its just pulled from the cookie
          if(!userId) {
              help.err(fun, "could not get user id");
          }
          else if(!ObjectId.isValid(userId)){
              help.err(fun, "userId is not valid")
          }
        }catch (e) {
          console.log(e);
          badData.userId = e;
        }

        try {
          userInfo = await getUser(req.session.user.user_id);
        }catch(e) {
          res.status(400).send("could not get user")
        }

        try {
          if(!aboutme) {
            aboutme = ""
          }
          else {
            if (typeof aboutme !== "string") {
              help.err(fun, "about me must be a string");
            }
          }
        }catch(e) {
          console.log(e);
          badData.aboutMe = e
        }
        try {
          if(!goals) {
            goals = [];
          }
          else if (!Array.isArray(goals)) {
            help.err(fun, "goals must be an array");
          }
          else {
            for (let x of goals) {
              if (typeof x !== "string") {
                help.err(fun, "goals must all be strings");
              }
            }
          }
        }catch(e) {
          console.log(e);
          badData.goals = e
        }
        try {
          if (!req.file) {
            profileimg = userInfo.profileimg
          }
        else {
            //upload image
            //create doc for mongo storage
            /*let doc = {
                imageName: req.file.originalname,
                //creates src link using bufferdata
                imageSrc: `data:${req.file.fieldname};base64,${req.file.buffer.toString('base64')}`
            };
            const photoColl = await photos();
            const insertPhoto = await photoColl.insertOne(doc);
            //test to see if insert was successful
            if (!insertPhoto.acknowledged || !insertPhoto.insertedId) {
              throw "error could not upload image"
            }
            else {
              profileimg = insertPhoto.insertedId.toString();
            }*/
            profileimg = await uploadPhoto(req.file);
        } 
        }catch(e) {
          console.log(e);
          badData.profileimg = e
        }

        try {
          const updatedUser = await updateUser(
            userInfo._id,
            userInfo.username,
            userInfo.firstName,
            userInfo.lastName,
            userInfo.email,
            userInfo.userPosts,
            userInfo.userStreak,
            aboutme,
            userInfo.groupsOwned,
            userInfo.groupMembers,
            profileimg,
            goals,
            userInfo.following,
            userInfo.followers
          );
          //console.log(updatedUser);

          res.redirect("/profile/");

        }catch(e) {
          console.log(e);
          return res.status(500).render("error", {message: e});
        }

      
    });
  router
  .route('/:userid')
  .get(async (req, res) => {
    let userId = req.params.userid
    let imgSrc;
    let userInfo;
    let isCurr = false
    console.log(userId);
    try {
      if (!userId) {
        userId = req.session.user.user_id
      }
      if (!ObjectId.isValid(userId)) {
        userId = req.session.user.user_id
      }
      if (userId == req.session.user.user_id) {
        isCurr = true;
      }
    }catch(e) {
      return res.status(400).render("error", {message: e});
    }
    try {
      userInfo = await getUser(userId);
      if (!userInfo) {
        throw `could not retreive user info`
      }
      if (userInfo.profileimg == "default") {
        imgSrc = "/public/img/cutedog.jpg"
      }
      else {
        imgSrc = await getPhotoSrc(userInfo.profileimg)
      }
      console.log(`${userInfo.firstName} ${userInfo.lastName}`)
      res.render("profile", {name: `${userInfo.firstName} ${userInfo.lastName}`, imgSrc: imgSrc, description: userInfo.aboutMe, streak: userInfo.streak, goals: userInfo.goals, isCurr: isCurr })
    }catch(e) {
      return res.status(400).render("error", {message: e});
    }
  });

export default router