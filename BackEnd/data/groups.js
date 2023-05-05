import { ObjectId } from "mongodb";
import { posts } from "../config/mongoCollections.js";
import { users } from "../config/mongoCollections.js";
import { groups } from "../config/mongoCollections.js";
import help from "../helpers.js";
import * as postFuns from "./posts.js";


export const createGroup = async (groupName, groupOwner) => {
    let fun = "createGroup";
    if (!groupName || !groupOwner) {
        help.err(fun, "missing field")
    }
    
    //Ensure groupName is a non-empty string
    if (help.strPrep(groupName).length == 0) {
        help.err(fun, "groupName needs to be a non-empty string")
    }

    //Ensure groupOwner is a valid ObjectId
    if (!ObjectId.isValid(groupOwner)) {
        help.err(fun, "groupOwner is invalid ObjectId")
    }

    //if groupOwner is ObjectId in turn into string
    groupOwner = groupOwner.toString().trim()


    //Group Obj
    let groupObj = {
        groupOwner: new ObjectId(groupOwner),
        groupName: groupName,
        groupMembers: [new ObjectId(groupOwner)],
        groupPosts: []
    }

    //get group db
    const groupCollection = await groups();

    //insert group
    const insertInfo = await groupCollection.insertOne(groupObj);

    //check if group was added
    if (insertInfo.insertedCount === 0) {
        help.err(fun, "could not add group")
    }

    //update groupOwner
    const userCollection = await users();
    const updateInfo = await userCollection.updateOne({ _id: new ObjectId(groupOwner) }, { $push: { groupsOwned: insertInfo.insertedId, groupMembers: insertInfo.insertedId } })

    //return groupObj from DB
    return await groupCollection.findOne({ _id: insertInfo.insertedId })


}

export const postAdd = async (groupId, postId) => {
    let fun = "postAdd";

    //Ensure no missing fields
    if (!groupId || !postId) {
        help.err(fun, "missing field")
    }

    //Ensure groupId is a valid ObjectId
    if (!ObjectId.isValid(groupId)) {
        help.err(fun, "groupId is invalid ObjectId")
    }

    //Ensure postId is a valid ObjectId
    if (!ObjectId.isValid(postId)) {
        help.err(fun, "postId is invalid ObjectId")
    }

    //if groupId is ObjectId in turn into string
    groupId = groupId.toString().trim()

    //if postId is ObjectId in turn into string
    postId = postId.toString().trim()

    //get group db
    const groupCollection = await groups();

    //update group
    const updateInfo = await groupCollection.updateOne({ _id: new ObjectId(groupId) }, { $push: { groupPosts: new ObjectId(postId) } })

    //check if group was updated
    if (updateInfo.modifiedCount === 0) {
        help.err(fun, "could not add post to group")
    }

    //get post db
    const postCollection = await posts();

    //update post
    const updateInfo2 = await postCollection.updateOne({ _id: new ObjectId(postId) }, { $push: { postToGroup: new ObjectId(groupId) } })

    //check if post was updated
    if (updateInfo2.modifiedCount === 0) {
        help.err(fun, "could not add group to post")
    }

    return true
}
    

export const memberAdd = async (groupId, userId) => {
    let fun = "memberAdd";

    //Ensure no missing fields
    if (!groupId || !userId) {
        help.err(fun, "missing field")
    }

    //Ensure groupId is a valid ObjectId
    if (!ObjectId.isValid(groupId)) {
        help.err(fun, "groupId is invalid ObjectId")
    }

    //Ensure userId is a valid ObjectId
    if (!ObjectId.isValid(userId)) {
        help.err(fun, "userId is invalid ObjectId")
    }

    //if groupId is ObjectId in turn into string
    groupId = groupId.toString().trim()

    //if userId is ObjectId in turn into string
    userId = userId.toString().trim()

    //get group db
    const groupCollection = await groups();

    //get user db
    const userCollection = await users();

    //check if user is already in the group
    const group = await groupCollection.findOne({ _id: new ObjectId(groupId) })
    if (group.groupMembers.includes(new ObjectId(userId))) {
        help.err(fun, "user is already in group")
    }

    //update group
    const updateInfo = await groupCollection.updateOne({ _id: new ObjectId(groupId) }, { $push: { groupMembers: new ObjectId(userId) } })

    //check if group was updated
    if (updateInfo.modifiedCount === 0) {
        help.err(fun, "could not add user to group")
    }

    //update user
    const updateInfo2 = await userCollection.updateOne({ _id: new ObjectId(userId) }, { $push: { groupMembers: new ObjectId(groupId) } })

    //check if user was updated
    if (updateInfo2.modifiedCount === 0) {
        help.err(fun, "could not add group to user")
    }

    return true

}

export const memberRemove = async (groupId, userId) => {
    let fun = "memberRemove";
    
    //Ensure no missing fields
    if (!groupId || !userId) {
        help.err(fun, "missing field")
    }

    //Ensure groupId is a valid ObjectId
    if (!ObjectId.isValid(groupId)) {
        help.err(fun, "groupId is invalid ObjectId")
    }

    //Ensure userId is a valid ObjectId
    if (!ObjectId.isValid(userId)) {
        help.err(fun, "userId is invalid ObjectId")
    }

    //if groupId is ObjectId in turn into string
    groupId = groupId.toString().trim()

    //if userId is ObjectId in turn into string
    userId = userId.toString().trim()

    //get group db
    const groupCollection = await groups();

    //get user db
    const userCollection = await users();

    //check if user is already in the group
    const group = await groupCollection.findOne({ _id: new ObjectId(groupId) })

    if (!group.groupMembers.includes(new ObjectId(userId))) {
        help.err(fun, "user is not in group")
    }

    if (group.groupOwner == new ObjectId(userId)) {
        help.err(fun, "owner can't leave the group, delete the group instead")
    }

    //update group
    const updateInfo = await groupCollection.updateOne({ _id: new ObjectId(groupId) }, { $pull: { groupMembers: new ObjectId(userId) } })

    //check if group was updated
    if (updateInfo.modifiedCount === 0) {
        help.err(fun, "could not remove user from group")
    }

    //update user
    const updateInfo2 = await userCollection.updateOne({ _id: new ObjectId(userId) }, { $pull: { groupMembers: new ObjectId(groupId) } })

    //check if user was updated
    if (updateInfo2.modifiedCount === 0) {
        help.err(fun, "could not remove group from user")
    }
    

    //remove user posts from group

    //get post db
    const postCollection = await posts();

    const updatePostInfo = await postCollection.updateMany({ postToGroup: new ObjectId(groupId), userId: new ObjectId(userId) }, { $pull: { postToGroup: new ObjectId(groupId) } })



    return true

}

export const updateGroup = async (groupId, groupName, groupOwner, groupMembers, groupPosts) => {
    let fun = "updateGroup";

    //Ensure no missing fields
    if (!groupId || !groupName || !groupOwner || !groupMembers || !groupPosts) {
        help.err(fun, "missing field")
    }

    //Ensure groupId is a valid ObjectId
    if (!ObjectId.isValid(groupId)) {
        help.err(fun, "groupId is invalid ObjectId")
    }

    //if groupId is ObjectId in turn into string
    groupId = groupId.toString().trim()

    //Ensure groupName is a non-empty string
    if (help.strPrep(groupName).length == 0) {
        help.err(fun, "groupName needs to be a non-empty string")
    }

    //Ensure groupOwner is a valid ObjectId
    if (!ObjectId.isValid(groupOwner)) {
        help.err(fun, "groupOwner is invalid ObjectId")
    }

    //if groupOwner is ObjectId in turn into string
    groupOwner = groupOwner.toString().trim()

    //Ensure groupMembers is an array of valid ObjectIds
    if (!Array.isArray(groupMembers) || !groupMembers.every(ObjectId.isValid)) {
        help.err(fun, "groupMembers is not an array of valid ObjectIds")
    }

    //Ensure groupPosts is an array of valid ObjectIds
    if (!Array.isArray(groupPosts) || !groupPosts.every(ObjectId.isValid)) {
        help.err(fun, "groupPosts is not an array of valid ObjectIds")
    }

    //get group db
    const groupCollection = await groups();

    //ensure group db is succesfully fetched
    if (!groupCollection){
        help.err(fun, "could not get group collection")
    }

    //update group
    const updateInfo = await groupCollection.updateOne({ _id: new ObjectId(groupId) }, { $set: { groupName: groupName, groupOwner: groupOwner, groupMembers: groupMembers, groupPosts: groupPosts } })

    //ensure group was updated
    if (updateInfo.modifiedCount === 0) {
        help.err(fun, "could not update group")
    }

    return true
}