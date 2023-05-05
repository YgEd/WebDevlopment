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
    if (data.searchType != "user" && data.searchType != "group"){
        console.log("invalid search type")
        return res.redirect("/search")
    }

    if (help.strPrep(data.searchInput).length == 0 || help.strPrep(data.searchInput).length > 30){
        console.log("invalid search length")
        return res.redirect("/search")
    }

    if (data.searchType == "user"){
        let userList = await userFuns.getAllUsers(100)
        //get usernames
        userList = userList.map(value => value.username);
        let target_user = closest(data.searchInput, userList)
        console.log("target user found = " + target_user)
        return res.send({response: target_user})
    
    }

    if (data.searchType == "group"){
        let groupList = await groupFuns.getAllGroups(100)
        //get group names
        groupList = groupList.map(value => value.groupName);
        let target_group = closest(data.searchInput, groupList)
        return res.send({response: target_group})
    }
})


export default router;