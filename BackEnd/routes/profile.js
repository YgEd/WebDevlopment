import {Router} from 'express';
import { ObjectId } from 'mongodb';
const router = Router();
import multer from 'multer';
import { recsData } from '../data/index.js';
import helper from "../helpers.js"
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
    let recsList = await recsData.getAllRecs()
    return res.render('profile', {name: req.session.user.email,  streak: req.session.user.streak, aboutme: req.session.user.aboutMe, goals: req.session.user.goals, aboutme : req.session.user.aboutMe , logged_in: true, workout: helper.getRandomItem(recsList) })
  })

 router.get('/upload', async (req, res) =>{
        return res.render('image/upload', {logged_in: true})
     })
   
router.post('/upload', (req, res, next) => {
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