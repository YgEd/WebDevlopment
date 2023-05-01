import {Router} from 'express';
import {createUser,checkUser, getUser }  from '../data/users.js'
import { ObjectId } from 'mongodb';
const router = Router();
import multer from 'multer';
import { userData } from '../data/index.js';

//route code
const storage=multer.diskStorage({
    destination: function(req,file,cb)
    {
        cb(null,"./public/img");
    },
    filename: function(req,file,cb)
    {
        cb(null,file.originalname);
    }
});

const upload=multer({storage: storage});
router
  .route('/')
  .get(async (req, res) => {
    //code here for GET
    let logged_in = false;
    if(req.session.user){
        logged_in = true
    }
    const userstuff = await getUser(req.session.user.emailAddress)
    console.log(userData)
    return res.render('profile', {userid: req.session.user.username,  streak: req.session.user.streak, aboutme: req.session.user.aboutMe, goals: req.session.user.goals,  logged_in: true})
  })

 router.get('/edit', async (req, res) =>{
        return res.render('editprofile', {logged_in: true, userid:req.session.user.username})
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