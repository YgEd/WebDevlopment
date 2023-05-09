import * as postFuns from "../data/posts.js";
import * as userFuns from "../data/users.js";
import * as groupFuns from "../data/groups.js";
import help from "../helpers.js";
import {distance, closest} from "fastest-levenshtein"
import xss from 'xss'
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

    res.render("search", {title: "search", logged_in: logged_in, user: user})


})


router.post("/", async (req, res) => {
    if (!req.session.user) return res.redirect("/")
    let data = req.body
    let groupOwner = false;
    console.log("post search route hit")
    console.log(data)
    if (help.strPrep(data.searchType).length == 0 || data.searchType != "user" && data.searchType != "group"){
        console.log("invalid search type")
        return res.redirect("/search")
    }

    if (help.strPrep(xss(data.searchInput)).length == 0 || help.strPrep(xss(data.searchInput)).length > 30){
        console.log("invalid search length")
        return res.redirect("/search")
    }
    let userobj = await userFuns.getUser(req.session.user.user_id);
    if (xss(data.searchType) == "user"){
        try {
            let userList = await userFuns.searchUserByKeyword(xss(data.searchInput));
            userList = userList.filter(user => user._id.toString() != userobj._id);
            // If the user is authenticated
            
            let following = userobj.following
            
            res.send({response: userList, type: "user", auth:true, following: following, auth: true, userobj: userobj})
          } catch (error) {
            console.error(error);
            res.send({ response: "db error" });
          }
        }

    if (xss(data.searchType) == "group"){
        try {
            let groupList = await groupFuns.searchGroupByKeyword(xss(data.searchInput));
        
            // If the user is authenticated
            
            let groupsOwned = await groupFuns.allGroupsWithUserId(userobj._id.toString())
            
            res.send({response: groupList, type: "group", auth:true, groupOwner: groupsOwned, auth: true, userobj: userobj})
          } catch (error) {
            console.error(error);
            res.send({ response: "db error" });
          }
        }
})

router.post("/follow", async (req, res) => {
    if (!req.session.user){
        console.log("user not authenticated")
        return res.redirect("/login")
    }

    let user_id = req.session.user.user_id
    let data = req.body
    console.log("follow route hit")
    console.log("data.url =")
    console.log(data.url)


    if (help.strPrep(data.username).length == 0){
        console.log("invalid username")
        if (!req.body.url){
            return res.send({response: "failed"})
        }else{
            return res.redirect(req.body.url)       
        }
    }

    try {

        
        //get target user by username
        let target_user = await userFuns.getUserByUsername(data.username)
        
        console.log("target_user: " + target_user._id)

        //check if user is already following
        for (let i = 0; i < target_user.followers.length; i++){
            if (target_user.followers[i].toString() == user_id.toString()){
                console.log("already following")
                if (!req.body.url){
                return res.send({response: "failed"})
                }else{
                    return res.redirect(req.body.url)
                }
            }
        }

        //add user to target user's followers
        await userFuns.addfollower(target_user._id, user_id)

        if (!req.body.url){
            return res.send({response: "success"})
        }else{
            return res.redirect(req.body.url)
        }

    } catch (error) {
        console.log(error)
        if (!req.body.url){
            return res.send({response: "failed"})
        }else{
            return res.redirect(req.body.url)
        }
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

    console.log("data.url =")
    console.log(data.url)

    if (help.strPrep(data.username).length == 0){
        console.log("invalid username")
        if (!req.body.url){
            return res.send({response: "failed"})
        }else{
            return res.redirect(req.body.url)
        }
    }

    try {
            
            //get target user by username
            let target_user = await userFuns.getUserByUsername(data.username)
           
            //check if user is not following
            for (let i = 0; i < target_user.followers.length; i++){
                if (target_user.followers[i].toString() != user_id.toString() && i == target_user.followers.length - 1){
                    console.log("not following")
                    if (!req.body.url){
                        return res.send({response: "failed"})
                    }else{
                        return res.redirect(req.body.url)
                    }
                }
            }
    
            //remove user from target user's followers
            await userFuns.removefollower(target_user._id, user_id)
            
            if (!req.body.url){
                return res.send({response: "success"})
            }else{
                return res.redirect(req.body.url)
            }
    
        } catch (error) {
            console.log(error)
            if (!req.body.url){
                return res.send({response: "failed"})
            }else{
                return res.redirect(req.body.url)
            }
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
            await groupFuns.memberAdd(target_group._id, user_id)
    
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
            
            //get target group by groupname
            let target_group = await groupFuns.getGroupByName(data.groupname)
    
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
            await groupFuns.memberRemove(target_group._id, user_id)
    
            return res.send({response: "success"})
    
        } catch (error) {
            console.log(error)
            return res.send({response: "failed"})
        }


})


export default router;
