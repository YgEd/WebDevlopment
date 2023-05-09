import * as postFuns from "../data/posts.js";
import * as userFuns from "../data/users.js";
import * as commentFuns from "../data/comment.js";
import * as photoFuns from "../data/photos.js"
import xss from 'xss';
import { Router } from "express";
const router = Router();

router.get("/", async (req, res) => {
  if (!req.session.user){
    console.log("user not authenticated");
    return res.redirect("/login")
  }

  var logged_in = false;

  if (req.session.user.user_id){
    logged_in = true;
  }
  let userId = req.session.user.user_id;
  let userName = req.session.user.userName
  let firstName = req.session.user.firstName;
  
try {
  let targetUser = await userFuns.getUser(userId);
  let target_following = [];
  let groups_mem = [];
  let displayPosts = [];

  //get all the userIds the target user is following
  for (let i = 0; i < targetUser.following.length; i++) {
    target_following.push(targetUser.following[i]);
  }

  //get all the groupIds the target user is a member of
  for (let i = 0; i < targetUser.groupMembers.length; i++) {
    groups_mem.push(targetUser.groupMembers[i]);
  }

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

  //iterate through all display posts
  for (let i = 0; i < displayPosts.length; i++) {

    //find all the posts the user has liked
    for (let j=0; j<displayPosts[i].postLikes.length; j++){ 
      if (displayPosts[i].postLikes[j].toString() == userId.toString()){
        displayPosts[i].liked = true;
      }
    }

    //get image src to be able to display on feed
    for (let j=0; j<displayPosts[i].postImgs.length; j++){
      displayPosts[i].postImgs[j]=await photoFuns.getPhotoSrc(displayPosts[i].postImgs[j])
      
    }
    
    for (let j = 0; j < displayPosts[i].comments.length; j++) {
      //find all the posts the user commented on
      if (displayPosts[i].comments[j].userId.toString() == userId.toString()) {
        displayPosts[i].commented = true;
      }
    }

  }

  //add the post owners username to each post object
  try {
    let postUsers = []
    displayPosts.forEach((post) => {postUsers.push(post.userId)});
    postUsers.forEach(async (userId) => {
      let user = await userFuns.getUser(userId);
      let username = user.username;
      displayPosts.forEach((post) => {
        if (post.userId.toString() == userId.toString()) {
          post.username = username;
        }
      });
    })

  } catch (error) {
    console.log("Error from get feed route: " + error);
  }
  
  //sort the posts by the most recently posted
  function ObjCompare( a, b ) {
    if ( a.postTime < b.postTime ){
      return 1;
    }
    if ( a.postTime > b.postTime ){
      return -1;
    }
    return 0;
  }

  //sort the display posts
  displayPosts.sort(ObjCompare);

  

  return res.render("feed", {
    title: "feed",
    firstName: firstName,
    userName: userName,
    posts: displayPosts,
    userId: userId,
    logged_in: logged_in
  });
} catch (error) {
  console.log("Error from get feed route: " + error);
}
  
});

router.post("/", async (req, res) => {
  let data = req.body;
  let userName = req.session.user.userName;
  let userId = req.session.user.user_id;
  let postId = data.postId
  let msg = data.msg
  try {
    await commentFuns.createComment(postId, userId, userName, msg);
  } catch (error) {
    console.log("Error from post feed route: " + error);
    return res.send({ error: error });
    
  }

  return res.render("partials/comment", {
    title: "comment",
    layout: null,
    userId: userId,
    comment_user: userName,
    comment_body: msg,
  });
});

router.post("/remove", async (req, res) => {
  let postId = req.body.postId;
  let userId = req.session.user.user_id;
 
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
  console.log("current user = " + req.session.user.userName + " is liking post " + postId + "")

  try {
    let target_post = await postFuns.getPost(postId);

    //check if the user already liked the post
    for (let i = 0; i < target_post.postLikes.length; i++) {
      if (target_post.postLikes[i] == userId) {
        throw "user already liked the post";
      }
    }

    await postFuns.updateLikes(postId, userId);
    return res.send({ success: true });
  } catch (error) {
    console.log("Error from like route: " + error);
    return res.send({ error: error });
  }
});

router.post("/unlike", async (req, res) => {
  let postId = req.body.postId;
  let userId = req.session.user.user_id;
  console.log("current user = " + req.session.user.userName + " is unliking post " + postId + "")

  try {
    let target_post = await postFuns.getPost(postId);

    let newLikes = [];
    //check if the user hasn't liked the post
    for (let i = 0; i < target_post.postLikes.length; i++) {
      if (target_post.postLikes[i] != userId && i == target_post.postLikes.length - 1) {
        throw "user hasn't like post"
      }
    }

    await postFuns.updateLikes(postId, userId);
    return res.send({ success: true });
  } catch (error) {
    console.log("Error from unlike route: " + error);
    return res.send({ error: error });``
  }
});

export default router;
