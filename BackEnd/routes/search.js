import * as postFuns from "../data/posts.js";
import * as userFuns from "../data/users.js";
import * as groupFuns from "../data/groups.js";
import help from "../helpers.js";
import {distance, closest} from "fastest-levenshtein"

import { Router } from "express";
const router = Router();

router.get("/", async (req, res) => {
    let user = req.session.user
    let logged_in = true;
    if (!user){
        logged_in = false;
        console.log("user not authenticated");
        // return res.redirect("/login")
    }

    res.render("search", {logged_in: logged_in, user: user})


})


router.post("/", async (req, res) => {
    let data = req.body
    console.log("post search route hit")
    console.log(data)
    if (help.strPrep(data.searchType).length == 0 || data.searchType != "user" && data.searchType != "group"){
        console.log("invalid search type")
        return res.redirect("/search")
    }

    if (help.strPrep(data.searchInput).length == 0 || help.strPrep(data.searchInput).length > 30){
        console.log("invalid search length")
        return res.redirect("/search")
    }

    if (data.searchType == "user"){
        try{
        var userList = await userFuns.getAllUsers(100)
        } catch (error) {
            console.log(error)
            res.send({response: "db error"})
        }
        //get usernames
        let usernames = userList.map(value => value.username);

        //get closest username
        let target_user = closest(data.searchInput, usernames)

        //get user object
        let userobj = userList.find(value => value.username == target_user)

        //if user is authenticated
        if (req.session.user && req.session.user.userName != target_user){
            //check if user is already following
            let curr_user = req.session.user.user_id
            let following = false;
            console.log("search post/ " + userobj.followers.includes(curr_user))
            
            //check if user is already following
            for (let i = 0; i < userobj.followers.length; i++){
                if (userobj.followers[i].toString() == curr_user.toString()){
                    following = true;
                }
            }

            return res.send({response: target_user, type: "user", userobj: userobj, following: following, auth:true})
        }

        return res.send({response: target_user, type: "user", userobj: userobj, auth: false})
    
    }

    if (data.searchType == "group"){
        try {
            var groupList = await groupFuns.getAllGroups(100)
        } catch (error) {
            console.log(error)
            res.send({response: "db error"})
        }
        
        //get group names
        let groupname = groupList.map(value => value.groupName);

        //get closest group name
        let target_group = closest(data.searchInput, groupname);

        //get group object
        let groupobj = groupList.find(value => value.groupName == target_group)

        //if user is authenticated
        if (req.session.user){
            //check if user is already in group
            let curr_user = req.session.user.user_id
            let inGroup = false;
            
            //check if user is already in group
            for (let i = 0; i < groupobj.members.length; i++){
                if (groupobj.members[i].toString() == curr_user.toString()){
                    inGroup = true;
                }
            }


            return res.send({response: target_group, type: "group", groupobj: groupobj, inGroup: inGroup, auth:true})
        }

        return res.send({response: target_group, type: "group", groupobj: groupobj, auth:false})
    }
})

router.post("/follow", async (req, res) => {
    if (!req.session.user){
        console.log("user not authenticated")
        return res.redirect("/login")
    }

    let user_id = req.session.user.user_id
    let data = req.body

    if (help.strPrep(data.username).length == 0){
        console.log("invalid username")
        return res.send({response: "failed"})
    }

    try {

        let userList = await userFuns.getAllUsers(100)
        //get target user by username
        let target_user = userList.find(value => value.username == data.username)
        console.log("target_user: " + target_user._id)

        //check if user is already following
        for (let i = 0; i < target_user.followers.length; i++){
            if (target_user.followers[i].toString() == user_id.toString()){
                console.log("already following")
                return res.send({response: "failed"})
            }
        }

        //add user to target user's followers
        await userFuns.addfollower(target_user._id, user_id)

        return res.send({response: "success"})

    } catch (error) {
        console.log(error)
        return res.send({response: "failed"})
    }
})

router.post("/unfollow", async (req, res) => {
    console.log("unfollow route hit")
    if (!req.session.user){
        console.log("user not authenticated")
        return res.redirect("/login")
    }

    let user_id = req.session.user.user_id
    let data = req.body

    if (help.strPrep(data.username).length == 0){
        console.log("invalid username")
        return res.send({response: "failed"})
    }

    try {
            
            let userList = await userFuns.getAllUsers(100)
            //get target user by username
            let target_user = userList.find(value => value.username == data.username)
    
            //check if user is not following
            for (let i = 0; i < target_user.followers.length; i++){
                if (target_user.followers[i].toString() != user_id.toString() && i == target_user.followers.length - 1){
                    console.log("not following")
                    return res.send({response: "failed"})
                }
            }
    
            //remove user from target user's followers
            await userFuns.removefollower(target_user._id, user_id)
    
            return res.send({response: "success"})
    
        } catch (error) {
            console.log(error)
            return res.send({response: "failed"})
        }

})


router.post("/join", async (req, res) => {
    if (!req.session.user){
        console.log("user not authenticated")
        return res.redirect("/login")
    }

    let user_id = req.session.user.user_id
    let data = req.body

    if (help.strPrep(data.groupname).length == 0){
        console.log("invalid groupname")
        return res.send({response: "failed"})
    }

    try {
            
            let groupList = await groupFuns.getAllGroups(100)
            //get target group by groupname
            let target_group = groupList.find(value => value.groupName == data.groupname)
    
            //check if user is already in group
            for (let i = 0; i < target_group.groupMembers.length; i++){
                if (target_group.groupMembers[i].toString() == user_id.toString()){
                    console.log("already in group")
                    return res.send({response: "failed"})
                }
            }
    
            //add user to target group's members
            await groupFuns.addMember(target_group._id, user_id)
    
            return res.send({response: "success"})
    
        } catch (error) {
            console.log(error)
            return res.send({response: "failed"})
        }

})

router.post("/leave", async (req, res) => {
    if (!req.session.user){
        console.log("user not authenticated")
        return res.redirect("/login")
    }

    let user_id = req.session.user.user_id
    let data = req.body

    if (help.strPrep(data.groupname).length == 0){
        console.log("invalid groupname")
        return res.send({response: "failed"})
    }

    try {
            
            let groupList = await groupFuns.getAllGroups(100)
            //get target group by groupname
            let target_group = groupList.find(value => value.groupName == data.groupname)
    
            //check if user is not in group
            for (let i = 0; i < target_group.groupMembers.length; i++){
                if (target_group.groupMembers[i].toString() != user_id.toString() && i == target_group.groupMembers.length - 1){
                    console.log("not in group")
                    return res.send({response: "failed"})
                }
            }

            //check if user is the owner
            if (target_group.groupOwner.toString() == user_id.toString()){
                console.log("user is owner")
                try {
                    //delete group
                    await groupFuns.deleteGroup(target_group._id, user_id)
                    res.send({response: "success"})
                } catch (error) {
                    console.log(error)
                    return res.send({response: "failed"})
                }
            
            }
    
            //remove user from target group's members
            await groupFuns.removeMember(target_group._id, user_id)
    
            return res.send({response: "success"})
    
        } catch (error) {
            console.log(error)
            return res.send({response: "failed"})
        }


})


export default router;
