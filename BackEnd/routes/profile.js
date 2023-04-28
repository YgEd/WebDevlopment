import {Router} from 'express';
import { ObjectId } from 'mongodb';
const router = Router();

//route code
router
  .route('/')
  .get(async (req, res) => {
    //code here for GET
    console.log(req.session.user.email)
    return res.render('profile', {name: req.session.user.email,  streak: req.session.user.streak, aboutme: req.session.user.aboutMe, goals: req.session.user.goals, aboutme : req.session.user.aboutMe })
  })
  .post(async (req, res) => {
    //code here for POST
    
  });



export default router