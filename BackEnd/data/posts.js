import { ObjectId } from "mongodb";
import { posts } from "../config/mongoCollections.js";
import { users } from "../config/mongoCollections.js";
import help from "../helpers.js";
import * as user from "./users.js";

//defined workout types
var workoutTypes = ["running", "lifting", "cycling", "other"];

//valid image types
var imgTypes = ["jpg", "jpeg", "heic", "avif", "png"];

export const createPost = async (postObj) => {
  let userId = postObj.userId
  let postTitle = postObj.postTitle
  let workoutType = postObj.workoutType
  let postDescription = postObj.postDescription
  let postImgs = postObj.postImgs
  //postTime,
  //postLikes,
  //comments,
  let postToGroup = postObj.postToGroup;
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
  let valid = false;
  if (!workoutTypes.includes(workoutType.trim().toLowerCase())) {
    help.err(fun, "invalid workoutType");
  }

  //test to ensure postImgs is an array
  if (!Array.isArray(postImgs)) {
    help.err(fun, "expected postImgs to be of type array");
  }

  //test if valid objectId for each img in postImgs
  for (let i = 0; i < postImgs.length; i++) {
    if (!ObjectId.isValid(postImgs[i])) {
      help.err(fun, "postImgs contains a non valid ObjectId");
    }
  }

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
  postObj = {
    userId,
    postTitle,
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
    targetUser.email,
    newPosts, //the new posts array is added
    targetUser.userStreak,
    targetUser.aboutMe,
    targetUser.groupsOwned,
    targetUser.groupMembers,
    targetUser.goals,
    targetUser.following,
    targetUser.followers
  );

  //return the post obj
  return await postCollection.findOne({ _id: insertInfo.insertedId });
};

export const getAllPosts = async () => {
  //function name to use for error throwing
  let fun = "getAllPosts";

  //get post db
  const postCollection = await posts()

  //test if userCollection is null
  if (postCollection == null) {
    help.err(fun, "could not get posts");
  }

  //put db in an array
  let postList = await postCollection.find({}).toArray();

  //return array of users
  return postList;
}

export const getPost = async (postId) => {
  //function name to use for error throwing
  let fun = "getPost";

  //ensure input is string and trim input
  if (typeof postId !== "string") {
    throw `postId must be a string`
  }
  postId = postId.trim();
  if (postId == "") {
    throw `postId cannot be an empty string`
  }

  //test if given id is a valid ObjectId type
  if (!ObjectId.isValid(postId)) {
    help.err(fun, "invalid object ID '" + postId + "'");
  }

  //get post db
  const postCollection = await posts();
  const findPost = await postCollection.findOne({ _id: new ObjectId(postId) });

  //if user is not found throw error
  if (findPost == null) {
    help.err(fun, "post with ObjectId '" + postId + "' wasn't found");
  }

  return findPost;
};

export const removePost = async (postId) => {
  //function name to use for error throwing
  let fun = "removePost";
  //test if given id is a valid ObjectId type
  if (!ObjectId.isValid(postId)) {
    help.err(fun, "invalid object ID '" + postId + "'");
  }
  //get post object
  const targetPost = await getPost(postId);

  //get post db and remove the target post
  const userCollection = await posts();
  const deleteInfo = await userCollection.findOneAndDelete({ _id: postId });

  if (deleteInfo.lastErrorObject.n == 0) {
    help.err(fun, "could not delete post with postId '" + postId + "'");
  }

  //remove the postobject from the associated user
  const targetUser = await user.getUser(targetPost.userId);

  //find index of deleted post
  let index = targetUser.userPosts.indexOf(targetPost._id);

  //remove post form user's userPosts array
  targetUser.userPosts.splice(index, 1);

  //update the user in the user db
  await user.updateUser(
    targetUser._id,
    targetUser.email,
    targetUser.userPosts,
    targetUser.userStreak,
    targetUser.aboutMe,
    targetUser.groupsOwned,
    targetUser.groupMembers,
    targetUser.goals,
    targetUser.following,
    targetUser.followers
  );

  return "post with postId '" + postId + "' successfully deleted";
};
