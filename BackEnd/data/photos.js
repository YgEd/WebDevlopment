import multer from 'multer';
import { ObjectId } from 'mongodb';
import { photos } from '../config/mongoCollections.js';

//sets up multer upload
//use upload.single(inputName) for single files
//use upload.array(inputArrayName, numberOfFiles) for multiple
const upload = multer({
    storage: multer.memoryStorage(),
    //max 5 files of 10mb
    /*limits: {fields: 3,
            fileSize: 10 * 1024 * 1024,
            fieldSize: 10 * 1024 * 1024},
    fileFilter: function (req, res, file, cb) {
        //console.log(file.mimetype);
        if (file.mimetype != "image/jpg" && file.mimetype != "image/png" && file.mimetype != "image/jpeg") {
            return cb(new Error("Files must be of type jpg, jpeg, or png"));
            //return res.status(400).render('error', {title: "error", message:e})
        }
        cb(null, true);
    }*/
});

//takes in imgObj (req.file)
//multer set up should already block bad file types from getting through
//re checked anyway just cuz
//uploads to mongo with image name and imageSrc, imageSrc contains base64 encoded image and can be thrown right into html for display
//function returns the photos _id
const uploadPhoto = async (imgObj) => {
    const fun = "uploadPhoto"
    if (!imgObj) {
      err(fun, "must provide imgObj");
    }
    
    if (imgObj.mimetype != "image/png" && imgObj.mimetype != "image/jpg" && imgObj.mimetype != "image/jpeg") {
        err(fun, "File muse be an image of type png, jpg, or jpeg");
    }

    if (imgObj.size > 10 * 1024 * 1024) {
        err(fun, "file cannot be larger than 10mb")
    }
    
    let doc = {
      imageName: imgObj.originalname,
      //creates src link using bufferdata
      imageSrc: `data:${imgObj.mimetype};base64,${imgObj.buffer.toString('base64')}`
    };

    const photoColl = await photos();
    const insertPhoto = await photoColl.insertOne(doc);

    if (!insertPhoto.acknowledged || !insertPhoto.insertedId) {
        throw "error could not upload image"
    }

    return insertPhoto.insertedId;
  }

const getPhotoSrc = async (imgId) => {
    const photoColl = await photos()
    let img = await photoColl.findOne({_id: imgId})
    if (!img) {
        throw `Error: could not find image with id ${imgId}`
    }
    return img.imageSrc
}
  
  export {uploadPhoto, upload, getPhotoSrc}