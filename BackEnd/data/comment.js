import { ObjectId } from "mongodb";
import { posts } from "../config/mongoCollections.js";
import { users } from "../config/mongoCollections.js";
import help from "../helpers.js";
import * as postFuns from "./posts.js";

export const createComment = async (postId, userId, userName, msg)=>{
let fun = "createComment";
if (!userId|| !postId || !userName || !msg){
    help.err(fun,"missing field")
}

//Ensure userId is a valid ObjectId
if (!ObjectId.isValid(userId)){
    help.err(fun,"userId is invalid ObjectId")
}

//Ensure postId is a valid ObjectId
if (!ObjectId.isValid(postId)){
    help.err(fun,"userId is invalid ObjectId")
}

//Ensure msg is a non-empty string
if (help.strPrep(msg).length == 0){
    help.err(fun, "comment needs to be a non-empty string")
}

//Ensure userName is a non-empty string
if (help.strPrep(userName).length == 0){
    help.err(fun, "userName needs to be a non-empty string")
}

//create comment object
let comment = {
    _id: new ObjectId(),
    userId: userId,
    comment_user: userName,
    comment_body: msg,
}

//get post db
const postCollection = await posts();

//update comments on target post
let target_post = await postFuns.getPost(postId)

//add comment
target_post.comments.push(comment)

//update post
postCollection.updateOne({_id: new ObjectId(postId)}, {$set: target_post})

return true

}

export const deleteComment = async (postId, userId)=>{
    let fun = "deleteComment";
    if (!postId || !userId){
        help.err(fun,"missing field")
    }

    //Ensure userId is a valid ObjectId
    if (!ObjectId.isValid(userId)){
        help.err(fun,"userId is invalid ObjectId")
    }

    //Ensure postId is a valid ObjectId
    if (!ObjectId.isValid(postId)){
        help.err(fun,"userId is invalid ObjectId")
    }

    //Ensure inputs are string
    postId = postId.toString().trim();
    userId = userId.toString().trim();

    //get post db
    const postCollection = await posts();

    let target_post = await postCollection.findOne({_id: new ObjectId(postId)})

    if (!target_post){
        help.err(fun, "could not find comment with postId '" + postId + "'")
    }

    //remove comment from post that is from userId
    let new_comments = target_post.comments.filter((comment)=>{ return comment.userId != userId})

    //update post
    let updateInfo = postCollection.updateOne({_id: new ObjectId(postId)}, {$set: {comments: new_comments}})

    if (updateInfo.modifiedCount == 0){
        help.err(fun, "could not update post with postId '" + postId + "'")
    }

    return true


}