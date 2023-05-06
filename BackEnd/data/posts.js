import { ObjectId } from "mongodb";
import { posts } from "../config/mongoCollections.js";
import { users } from "../config/mongoCollections.js";
import help from "../helpers.js";
import * as user from "./users.js";

//defined workout types
var workoutTypes = ["running", "lifting", "cycling", "other"];

//valid image types
var imgTypes = ["jpg", "jpeg", "heic", "avif", "png"];

export const createPost = async (
  userId,
  postTitle,
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

  //if userId is ObjectId in turn into string
  userId = userId.toString().trim()


  //ensure workoutTYpe, postTitle, and postDescription are non-empty strings
  if (!help.isStr(postDescription) || !help.isStr(workoutType) || !help.isStr(postTitle)) {
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

  //test if valid image objectId
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
  let date = new Date();
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - offset * 60 * 1000);

  //setup default variables
  let postLikes = [];
  let comments = [];

  //create the postObj that will be inserted into the db
  let postObj = {
    userId: new ObjectId(userId),
    postTitle: postTitle.trim(),
    workoutType: workoutType.trim(),
    postDescription: postDescription.trim(),
    postImgs,
    postTime: date,
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
  const updateInfo = await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { userPosts: newPosts } }
  );

  //test to see if update was successful
  if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) {
    help.err(fun, "could not update user");
  }

  //return the post obj
  return await postCollection.findOne({ _id: insertInfo.insertedId });
};

//returns limits amout of most recent posts by userId
export const getPostByUser = async (userId, limit) => {
  let fun = "getPostByUser";
  if (!userId || !limit) {
    help.err(fun, "no userId provided");
  }

  //ensure limit is a number
  if (!help.isNum(limit)) {
    help.err(fun, "limit is not a number");
  }

  if (!ObjectId.isValid(userId)) {
    help.err(fun, "userId is invalid ObjectId");
  }

  //if userId is ObjectId in turn into string
  userId = userId.toString().trim()



  //get post db
  const postCollection = await posts();

  //test if userCollection is null
  if (postCollection == null) {
    help.err(fun, "could not get posts");
  }

  //put db in an array
  let postList = await postCollection
    .find({ userId: new ObjectId(userId) })
    .limit(limit)
    .sort({ postTime: -1 })
    .toArray();

  //return array of users
  return postList;
};

//returns limits amout of most recent posts by groupId
export const getPostByGroup = async (groupId, limit) => {
  let fun = "getPostbyGroup";
  if (!groupId || !limit) {
    help.err(fun, "no groupId provided");
  }

  //ensure limit is a number
  if (!help.isNum(limit)) {
    help.err(fun, "limit is not a number");
  }

  if (!ObjectId.isValid(groupId)) {
    help.err(fun, "groupId is invalid ObjectId");
  }

  //if groupId is ObjectId in turn into string
  groupId = groupId.toString().trim()

  //get post db
  const postCollection = await posts();

  //test if userCollection is null
  if (postCollection == null) {
    help.err(fun, "could not get posts");
  }

  //put db in an array
  let postList = await postCollection
    .find({ postToGroup: new ObjectId(groupId) })
    .limit(limit)
    .sort({ postTime: -1 })
    .toArray();

  //return array of users
  return postList;
};

export const getAllPosts = async (limit) => {
  //function name to use for error throwing
  let fun = "getAllPosts";

  //ensure limit is provided
  if (!limit) {
    help.err(fun, "no limit provided");
  }

  //ensure limit is a number
  if (!help.isNum(limit)) {
    help.err(fun, "limit is not a number");
  }

  //get post db
  const postCollection = await posts();

  //test if userCollection is null
  if (postCollection == null) {
    help.err(fun, "could not get posts");
  }

  //put db in an array
  let postList = await postCollection.find({}).sort({ postTime: -1 }).limit(limit).toArray();

  //return array of users
  return postList;
};

export const getPost = async (postId) => {
  //function name to use for error throwing
  let fun = "getPost";
  //test if given id is a valid ObjectId type
  if (!ObjectId.isValid(postId)) {
    help.err(fun, "invalid object ID '" + postId + "'");
  }

  //if postId is ObjectId turn into String
  postId = postId.toString().trim();

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

  //if postId is ObjectId turn into String
  postId = postId.toString().trim();

  
  //get post object
  const targetPost = await getPost(postId);

  //get post db and remove the target post
  const userCollection = await posts();
  const deleteInfo = await userCollection.findOneAndDelete({ _id: new ObjectId(postId) });

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
  await userCollection.updateOne(
    { _id: targetUser._id },
    { $set: { userPosts: targetUser.userPosts } }
  );

  return "post with postId '" + postId + "' successfully deleted";
};

export const updatePost = async (
  postId,
  postTitle,
  workoutType,
  postDescription,
  postImgs,
  postLikes,
  comments,
  postToGroup
) => {
  let fun = "updatePost";
  //Make sure fields are valid
  if (

    !postId ||
    !postTitle ||
    !workoutType ||
    !postDescription ||
    !postImgs ||
    !postLikes ||
    !comments ||
    !postToGroup
  ) {
    help.err(fun, "missing field(s)");
  }

  //Ensure postId is a valid ObjectId
  if (!ObjectId.isValid(postId)) {
    help.err(fun, "postId is invalid ObjectId");
  }

  //if postId is ObjectId turn into string
  postId = postId.toString().trim();

  //Ensure workoutType is a non-empty string
  if (help.strPrep(workoutType).length == 0) {
    help.err(fun, "workoutType needs to be non-empty string");
  }

  //Ensure postDescription is a non-empty string
  if (help.strPrep(postDescription).length == 0) {
    help.err(fun, "postDescription needs to be non-empty string");
  }

  //Ensure postTitle is a non-empty string
  if (help.strPrep(postTitle).length == 0) {
    help.err(fun, "postTitle needs to be non-empty string");
  }

  //Ensure postImgs is an array
  if (!Array.isArray(postImgs) || !help.verObjectIds(postImgs)) {
    help.err(fun, "postImgs needs to be an array");
  }

  //Ensure postLikes is an array
  if (!Array.isArray(postLikes) || !help.verObjectIds(postLikes)) {
    help.err(fun, "postLikes needs to be an array");
  }

  //Ensure comments is an array
  if (!Array.isArray(comments)) {
    help.err(fun, "comments needs to be an array");
  }

  //Ensure postToGroup is a non-empty string
  if (!Array.isArray(postToGroup) || !help.verObjectIds(postToGroup)) {
    help.err(fun, "postToGroup needs to be a non-empty string");
  }

  //get post db
  const postCollection = await posts();

  const updateInfo = await postCollection.updateOne(
    { _id: new ObjectId(postId) },
    {
      $set: {
        postTitle: postTitle,
        workoutType: workoutType,
        postDescription: postDescription,
        postImgs: postImgs,
        postLikes: postLikes,
        comments: comments,
        postToGroup: postToGroup,
      },
    }
  );

  if (updateInfo.modifiedCount == 0) {
    help.err(fun, "could not update post with postId '" + postId + "'");
  }

  return true

};

export const updateLikes = async (postId, userId) => {
  let fun = "updateLikes";

  //ensure input is valid
  if (!postId || !userId) {
    help.err(fun, "missing field(s)");
  }

  //Ensure postId is a valid ObjectId
  if (!ObjectId.isValid(postId)) {
    help.err(fun, "postId is invalid ObjectId");
  }

  //if postId is ObjectId turn into string
  postId = postId.toString().trim();

  //Ensure userId is a valid ObjectId
  if (!ObjectId.isValid(userId)) {
    help.err(fun, "userId is invalid ObjectId");
  }

  //if userId is ObjectId turn into string
  userId = userId.toString().trim();

  //get post db
  const postCollection = await posts();

  //get post object
  const targetPost = await getPost(postId);

  //get user object
  const targetUser = await user.getUser(userId);


  let hasliked = false;

  //if user has already liked post, remove like
  for (let i = 0; i < targetPost.postLikes.length; i++) {
    if (targetPost.postLikes[i].toString() == userId) {
      targetPost.postLikes.splice(i, 1);
      hasliked = true;
      break;
    }
  }

  if (!hasliked) {
    targetPost.postLikes.push(new ObjectId(userId));
  }

  //update post in post db
  const updateInfo = await postCollection.updateOne({ _id: new ObjectId(postId) }, { $set: { postLikes: targetPost.postLikes } });

  //ensure post was updated
  if (updateInfo.modifiedCount == 0) {
    help.err(fun, "could not update post with postId '" + postId + "'");
  }

return true


}
