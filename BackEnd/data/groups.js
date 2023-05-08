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

    //limit groupName to 30 chars
    groupName = groupName.trim().substring(0, 30)

    //Ensure groupOwner is a valid ObjectId
    if (!ObjectId.isValid(groupOwner)) {
        help.err(fun, "groupOwner is invalid ObjectId")
    }

    //if groupOwner is ObjectId in turn into string
    groupOwner = groupOwner.toString().trim()


    //Group Obj
    let groupObj = {
        groupOwner: new ObjectId(groupOwner),
        groupDescription: "",
        groupName: groupName,
        groupMembers: [new ObjectId(groupOwner)],
        groupPosts: [],
        groupMessages: []
    }

    //get group db
    const groupCollection = await groups();

    //check if a group with groupName already exists
    if (!groupCollection.findOne({ groupName: groupName })) {
        help.err(fun, "group with groupName already exists")
    }

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

export const getGroup = async (groupId) => {
    let fun = "getGroup";

    //Ensure groupId is a valid ObjectId
    if (!ObjectId.isValid(groupId)) {
        help.err(fun, "groupId is invalid ObjectId")
    }

    //if groupId is ObjectId in turn into string
    groupId = groupId.toString().trim()

    //get group db
    const groupCollection = await groups();

    //get group
    const group = await groupCollection.findOne({ _id: new ObjectId(groupId) })

    //check if group was found
    if (!group) {
        help.err(fun, "could not find group")
    }

    //return group
    return group
}

export const addGroupDescription = async (groupId, groupDescription, user_id) => {
    let fun = "addGroupDescription";

    //Ensure no missing fields
    if (!groupId || !groupDescription || !user_id) {
        help.err(fun, "missing field")
    }

    //Ensure groupId is a valid ObjectId
    if (!ObjectId.isValid(groupId)) {
        help.err(fun, "groupId is invalid ObjectId")
    }

    //Ensure groupId is a valid ObjectId
    if (!ObjectId.isValid(groupId)) {
        help.err(fun, "groupId is invalid ObjectId")
    }

    //if groupId is ObjectId in turn into string
    groupId = groupId.toString().trim()
    user_id = user_id.toString().trim()


    //Ensure groupDescription is a non-empty string
    if (help.strPrep(groupDescription).length == 0) {
        help.err(fun, "groupDescription needs to be a non-empty string")
    }

    //limit groupDescription to 100 chars
    groupDescription = groupDescription.trim().substring(0, 100)

    //get group db
    const groupCollection = await groups();

    //get group
    const group = await groupCollection.findOne({ _id: new ObjectId(groupId) })

    //check if group was found
    if (!group) {
        help.err(fun, "could not find group")
    }

    //check if user is group owner
    if (group.groupOwner.toString() != user_id) {
        help.err(fun, "user is not group owner")
    }

    //update group
    const updateInfo = await groupCollection.updateOne({ _id: new ObjectId(groupId) }, { $set: { groupDescription: groupDescription } })

    //check if group was updated
    if (updateInfo.modifiedCount === 0) {
        help.err(fun, "could not update group")
    }

    return true

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

    let ingroup = false
    for (let i = 0; i < group.groupMembers.length; i++) {
        
        if (group.groupMembers[i] == userId) {
            ingroup = true
            break;
        }
    }

    if (!ingroup){
        help.err(fun, "user is not in group")
    }

    // if (group.groupOwner.toString() == userId) {
    //     help.err(fun, "owner can't leave the group, delete the group instead")
    // }

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

export const addGroupMessage = async (groupId, userId, message) => {
    let fun = "addGroupMessage";

    //Ensure no missing fields
    if (!groupId || !userId || !message) {
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

    //Ensure message is a non-empty string
    if (help.strPrep(message).length == 0) {
        help.err(fun, "message needs to be a non-empty string")
    }

    //get group db
    const groupCollection = await groups();

    //ensure user is group owner
    const group = await groupCollection.findOne({ _id: new ObjectId(groupId) })

    if (group.groupOwner.toString() != userId) {
        help.err(fun, "user is not group owner")
    }

    //update group
    const updateInfo = await groupCollection.updateOne({ _id: new ObjectId(groupId) }, { $push: { groupMessages: message } })
    
    //check if group was updated
    if (updateInfo.modifiedCount === 0) {
        help.err(fun, "could not add message to group")
    }

    return true


}

export const removeGroupMessage = async (groupId, userId, message) => {
    let fun = "removeGroupMessage";

    //Ensure no missing fields
    if (!groupId || !userId || !message) {
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

    //Ensure message is a non-empty string
    if (help.strPrep(message).length == 0) {
        help.err(fun, "message needs to be a non-empty string")
    }

    //get group db
    const groupCollection = await groups();

    //ensure user is group owner
    const group = await groupCollection.findOne({ _id: new ObjectId(groupId) })

    if (group.groupOwner.toString() != userId) {
        help.err(fun, "user is not group owner")
    }

    //update group
    const updateInfo = await groupCollection.updateOne({ _id: new ObjectId(groupId) }, { $pull: { groupMessages: message } })

   return true

}

export const updateGroup = async (groupId, groupName, groupOwner, groupMembers, groupPosts, groupDescription) => {
    let fun = "updateGroup";

    //console.log(groupId, groupName, groupOwner, groupMembers, groupPosts, groupDescription)

    //Ensure no missing fields
    if (!groupId || !groupName || !groupOwner || !groupMembers || !groupPosts || !groupDescription) {
        help.err(fun, "missing field")
    }

    //Ensure groupId is a valid ObjectId
    if (!ObjectId.isValid(groupId)) {
        help.err(fun, "groupId is invalid ObjectId")
    }

    //Ensure groupDescription is a non-empty string
    if (help.strPrep(groupDescription).length == 0) {
        help.err(fun, "groupDescription needs to be a non-empty string")
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

    //trim groupName and groupDescription
    groupName = groupName.toString().trim().substring(0,30)
    groupDescription = groupDescription.toString().trim().substring(0,100)


    //get group db
    const groupCollection = await groups();

    //check if a group with groupName already exists
    if (groupCollection.findOne({ groupName: groupName })) {
        help.err(fun, "group with groupName already exists")
    }

    //ensure group db is succesfully fetched
    if (!groupCollection){
        help.err(fun, "could not get group collection")
    }

    //update group
    const updateInfo = await groupCollection.updateOne({ _id: new ObjectId(groupId) }, { $set: { groupName: groupName, groupOwner: groupOwner, groupMembers: groupMembers, groupPosts: groupPosts, groupDescription: groupDescription } })

    //ensure group was updated
    if (updateInfo.modifiedCount === 0) {
        help.err(fun, "could not update group")
    }

    return true
}

export const deleteGroup = async (groupId, userId) => {
    let fun = "deleteGroup";

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
    userId = userId.toString().trim()

    //if groupId is ObjectId in turn into string
    groupId = groupId.toString().trim()

    //ensure user initiating delete is group owner

    //get group db

    const groupCollection = await groups();

    //get target group

    const targetGroup = await groupCollection.findOne({ _id: new ObjectId(groupId) })

    //get groupOwner
    const groupOwner = targetGroup.groupOwner

    
    //ensure user initiating delete is group owner
    if (groupOwner.toString() != userId) {
        help.err(fun, "user is not group owner")
    }

    //remove groupOwner first
    groupCollection.updateOne({ _id: new ObjectId(groupId) }, { $set: { groupOwner: null } })

    //update groupOwner
    const userCollection = await users();
    const updateInfo = await userCollection.updateOne({ _id: new ObjectId(userId) }, { $pull: { groupsOwned: new ObjectId(groupId) } })

    //remove all groupMembers besides groupOwner
    for (let i = 0; i < targetGroup.groupMembers.length; i++) {
            await memberRemove(groupId, targetGroup.groupMembers[i])
    }

    //dete groupObject
    const deleteInfo = await groupCollection.deleteOne({ _id: new ObjectId(groupId) })

    //ensure group was deleted
    if (deleteInfo.deletedCount === 0) {
        help.err(fun, "could not delete group")
    }

    return true



}

export const getAllGroups = async (limit) => {
    let fun = "getAllGroups";

    //Ensure no missing fields
    if (!limit) {
        help.err(fun, "missing field")
    }

    //Ensure limit is a number
    if (typeof limit !== "number") {
        help.err(fun, "limit is not a number")
    }

    //get group db
    const groupCollection = await groups();

    //get all groups
    const allGroups = await groupCollection.find({}).limit(limit).toArray()

    //ensure groups were fetched
    if (!allGroups) {
        help.err(fun, "could not get all groups")
    }

    return allGroups
}

export const getGroupByName = async (groupName) => {
    let fun = "getGroupByName";

    //Ensure no missing fields
    if (!groupName) {
        help.err(fun, "missing field")
    }

    //Ensure groupName is a non-empty string
    if (help.strPrep(groupName).length == 0) {
        help.err(fun, "groupName needs to be a non-empty string")
    }

    //trim groupName
    groupName = groupName.toString().trim().substring(0,30)

    //get group db
    const groupCollection = await groups();

    //get group
    const group = groupCollection.findOne({ groupName: groupName })

    //ensure group was fetched
    if (!group) {
        help.err(fun, "could not get group")
    }

    return group
};