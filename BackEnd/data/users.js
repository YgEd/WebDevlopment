import { ObjectId } from "mongodb";
import { users } from "../config/mongoCollections.js";
import * as help from "../helpers.js";
import bcrypt from 'bcrypt';
import validation from '../helpers.js'


//creates user (hashes password using md5)
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
  //funcion name to use for error throwing
  let fun = "createUser";

  //String test
  ///MAKE SURE TO HASH PASSWORDS LATER
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

  //search for lower case instance of username as well
  const findUserLower = await userCollection.findOne({
    username: username.trim().toLowerCase(),
  });

  //check if if user is found with same username
  if (findUser != null || findUserLower != null) {
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
  if (!validate(DOB, "boolean", "mm/dd/yyyy")) {
    help.err(fun, "DOB is not in proper MM/DD/YYYY form");
  }

  //get current date
  const date = new Date();

  //numerical form of inputted month, day, and year
  let inMonth = parseInt(DOB.substring(0, 2));
  let inDay = parseInt(DOB.substring(3, 5));
  let inYear = parseInt(DOB.substring(6, 10));

  //Tests to ensure if DOB is at least 18 years of age

  if (!(inYear <= date.getFullYear() - 18)) {
    help.err(fun, "DOB is not 18 years or older: year is too young");
  }

  if (inYear == date.getFullYear() - 18 && inMonth > date.getMonth() + 1) {
    help.err(fun, "DOB is not 18 years or older: year and month is too young");
  }

  if (
    inMonth == date.getMonth() + 1 &&
    inYear == date.getFullYear() - 18 &&
    inDay > date.getDate()
  ) {
    help.err(
      fun,
      "DOB is not 18 years or older: year, month, day is too young"
    );
  }

  let userPosts = [];
  let userStreak = 0;
  let groupsOwned = [];

  //create user object to add with trimmed and lowercase fields
  let user = {
    username: username.trim(),
    userPassword: md5(userPassword.trim()),
    DOB,
    userPosts,
    userStreak,
    aboutMe: aboutMe.trim(),
    groupsOwned,
    goals,
  };

  //insert created user object into the db
  const insertInfo = await userCollection.insertOne(user);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    help.err(fun, "could not add user");
  }

  return await userCollection.findOne({ _id: insertInfo.insertedId });
};

//return user by given ObjectId id
export const getUser = async (id) => {
  //function name to use for error throwing
  let fun = "getUser";
  //test if given id is a valid ObjectId type
  if (!ObjectId.isValid(id)) {
    help.err(fun, "invalid object ID");
  }

  //get users db collection
  const userCollection = await users();
  const findUser = await userCollection.findOne({ _id: id });

  //if user is not found throw error
  if (findUser == null) {
    help.err(fun, "user with ObjectId '" + id + "' wasn't found");
  }

  return findUser;
};

//returns array of users
export const getAllUsers = async () => {
  //function name to use for error throwing
  let fun = "getAllUsers";
  //get users db collection
  const userCollection = await users();

  //test if userCollection is null
  if (userCollection == null) {
    help.err(fun, "could not get users");
  }

  //put db in an array
  let userList = await userCollection.find({}).toArray();

  //return array of users
  return userList;
};

//removes User from the db from id
export const removeUser = async (id) => {
  //function name to use for error throwing
  let fun = "removeUser";
  //test if given id is a valid ObjectId type
  if (!ObjectId.isValid(id)) {
    help.err(fun, "invalid object ID");
  }

  //get users db collection
  const userCollection = await users();
  const deleteInfo = await userCollection.findOneAndDelete({ _id: id });

  if (deleteInfo.lastErrorObject.n == 0) {
    help.err(fun, "could not delete user with id '" + id + "'");
  }

  return "user with id '" + id + "' successfully deleted";
};

export const updateUser = async (
  id,
  username,
  userPassword,
  //DOB,
  userPosts,
  userStreak,
  aboutMe,
  groupsOwned,
  goals
) => {
  //function name to use for error throwing
  let fun = "updateUser";

  //test if string inputs are valid non-empty strings
  if (
    !help.isStr(username) ||
    !help.isStr(aboutMe) ||
    !help.isStr(userPassword)
  ) {
    help.err(fun, "expected string inputs are not non-empty strings");
  }

  //test if given id is a valid ObjectId type
  if (!ObjectId.isValid(id)) {
    help.err(fun, "invalid object ID");
  }

  //test to ensure userPosts is either empty or full of only valid ObjectIds
  for (let i = 0; i < userPosts.length; i++) {
    if (!ObjectId.isValid(userPosts[i])) {
      help.err(fun, "userPosts contains non-valid ObjectId");
    }
  }

  //test to ensure groupsOwned is either empty or full of only valid ObjectIds
  for (let i = 0; i < groupsOwned.length; i++) {
    if (!ObjectId.isValid(groupsOwned[i])) {
      help.err(fun, "groupsOwned contains non-valid ObjectId");
    }
  }

  //test to ensure userStreak is of number type
  if (!help.isNum(userStreak)) {
    help.err(fun, "userStreak needs to be of type number");
  }

  //test to ensure goals is either empty of full of non-empty strings and trim strings
  for (let i = 0; i < goals.length; i++) {
    if (!help.isStr(goals[i])) {
      help.err(fun, "an element of goals is not a non-empty string");
    }
    goals[i] = goals[i].trim();
  }

  //get users db
  const userCollection = await users();

  //check if username is already used if it is not the same as original

  //get original username for user that is being updated
  let oldUser = await getUser(id);

  if (oldUser.username.toLowerCase() != username.trim().toLowerCase()) {
    //find if user exists with given username
    const findUser = await userCollection.findOne({
      username: username.trim(),
    });

    //search for lower case instance of username as well
    const findUserLower = await userCollection.findOne({
      username: username.trim().toLowerCase(),
    });

    //check if if user is found with same username
    if (findUser != null || findUserLower != null) {
      help.err(fun, "username: '" + username.trim() + "' is already in use");
    }
  }

  //ensure input fields are trimmed and the password is hashed
  userPassword = md5(userPassword.trim());
  username = username.trim();
  aboutMe = aboutMe.trim();

  //update the oldUser
  const updateInfo = await userCollection.updateOne(
    { _id: id },
    {
      $set: {
        username,
        userPassword,
        userPosts,
        userStreak,
        aboutMe,
        groupsOwned,
        goals,
      },
    }
  );

  //return updated user object
  return getUser(id);
};
