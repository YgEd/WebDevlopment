import {Router} from 'express';
import { ObjectId } from 'mongodb';
const router = Router();
import multer from 'multer';
import {createUser,checkUser,getUser,updateUser,deleteAccountAndRemoveAllPosts}  from '../data/users.js'
import {photos} from "../config/mongoCollections.js"
import help from "../helpers.js"
import {uploadPhoto, upload, getPhotoSrc, getPhotoname } from '../data/photos.js';

import { getAnalytics, getPostByUser } from '../data/posts.js';

import recData from '../data/recommendations.js'
import xss from 'xss'

router
  .route('/')
  .get(async (req, res) => {
    let targetUser;
    var imgSrc
    let workoutRec
    let userPosts
    //code here for GET
    if (!req.session.user){
      console.log("user not authenticated");
      return res.redirect("/login")
    }


    try {
      //get user obj
      targetUser = await getUser(req.session.user.user_id);


      //if user has a profile picture, get the imageSrc
      if (!targetUser.profileimg || targetUser.profileimg == "default") {
        imgSrc = "/public/img/default.jpg";
      } else {
        imgSrc = await getPhotoSrc(targetUser.profileimg);
      }
      workoutRec = await recData.getRandomRec()
      if (targetUser.userPosts.length != 0) {
        userPosts = await getPostByUser(req.session.user.user_id, 50)
        for (let x of userPosts) {
          x._id = x._id.toString()
        }
      }
    }catch(e) {
      console.log(e);
      return res.status(500).render('error' )
    }
    //get user obj
    targetUser = await getUser(req.session.user.user_id);
    let noimg = true
    //if user has a profile picture, get the imageSrc
    var photo_name = "N/A"
    if (!targetUser.profileimg || targetUser.profileimg == "default") {
      var imgSrc = "/public/img/default.jpg";
    } else {
      var imgSrc = await getPhotoSrc(targetUser.profileimg);
       noimg = false
      photo_name = await getPhotoname(targetUser.profileimg)
      console.log()
    }
  
    workoutRec = await recData.getRandomRec()
   // console.log(req.session.user.profileimg)
    //get the posts collection 
    try{
    let streak_param = 0
    let getthepost= await getPostByUser(req.session.user.user_id, 10000)
    let old_date = "N/A"
    if(getthepost.length !== 0){
    let new_date = new Date()
    for(let i = 0; i < getthepost.length; i++){
    let  postime = getthepost[i].postTime 
    if(i > 0){
      old_date = getthepost[i-1].postTime
      const timediff = Math.abs(Date.UTC(old_date.getUTCFullYear(), old_date.getUTCMonth(), old_date.getUTCDate()) - 
      Date.UTC(postime.getUTCFullYear(), postime.getUTCMonth(), postime.getUTCDate()));
      const diffDay = Math.ceil(timediff/ (1000 * 60 * 60 * 24));
      if(diffDay === 0){
        continue
      }
    }
    const diffTime = Math.abs(Date.UTC(new_date.getUTCFullYear(), new_date.getUTCMonth(), new_date.getUTCDate()) - 
                         Date.UTC(postime.getUTCFullYear(), postime.getUTCMonth(), postime.getUTCDate()));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if(i > 0 && diffDays >= 2){
      break
    }
    if(diffDays < 2){
      console.log(streak_param)
      streak_param = streak_param + 1
    }else{
      console.log("hmm")
      streak_param = 0
    }
    new_date.setDate(new_date.getDate() - 1); // subtract one day
  }
    }else{
      streak_param = 0
    }
    targetUser = await updateUser( targetUser._id,
      targetUser.username,
      // userInfo.firstName,
      // userInfo.lastName,
      targetUser.email,
      targetUser.userPosts,
      streak_param,
      targetUser.aboutMe,
      targetUser.groupsOwned,
      targetUser.groupMembers,
      targetUser.profileimg,
      targetUser.goals,
      targetUser.following,
      targetUser.followers)
      return res.render('profile', {title: "my profile", name: req.session.user.firstName,  streak: targetUser.userStreak, aboutme: targetUser.aboutMe, goals: targetUser.goals, imgSrc: imgSrc, isCurr: true, logged_in: true, followers: targetUser.followers.length, following: targetUser.following.length, workout: workoutRec, 
  photo_name: photo_name, noimg: noimg, userPosts: userPosts})
    }catch(e){
      return res.render('profile', {error: e})
    }

    })

  router
  .route('/edit')
  .get(async (req, res) =>{
      if (!req.session.user){
        console.log("user not authenticated");
        return res.redirect("/login")
      }
      let userstuff;
      let imgSrc;
      try {
        userstuff = await getUser(req.session.user.user_id)
      } catch(e) {
        return res.status(400).send("could not get user");
      }

      try {
        if ((userstuff.profileimg != "default") && ObjectId.isValid(userstuff.profileimg)) { 
          const photoColl = await photos();
          let profilePic = await photoColl.findOne({_id: new ObjectId(userstuff.profileimg)})
          imgSrc = profilePic.imageSrc
        }
        else {
          imgSrc = "/public/img/default.jpg"
        }
      }catch(e) {
        console.log(e);
        return res.status(500).send("could not get profile picture");
      }
      return res.render('editprofile', {title: "edit profile", logged_in: true, userid: userstuff.username, imgsrc: imgSrc, aboutme: userstuff.aboutMe, goals:userstuff.goals, logged_in: true})
    })
   .post(upload.single('photo'), async (req, res, next) => {
      if (!req.session.user){
        console.log("user not authenticated");
        return res.redirect("/login")
      }
        let fun = "editProfile"
        const updates = req.body;
        let userId = req.session.user.user_id;
        let aboutme = req.body.aboutme;
        let goals = req.body.goals;
        let badData = {};
        let profileimg;
        let userInfo;

        try {
          xss(aboutme)
          //xss through all goals
          for(let i = 0; i < goals.length; i++) {
            xss(goals[i])
          }
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
          let aboutlines = aboutMe.split('\n')
          let len = aboutMe.length - (aboutlines.length - 1);
          if (len > 300) {
            help.err(fun, "about me can be a max of 300 characters")
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
              let xlines = x.split('\n')
              let len = x.length - (xlines.length - 1);
              if (len > 50) {
                help.err(fun, "goals can be a max of 50 characters");
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
            // userInfo.firstName,
            // userInfo.lastName,
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
          return res.status(500).render("error", {title: "error", message: e});
        }

      
    });
    router.get('/get-analytics', async(req,res) =>{
      if (!req.session.user){
        console.log("user not authenticated");
        return res.redirect("/login")
      }
      console.log("get analytics route hit")
      res.render('analytics', {title: "analytics", logged_in: true});
  
  })
    router.get('/analytics', async (req, res) =>{
      if (!req.session.user){
        console.log("user not authenticated");
        return res.redirect("/login")
      }
      console.log("analytics route hit")
          //const data = [100, 50, 300, 40, 350, 250]; // assuming this is coming from the database
          //const data2 = [0.5, 10, 1, 3, 4, 5]
        try{
         let week_obj = await help.return_week_values(req.session.user.user_id)
         let month_obj = await help.return_month_values(req.session.user.user_id)
         let year_obj = await help.return_year_values(req.session.user.user_id)
         let new_obj = {data: week_obj.data, data2: week_obj.data2, month_entries: month_obj.month_entries, 
          array_val: month_obj.array_val , shuffledMonths: year_obj.shuffledMonths, shuffledcounter: year_obj.shuffledcounter }
          return res.send(new_obj)

         }catch(e){
            return res.send({e: e})
         }
         
         // return res.render('editprofile', {logged_in: true, userid: userstuff.username})
       
      })
  router
  .route('/:userid')
  .get(async (req, res) => {
    if (!req.session.user){
      console.log("user not authenticated");
      return res.redirect("/login")
    }
    let userId = req.params.userid
    let imgSrc;
    let userInfo;
    let isCurr = false
    let logged_in = true
    let userPosts;
    try {
      //if no user id is passed in, use the current user
      if (!userId) {
        userId = req.session.user.user_id;
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
      let noimg = true
      let photo_name
      if (!userInfo.profileimg || userInfo.profileimg == "default") {
        imgSrc = "/public/img/default.jpg"
        photo_name = "N/A"

      }
      else {
        noimg = false
        photo_name = await getPhotoname(userInfo.profileimg)
        imgSrc = await getPhotoSrc(userInfo.profileimg)
      }
      
      if (userInfo.userPosts.length != 0) {
        userPosts = await getPostByUser(userId, 50)
        for (let x of userPosts) {
          x._id = x._id.toString()
        }
      }
      
      let followers = userInfo.followers.length
      let following = userInfo.following.length

      //see if the current user is following the user
      let isFollowing = false

      if (req.session.user) {
        let currUser = await getUser(req.session.user.user_id)
        for (let x of currUser.following) {
          if (x.toString() == userId.toString()) {
            isFollowing = true
          }
        }
      }

      console.log("AHhhhhhhhhhhh " + isFollowing)
      console.log("isCurr = " + isCurr)
      console.log(`${userInfo.firstName} ${userInfo.lastName}`)
      res.render("profile", {title: "profile page", name: userInfo.firstName, imgSrc: imgSrc, aboutMe: userInfo.aboutMe, streak: userInfo.userStreak, goals: userInfo.goals, isCurr: isCurr, logged_in: logged_in, followers: followers, following: following, isFollowing: isFollowing, username: userInfo.username, userPosts: userPosts, photo_name: photo_name, noimg: noimg})
      
    }catch(e) {
      return res.status(400).render("error", {message: e});
    }
  });
  router.post("/delete", async (req, res) => {
    console.log("/user/delete")
    //ensure user is logged in
    if (!req.session.user){
        console.log("user not authenticated");
        return res.redirect("/login")
    }

    //ensure data was sent
    if (!req.body){
        console.log("no data sent");
        return res.redirect("/profile")
    }

    
    let userId = req.session.user.user_id;

    

    try{
        //delete user
        await deleteAccountAndRemoveAllPosts(userId);

        return res.send({response: true})
    } catch (error) {
        console.log(error);
        return res.send({response: false})
    }


})

      



export default router