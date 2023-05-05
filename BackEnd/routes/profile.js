import {Router} from 'express';
import { ObjectId } from 'mongodb';
const router = Router();
import multer from 'multer';
import {createUser,checkUser,getUser}  from '../data/users.js'


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
    let logged_in = false;
    if(req.session.user){
        logged_in = true
    }
    
    const userstuff = await getUser(req.session.user.id)
    let goals = "N/A"
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
    return res.render('profile', {userid: userstuff.username,  streak: userstuff.userStreak, aboutme: aboutme, goals: goals,  logged_in: true, goalsempty: true, following: userstuff.following.length, followers: userstuff.followers.length, isprofile: true})
  })

 router.get('/edit', async (req, res) =>{
        const userstuff = await getUser(req.session.user.id)
        return res.render('editprofile', {logged_in: true, userid: userstuff.username})
     })
router.get('/get-analytics', async(req,res) =>{
    res.render('analytics');

})
router.get('/analytics', async (req, res) =>{
    
      const data = [100, 50, 300, 40, 350, 250]; // assuming this is coming from the database
      const data2 = [0.5, 10, 1, 3, 4, 5]
      let json_obj = {
        data: data,
        data2: data2
      }
      res.send(json_obj);
      //return res.render('editprofile', {logged_in: true, userid: userstuff.username})
   })
   
router.post('/edit', (req, res, next) => {
        upload.single('photo')(req, res, (err) => {
          if (err) {
            // handle the error
            return next(err);
          }
          // handle the request
          console.log(req.body);
          console.log(req.file);
          res.send('File uploaded successfully');
        });
      });
      



export default router