```import {Router} from 'express';
import { ObjectId } from 'mongodb';
const router = Router();
import multer from 'multer';
import {createUser,checkUser,getUser, getUsername}  from '../data/users.js'
import help from "../helpers.js";


//route code
//const storage=multer.diskStorage({
  //  destination: function(req,file,cb)
   // {
   //     cb(null,"./public/img");
    //},
    //filename: function(req,file,cb)
    //{
       // cb(null,file.originalname);
   // }
//});

//const upload=multer({storage: storage});
router
  .route('/')
  .get(async (req, res) => {
    //code here for GET
    //check if the user is logged in
    let logged_in = false
    if(req.session.user){
       logged_in = true
    }
    return res.render('searchuser', {logged_in: logged_in})
    
  })
  
  .post(async (req, res) => {
    //code here for GET
    let logged_in = false
    if(req.session.user){
       logged_in = true
    }
    //get the user from the input form
    let userr = req.body.searchuser;
    try{
    //check if the string is a string
      let is_string = help.isStr(userr)
      if (!is_string){
       return  res.render('searchuser', {logged_in: logged_in, error: "not a string"})
      }
      //trim the user
      userr = userr.trim()
      //get the userobj
      let userobj = await getUsername(userr)
      //redirect if found the user ```
      //return res.redirect(`/search/${userr}`)
```
    }catch(e){
        // rednder the search user with the error
       return res.render('searchuser', {logged_in: logged_in, error: e })
    }
    
  })

  router
   .route('/:id')
   .get(async(req,res)=>{
   //check if logged in
    let logged_in = false
    if(req.session.user){
       logged_in = true
    }
    //get the from the userid
    let userr = req.params.id
    try{
        //check if the user string is valid string
        let is_string = help.isStr(userr)
        if (!is_string){
            //render the search user page with error if not valid
            return  res.render('searchuser', {logged_in: logged_in, error: "not a string"})
           }
           //trim
        userr = userr.trim()
        //user obj
        let userstuff = await getUsername(userr)
        //goals = "n/a"
        let goals = "N/A"
        //if the userob id is the same as the session user id just redirect to the profile its the user trying to searcg themselves up
        if(req.session.user){
        if(userstuff._id.toString() === req.session.user.id){
            return res.redirect('/profile')
        }}
        //same as profile
         let goalsempty = true
         if (userstuff.goals.length !== 0){
         goals = "";
         for(let i = 0; i < userstuff.goals.length; i++){
            goals = goals + userstuff.goals[i]
             }
        goalsempty = false
        goals = goals + ",";
    }
      let aboutme = "N/A"
      if(userstuff.aboutMe.length !== 0){
       aboutme = userstuff.aboutMe
  }
  //render profile with the userid field, streak, aboutme and stuff
       return res.render('profile', {userid: userstuff.username,  streak: userstuff.userStreak, aboutme: aboutme, goals: goals,  logged_in: logged_in, goalsempty: true, following: userstuff.following.length, followers: userstuff.followers.length})

    }catch(e){
        //else error
        return res.render('searchuser', {logged_in: logged_in, error: e })
    }
     
   })
   
   

      



export default router```