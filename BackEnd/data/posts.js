import { ObjectId } from "mongodb";
import { posts } from "../config/mongoCollections.js";
import { users } from "../config/mongoCollections.js";
import * as help from "../helpers.js";
import * as user from "./users.js";

export const createPost = async (
  userId,
  workoutType,
  postDescription,
  postImgs,
  //postTime,
  //postLikes,
  //comments,
  postToGroup
) => {
  //function name to use for error throwing
  let fun = "createPost";

  //ensure userId is a valid ObjectId
  if (!ObjectId.isValid(userId)) {
    help.err(fun, "invalid object ID '" + userId + "'");
  }

  //ensure workoutTYpe and postDescription are non-empty strings
  if (!help.isStr(postDescription) || !help.isStr(workoutType)) {
    help.err(fun, "expected string inputs to be of non-empty string type");
  }

  //check to see if workoutType is one of the valid types
  ////////////////////TODO

  //test to ensure postImgs is an array
  if (!Array.isArray(postImgs)) {
    help.err(fun, "expected postImgs to be of type array");
  }

  //test if valid url is inputted for each img in postImgs
  // if (webhold.substring(0,11) != "http://www." || webhold.substring(webhold.length-4, webhold.length) != ".com"){
  //   help.err(fun, "invalid website: has to start with 'http://www.' and end with '.com'");
  // }

  //test to ensure postToGroup is an array
  if (!Array.isArray(postToGroup)) {
    help.err(fun, "expected postToGroup to be of type array");
  }

  //test to ensure postToGroup is empty or of full of valid ObjectIds
  for (let i = 0; i < postToGroup.length; i++) {
    if (!Object.isValid(postToGroup[i])) {
      help.err(fun, "postToGroup contains a non valid ObjectId");
    }
  }

  //get current time
  const date = new Date();

  //setup default variables
  let postLikes = [];
  let comments = [];

  //create the postObj that will be inserted into the db
  let postObj = {
    userId,
    workoutType: workoutType.trim(),
    postDescription: postDescription.trim(),
    postImgs,
    postTime: date.toLocaleTimeString(),
    postLikes,
    comments,
    postToGroup,
  };

  //get the posts db
  const postCollection = await posts();

  //attemp to insert the postObj into the db
  const insertInfo = await postCollection.insertOne(postObj);

  //test to see if insert was successful
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    help.err(fun, "could not add post");
  }

  //add the postId to the corresponding user
  const userCollection = await users();

  //get corresponding user
  let targetUser = await user.getUser(userId);

  //add id of the post to the user's 'userPosts' field
  let newPosts = targetUser.userPosts;
  newPosts.push(insertInfo.insertedId);

  //update the user's document in the user db
  user.updateUser(
    targetUser._id,
    targetUser.username,
    targetUser.userPassword,
    newPosts, //the new posts array is added
    targetUser.userStreak,
    targetUser.aboutMe,
    targetUser.groupsOwned,
    targetUser.goals
  );

  //return the post obj
  return await postCollection.findOne({ _id: insertInfo.insertedId });
};
