import { ObjectId } from "mongodb";
import { users } from "../config/mongoCollections.js";
import help from "../helpers.js";
import bcrypt from "bcryptjs"


//creates user (hashes password using md5)
export const createUser = async (
  username,
  firstName,
  lastName,
  email,
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
    !help.isStr(firstName) ||
    !help.isStr(lastName) ||
    !help.isStr(DOB) ||
    !help.isStr(email) ||
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
    help.err(fun, "username: '" + email.trim() + "' is already in use");
  }

  //format the input strings (trimming and lowercasing where needed)
  firstName = help.strPrep(firstName);
  lastName = help.strPrep(lastName);
  email = help.strPrep(email).toLowerCase();
  DOB = help.strPrep(DOB);
  userPassword = userPassword.trim();

  //validate firstName, lastName, and Email
    help.checkName(firstName, "First Name")
    help.checkName(lastName, "Last Name")
    help.checkEmail(email, "Email")
    help.checkPassword(userPassword, "Password")
    

  //check if email is already in use
  const userCollect = await users();
  const target = await userCollect.findOne({email: email})
  if (target != null){
    help.err(fun, "email already in use");
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
  help.checkDOB(DOB, "DOB");

  

  let userPosts = [];
  let userStreak = 0;
  let groupsOwned = []; //groups owned by the user
  let groupMembers = []; //groups the user is a member of
  let following = [] //people the user is following
  let followers = [] //people that are following the user

  let salt = bcrypt.genSaltSync(6);
  let hashed = bcrypt.hashSync(userPassword, salt);

  //create user object to add with trimmed and lowercase fields
  console.log(bcrypt.hash(password, 10))
  let user = {
    username: username.trim(),
    firstName,
    lastName,
    email,
    userPassword: hashed,
    DOB,
    userPosts,
    userStreak,
    aboutMe: aboutMe.trim(),
    groupsOwned,
    groupMembers,
    goals,
    following,
    followers
  };

  console.log(user)


  //insert created user object into the db
  const insertInfo = await userCollection.insertOne(user);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    help.err(fun, "could not add user");
  }

  return await userCollection.findOne({ _id: insertInfo.insertedId });
};

//return user by given ObjectId id
export const getUser = async (email) => {
  //function name to use for error throwing
  let fun = "getUser";
  //test if given id is a valid ObjectId type
  

  //get users db collection
  const userCollection = await users();
  const findUser = await userCollection.findOne({ email: email });

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
  firstName,
  lastName,
  email,
  userPassword,
  //DOB,
  userPosts,
  userStreak,
  aboutMe,
  groupsOwned,
  groupMembers,
  goals,
  following,
  followers
) => {
  //function name to use for error throwing
  let fun = "updateUser";

  //test if string inputs are valid non-empty strings
  if (
    !help.isStr(username) ||
    !help.isStr(firstName) ||
    !help.isStr(lastName) ||
    !help.isStr(email) ||
    !help.isStr(userPassword) ||
    !help.isStr(aboutMe)
  ) {
    help.err(fun, "expected string inputs are not non-empty strings");
  }

  //test if given id is a valid ObjectId type
  if (!ObjectId.isValid(id)) {
    help.err(fun, "invalid object ID");
  }

  //test to ensure userPosts is either empty or full of only valid ObjectIds
  if (!help.verObjectIds(userPosts)) help.err(fun, "userPosts is not a valid array of valid ObjectIds")

  //test to ensure groupsOwned is either empty or full of only valid ObjectIds
  if (!help.verObjectIds(groupsOwned)) help.err(fun, "groupsOwned is not a valid array of valid ObjectIds")
  
  //test to ensure following is either empty or full of only valid ObjectIds
  if (!help.verObjectIds(following)) help.err(fun, "following is not a valid array of valid ObjectIds")

  //test to ensure followers is either empty or full of only valid ObjectIds
  if (!help.verObjectIds(followers)) help.err(fun, "followers is not a valid array of valid ObjectIds")

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

  
  firstName = help.strPrep(firstName);
  lastName = help.strPrep(lastName);
  email = help.strPrep(email).toLowerCase();

  //validate firstName, lastName, and Email
    help.checkName(firstName, "First Name")
    help.checkName(lastName, "Last Name")
    help.checkEmail(email, "Email")

  //get original email from user

  //check if email is already in use
  const target = await userCollection.findOne({email: email})
  if (oldUser.email != email && target != null){
    help.err(fun, "email already in use");
  }

  //ensure input fields are trimmed and the password is hashed
  let salt = bcrypt.genSaltSync(6);
  userPassword = bcrypt.hashSync(userPassword, salt);
  username = username.trim();
  aboutMe = aboutMe.trim();

  //update the oldUser
  const updateInfo = await userCollection.updateOne(
    { _id: id },
    {
      $set: {
        username,
        firstName,
        lastName,
        email,
        userPassword,
        userPosts,
        userStreak,
        aboutMe,
        groupsOwned,
        groupMembers,
        goals,
        following,
        followers
      },
    }
  );

  //return updated user object
  return getUser(id);
};

export const checkUser = async (emailAddress, password) => {
  let fun = "checkUser"

  if (
    help.strPrep(emailAddress).length == 0 ||
    help.strPrep(password).length == 0
  ) {
    help.err(fun, "invalid input")
  }

    emailAddress = help.strPrep(emailAddress).toLowerCase()
   //Check if email is valid form
   help.checkEmail(emailAddress, "Email Address");

   //Check if password is valid form
   password = password
   help.checkPassword(password, "Password")

   //connect to db
   const userCollect = await users();
   const user = await userCollect.findOne({emailAddress: emailAddress})

   if (user == null){
      throw "Either the email address or password is invalid";
   }

   if (!(bcrypt.compareSync(password, user.password))){
      throw "Either the email address or password is invalid";
   }

   let retobj = {
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.email,
   }
  

   return retobj


};
