import * as postFuns from "../data/posts.js";
import * as userFuns from "../data/users.js";
import * as commentFuns from "../data/comment.js";

import { Router } from "express";
const router = Router();

router.get("/", async (req, res) => {
  console.log(req.session.user.firstName + "is accessing feed page");
  console.log(req.session.user.user_id);
  let userId = req.session.user.user_id;
  let firstName = req.session.user.firstName;
  if (!userId) {
    console.log("user not authenticated");
    return;
  }
try {
  let targetUser = await userFuns.getUser(userId);
  let target_following = [];
  let groups_mem = [];

  //get all the userIds the target user is following
  for (let i = 0; i < targetUser.following.length; i++) {
    target_following.push(targetUser.following[i]);
  }

  //get all the groupIds the target user is a member of
  for (let i = 0; i < targetUser.groupMembers.length; i++) {
    groups_mem.push(targetUser.groupMembers[i]);
  }

  let displayPosts = [];
  //get user following posts, 15 per user
  for (let i = 0; i < target_following.length; i++) {
    displayPosts = displayPosts.concat(
      await postFuns.getPostByUser(target_following[i], 15)
    );
  }

  //get user own posts, 15 per user
  for (let i = 0; i < targetUser.userPosts.length; i++) {
    displayPosts = displayPosts.concat(
      await postFuns.getPost(targetUser.userPosts[i], 15)
    );
  }

  //get group posts, 3 per group
  for (let i = 0; i < groups_mem.length; i++) {
    displayPosts = displayPosts.concat(
      await postFuns.getPostByGroup(groups_mem[i], 5)
    );
  }

  //find all the posts the user commented in
  for (let i = 0; i < displayPosts.length; i++) {
    //find all the posts the user has liked
    for (let j=0; j<displayPosts[i].postLikes.length; j++){ 
      if (displayPosts[i].postLikes[j].toString() == userId){
        displayPosts[i].liked = true;
      }
    }
    
    for (let j = 0; j < displayPosts[i].comments.length; j++) {
      //find all the posts the user commented on
      if (displayPosts[i].comments[j].userId == userId) {
        displayPosts[i].commented = true;
      }
    }
  }

  
  return res.render("feed", {
    firstName: firstName,
    posts: displayPosts,
    userId: userId,
  });
} catch (error) {
  console.log(error)
}
  
});

router.post("/", async (req, res) => {
  let data = req.body;
  let userName = req.session.user.userName;
  let userId = req.session.user.user_id;
  console.log(data);
  try {
    await commentFuns.createComment(data.postId, userId, userName, data.msg);
  } catch (error) {
    console.log("create log failed");
    return res.send({ error: error });
  }

  return res.render("partials/comment", {
    layout: null,
    userId: userId,
    comment_user: userName,
    comment_body: data.msg,
  });
});

router.post("/remove", async (req, res) => {
  let postId = req.body.postId;
  let userId = req.session.user.user_id;
  console.log(req.body);
  console.log("postId = " + postId);
  console.log("userId = " + userId);
  try {
    await commentFuns.deleteComment(postId, userId);
  } catch (error) {
    console.log("remove comment failed");
    console.log(error);
    //clear req.body
    req.body = {};
    return res.send({ error: error });
  }
  //clear req.body
  req.body = {};
  return res.send({ success: true });
});

router.post("/like", async (req, res) => {
  let postId = req.body.postId;
  let userId = req.session.user.user_id;

  try {
    let target_post = await postFuns.getPost(postId);

    //check if the user already liked the post
    for (let i = 0; i < target_post.postLikes.length; i++) {
      if (target_post.postLikes[i] == userId) {
        throw "user already liked the post";
      }
    }

    target_post.postLikes.push(userId);
    await postFuns.updatePost(
      postId,
      target_post.workoutType,
      target_post.postDescription,
      target_post.postImgs,
      target_post.postLikes,
      target_post.comments,
      target_post.postToGroup
    );
  } catch (error) {
    console.log(error);
  }
});

router.post("/unlike", async (req, res) => {
  let postId = req.body.postId;
  let userId = req.session.user.user_id;

  try {
    let target_post = await postFuns.getPost(postId);

    let newLikes = [];
    //check if the user hasn't liked the post
    for (let i = 0; i < target_post.postLikes.length; i++) {
      if (target_post.postLikes[i] == userId) {
        continue;
      }
      newLikes.push(target_post.postLikes[i]);
    }

    target_post.postLikes.push(userId);
    await postFuns.updatePost(
      postId,
      target_post.workoutType,
      target_post.postDescription,
      target_post.postImgs,
      newLikes,
      target_post.comments,
      target_post.postToGroup
    );
  } catch (error) {
    console.log(error);
  }
});

export default router;
