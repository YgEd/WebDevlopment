import { ObjectId } from "mongodb";
import { users } from "../config/mongoCollections.js";
import * as help from "../helpers.js";
import validate from "validate-date";

export const createUser = async (
  username,
  userPassword,
  DOB,
  //userPosts,
  //userStreak,
  aboutMe,
  //groupsOwned,
  goals
) => {
  let fun = "createUser";
  //String test
  if (
    !help.isStr(username) ||
    !help.isStr(userPassword) ||
    !help.isStr(aboutMe)
  ) {
    help.err(fun, "non-string input");
  }

  //check if username is already used

  //get users db
  const userCollection = await users();

  //find if user exists with given username
  const findUser = await userCollection.findOne({ username: username.trim() });

  //check if if user is found with same username
  if (findUser != null) {
    help.err(fun, "username: '" + username.trim() + "' is already in use");
  }

  //Array test
  if (!Array.isArray(goals)) {
    help.err(fun, "input goals is not an array");
  }

  //Make sure all elements of goals is string
  for (let i = 0; i < goals.length; i++) {
    if (!help.isStr(goals[i])) {
      help.err(fun, "goals has a non-string element");
    }
  }

  //Test to ensure valid DOB format
  if (!validate(DOB, "boolean", "mm/dd/yyyy")){
    err(fun, "DOB is not in proper MM/DD/YYYY form");
  }



  //get current date
  const date = new Date();

  //numerical form of inputted month, day, and year
  let inMonth = parseInt(DOB.substring(0, 2));
  let inDay = parseInt(DOB.substring(3, 5));
  let inYear = parseInt(DOB.substring(6, 10));
  
  //Tests to ensure if DOB is at least 18 years of age
  if (inYear > 2005 || inMonth > date.getMonth() || inDay > date.getDay()){
    err(fun, "DOB is not 18 years or older");
  }
  


  let userPosts = [];
  let userStreak = 0;
  let groupsOwned = [];

  //create user object to add with trimmed and lowercase fields
  let user = {
    username: username.trim().toLowerCase(),
    userPassword: userPassword.trim(),
    userPosts,
    userStreak,
    aboutMe: aboutMe.trim(),
    groupsOwned,
    goals,
  };

  //insert created user object into the db
  const insertInfo = await userCollection.insertOne(user);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    err(fun, "could not add user");
  }

  // //convert id to string
  // const id = insertInfo.insertedId.toString();

  return user;
};
