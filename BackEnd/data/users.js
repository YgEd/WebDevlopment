import {ObjectId} from "mongodb";
import {users} from "../config/mongoCollections.js"
import * as help from "../helpers.js"


export const createUser = async (
    username,
    userPassword,
    //userPosts,
    //userStreak,
    aboutMe,
    //groupsOwned,
    goals
) => {
    let fun = "createUser"
    //String test
    if (!help.isStr(username) || !help.isStr(userPassword) || !help.isStr(aboutMe)){
        help.err(fun, "non-string input")
    }

    //check if username is already used
    /////////////////////TODO
    //////////

    //Array test
    if (!Array.isArray(goals)){
        help.err(fun, "input goals is not an array")
    }

    //Make sure all elements of goals is string
    for (let i=0; i<goals.length; i++){
        if (!help.isStr(goals[i])){
            help.err(fun, "goals has a non-string element")
        }
    }

    let userPosts = [];
    let userStreak = 0;
    let groupsOwned = [];

    let user = {
        username,
        userPassword,
        userPosts,
        userStreak,
        aboutMe,
        groupsOwned,
        goals
    }

    //get users db
    const userCollection = await users();

    //insert created user object into the db
    const insertInfo = await userCollection.insertOne(user);
    if (!insertInfo.acknowledged || !insertInfo.insertedId){
        err(fun, "could not add user");
    }

    // //convert id to string
    // const id = insertInfo.insertedId.toString();

    return user
}