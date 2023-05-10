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


//update the user info

//let update_first_user = ""
//let profile_img_src = "/public/img/default.jpg"

//try{
   
    //const imageBuffer = fs.readFileSync('public/img/default.jpg');
    
//}catch(e){
   // console.log(e)
//}



await closeConnection();
