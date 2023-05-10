// You can add and export any helper functions you want here - if you aren't using any, then you can just leave this file as is
/*

1. Create a band of your choice.
2. Log the newly created band. (Just that band, not all bands)
3. Create another band of your choice.
4. Query all bands, and log them all
5. Create the 3rd band of your choice.
6. Log the newly created 3rd band. (Just that band, not all bands)
7. Rename the first band
8. Log the first band with the updated name. 
9. Remove the second band you created.
10. Query all bands, and log them all
11. Try to create a band with bad input parameters to make sure it throws errors.
12. Try to remove a band that does not exist to make sure it throws errors.
13. Try to rename a band that does not exist to make sure it throws errors.
14. Try to rename a band passing in invalid data for the newName parameter to make sure it throws errors.
15. Try getting a band by ID that does not exist to make sure it throws errors.

*/
import { dbConnection, closeConnection }  from './BackEnd/config/mongoConnection.js';
const db = await dbConnection();
// Use the named exports as properties of the imported object
await db.dropDatabase();
import fs from 'fs';

import {createUser,checkUser, getUser, updateUser} from './BackEnd/data/users.js';
import {createPost} from './BackEnd/data/posts.js'
import { uploadPhoto } from './BackEnd/data/photos.js';
//create a bunch of usrrs
let first_user = ""
let second_user = ""
let third_user = ""
let fourth_user = ""
try{
     first_user = await createUser("Michael123", "Michael", "Smith", "smith@gmail.com", "Sunnu@3030", "1990-5-30")
}catch(e){
    console.log(e)
}

try{
     second_user = await createUser("Sarah12", "sarah", "parker", "parker12@gmail.com", "Crazy@123", "1995-5-30")
}catch(e){
    console.log(e)
}

try{
     third_user = await createUser("Fuslie12", "leslie", "chen", "chen123@gmail.com", "Crazy@123", "1992-10-11")
}catch(e){
    console.log(e)
}

try{
     fourth_user = await createUser("Jennierubyjane", "jenny", "kim", "kim96@gmail.com", "Crazy@123", "1996-10-11")
}catch(e){
    console.log(e)
}




let update_first_user = ""
let profile_img_src = "/public/img/filled_heart.jpg"


try{
    let photo_obj = {}
    let imageBuffer = fs.readFileSync('public/img/filled_heart.png');
    let original_name = profile_img_src
    let encoding = imageBuffer.size;
    let mimeType = 'image/png'
    photo_obj.fieldname = 'photo'
    photo_obj.originalname = original_name
    photo_obj.buffer = imageBuffer
    photo_obj.encoding = encoding
    photo_obj.mimetype = mimeType
    let getphoto = await uploadPhoto(photo_obj)
    let updateduser = await updateUser(first_user._id, first_user.username, first_user.email, first_user.userPosts, first_user.userStreak, "trying to live a healthy fulfilling life", first_user.groupsOwned, first_user.groupMembers, getphoto, ["Work out", "stay fit", "get healthy"], first_user.following, first_user.followers)
    

    
}catch(e){
    console.log(e)
}

try{
    let photo_obj = {}
    let imageBuffer = fs.readFileSync('public/img/sarah.jpg');
    let original_name = profile_img_src
    let encoding = imageBuffer.size;
    let mimeType = 'image/jpg'
    photo_obj.fieldname = 'photo'
    photo_obj.originalname = original_name
    photo_obj.buffer = imageBuffer
    photo_obj.encoding = encoding
    photo_obj.mimetype = mimeType
    let getphoto = await uploadPhoto(photo_obj)
    let secondupdate = await updateUser(second_user._id, second_user.username, second_user.email, second_user.userPosts, second_user.userStreak, "outdoorsy person and health freak!", second_user.groupsOwned, second_user.groupMembers, getphoto, ["hike the mt.everest", "run a 10k"], second_user.following, second_user.followers)
    

    
}catch(e){
    console.log(e)
}


try{
    let photo_obj = {}
    let imageBuffer = fs.readFileSync('public/img/fuslie.jpg');
    let original_name = profile_img_src
    let encoding = imageBuffer.size;
    let mimeType = 'image/jpg'
    photo_obj.fieldname = 'photo'
    photo_obj.originalname = original_name
    photo_obj.buffer = imageBuffer
    photo_obj.encoding = encoding
    photo_obj.mimetype = mimeType
    let getphoto = await uploadPhoto(photo_obj)
    let thirdupdate = await updateUser(third_user._id, third_user.username, third_user.email, third_user.userPosts, third_user.userStreak, "Happy go lucky person who wants a nice summer body", third_user.groupsOwned, third_user.groupMembers, getphoto, ["do pilates"], third_user.following, third_user.followers)
    

    
}catch(e){
    console.log(e)
}

try{
    let photo_obj = {}
    let imageBuffer = fs.readFileSync('public/img/girlpink.jpg');
    let original_name = profile_img_src
    let encoding = imageBuffer.size;
    let mimeType = 'image/jpg'
    photo_obj.fieldname = 'photo'
    photo_obj.originalname = original_name
    photo_obj.buffer = imageBuffer
    photo_obj.encoding = encoding
    photo_obj.mimetype = mimeType
    let getphoto = await uploadPhoto(photo_obj)
    let fourthupdate = await updateUser(fourth_user._id, fourth_user.username, fourth_user.email, fourth_user.userPosts, fourth_user.userStreak, "Just vibes tbh", fourth_user.groupsOwned, fourth_user.groupMembers, getphoto, [], fourth_user.following, fourth_user.followers)
    

    
}catch(e){
    console.log(e)
}



//get the post stuff 

try{
    let list = []
    let photo_obj = {}
    let imageBuffer = fs.readFileSync('public/img/running-guy-on-road.jpg');
    let original_name = profile_img_src
    let encoding = imageBuffer.size;
    let mimeType = 'image/jpg'
    photo_obj.fieldname = 'photo'
    photo_obj.originalname = original_name
    photo_obj.buffer = imageBuffer
    photo_obj.encoding = encoding
    photo_obj.mimetype = mimeType
    let uploadphoto = await uploadPhoto(photo_obj)
    list.push(uploadphoto)
    let uploadpost = await createPost(first_user._id, "first day out", "running", "ran 5 miles", list, [] )


}catch(e){
   console.log(e)
}

try{
    let list = []
    let photo_obj = {}
    let imageBuffer = fs.readFileSync('public/img/mountaintop.jpg');
    let original_name = profile_img_src
    let encoding = imageBuffer.size;
    let mimeType = 'image/jpg'
    photo_obj.fieldname = 'photo'
    photo_obj.originalname = original_name
    photo_obj.buffer = imageBuffer
    photo_obj.encoding = encoding
    photo_obj.mimetype = mimeType
    let uploadphoto = await uploadPhoto(photo_obj)
    list.push(uploadphoto)
    let uploadpost = await createPost(first_user._id, "at the mountain", "running", "ran 5 miles", list, [] )


}catch(e){
   console.log(e)
}

try{
    let list = []
    let photo_obj = {}
    let imageBuffer = fs.readFileSync('public/img/OIP.jpg');
    let original_name = profile_img_src
    let encoding = imageBuffer.size;
    let mimeType = 'image/jpg'
    photo_obj.fieldname = 'photo'
    photo_obj.originalname = original_name
    photo_obj.buffer = imageBuffer
    photo_obj.encoding = encoding
    photo_obj.mimetype = mimeType
    let uploadphoto = await uploadPhoto(photo_obj)
    list.push(uploadphoto)
    let uploadpost = await createPost(second_user._id, "working out", "lifting", "worked out so much today", list, [] )


}catch(e){
   console.log(e)
}

try{
    let list = []
    let photo_obj = {}
    let imageBuffer = fs.readFileSync('public/img/walking.jpg');
    let original_name = profile_img_src
    let encoding = imageBuffer.size;
    let mimeType = 'image/jpg'
    photo_obj.fieldname = 'photo'
    photo_obj.originalname = original_name
    photo_obj.buffer = imageBuffer
    photo_obj.encoding = encoding
    photo_obj.mimetype = mimeType
    let uploadphoto = await uploadPhoto(photo_obj)
    list.push(uploadphoto)
    let uploadpost = await createPost(second_user._id, "working out", "lifting", "worked out so much today", list, [] )


}catch(e){
   console.log(e)
}

try{
    let list = []
    let photo_obj = {}
    let imageBuffer = fs.readFileSync('public/img/kayaking.jpg');
    let original_name = profile_img_src
    let encoding = imageBuffer.size;
    let mimeType = 'image/jpg'
    photo_obj.fieldname = 'photo'
    photo_obj.originalname = original_name
    photo_obj.buffer = imageBuffer
    photo_obj.encoding = encoding
    photo_obj.mimetype = mimeType
    let uploadphoto = await uploadPhoto(photo_obj)
    list.push(uploadphoto)
    let uploadpost = await createPost(third_user._id, "went kayaking", "other", "worked out so much today", list, [] )


}catch(e){
   console.log(e)
}

try{
    let list = []
    let photo_obj = {}
    let imageBuffer = fs.readFileSync('public/img/mountainclimbing.jpg');
    let original_name = profile_img_src
    let encoding = imageBuffer.size;
    let mimeType = 'image/jpg'
    photo_obj.fieldname = 'photo'
    photo_obj.originalname = original_name
    photo_obj.buffer = imageBuffer
    photo_obj.encoding = encoding
    photo_obj.mimetype = mimeType
    let uploadphoto = await uploadPhoto(photo_obj)
    list.push(uploadphoto)
    let uploadpost = await createPost(third_user._id, "tb to mountain climbing", "other", "had a blast!", list, [] )


}catch(e){
   console.log(e)
}

try{
    let list = []
    let photo_obj = {}
    let imageBuffer = fs.readFileSync('public/img/running-guy-on-road.jpg');
    let original_name = profile_img_src
    let encoding = imageBuffer.size;
    let mimeType = 'image/jpg'
    photo_obj.fieldname = 'photo'
    photo_obj.originalname = original_name
    photo_obj.buffer = imageBuffer
    photo_obj.encoding = encoding
    photo_obj.mimetype = mimeType
    let uploadphoto = await uploadPhoto(photo_obj)
    list.push(uploadphoto)
    let uploadpost = await createPost(fourth_user._id, "love running with family", "running", "good workout", list, [] )


}catch(e){
   console.log(e)
}

try{
    let list = []
    let photo_obj = {}
    let imageBuffer = fs.readFileSync('public/img/OIP.jpg');
    let original_name = profile_img_src
    let encoding = imageBuffer.size;
    let mimeType = 'image/jpg'
    photo_obj.fieldname = 'photo'
    photo_obj.originalname = original_name
    photo_obj.buffer = imageBuffer
    photo_obj.encoding = encoding
    photo_obj.mimetype = mimeType
    let uploadphoto = await uploadPhoto(photo_obj)
    list.push(uploadphoto)
    let uploadpost = await createPost(fourth_user._id, "working out", "lifting", "tiring", list, [] )


}catch(e){
   console.log(e)
}














await closeConnection();
