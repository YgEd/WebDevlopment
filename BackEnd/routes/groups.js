import * as groupFuns from "../data/groups.js";
import * as userFuns from "../data/users.js";
import { ObjectId } from 'mongodb';
import help from "../helpers.js";
import xss from 'xss'
import { Router } from "express";
const router = Router();

router.get("/", async (req, res) => {
    //Ensure the user is logged in
    if (!req.session.user){
      console.log("user not authenticated");
      return res.redirect("/login")
    }

    try {
         //get user obj
        var targetUser = await userFuns.getUser(req.session.user.user_id);
    } catch (error) {
        console.log(error);
        return res.redirect("/login")
    }

    if (!targetUser){
      console.log("user not found");
      return res.redirect("/login")
    }

    //get all the groupIds the target user is a member of
    let groups_mem = [];
    for (let i = 0; i < targetUser.groupMembers.length; i++) {
        groups_mem.push(await groupFuns.getGroup(targetUser.groupMembers[i]))
    }

    //change each userIds to username in the groups
    try {
        for (let i = 0; i < groups_mem.length; i++) {
            let group = groups_mem[i];
            let owner = await userFuns.getUser(group.groupOwner);
            group.OwnerUser = owner.username;

            for (let i = 0; i < group.groupMembers.length; i++) {
                let user = await userFuns.getUser(group.groupMembers[i]);
                group.groupMembers[i] = user.username;
                
            }
        }
            
       

        //load page
        return res.render("groups", {
            logged_in: true,
            username: req.session.user.userName,
            user_id: req.session.user.user_id,
            groups: groups_mem,
        });

    } catch (error) {
        console.log("Error from get feed route: " + error);
    }

    

})

router.post("/", async (req, res) => {
    //Ensure the user is logged in
    if (!req.session.user){
        console.log("user not authenticated");
        return res.redirect("/login")
    }

    //ensure data was sent
    if (!req.body){
        console.log("no data sent");
        return res.send({response: false, message: "no data sent"})
    }

    //get req data
    let data = req.body

    console.log(data);

    //ensure data is valid
    if (!data.groupName || help.strPrep(data.groupName).length == 0){
        console.log("invalid data");
        return res.send({response: false, message: "invalid data"})
    }

     //trim data
     data.groupName = help.strPrep(data.groupName).substring(0, 30);
     try {
        //create group
        var newGroup = await groupFuns.createGroup(data.groupName, req.session.user.user_id);
     } catch (error) {
        console.log(error);
        return res.send({response: false, message: error})
     }
     

    if (help.strPrep(data.description).length == 0){
        return res.send({response: true})
    }

    data.description = help.strPrep(data.description).substring(0, 100);
    //add description if provided
    try {
        await groupFuns.addGroupDescription(newGroup._id, data.description,req.session.user.user_id );
        return res.send({response: true})
    } catch (error) {
        console.log(error);
        return res.send({response: false, message: error})
    }

})
router.get("/:groupId", async (req, res) => {
    //Ensure the user is logged in
    if (!req.session.user){
      console.log("user not authenticated");
      return res.redirect("/login")
    }
    
    try {
         //get user obj
        var targetUser = await userFuns.getUser(req.session.user.user_id);
    } catch (error) {
        console.log(error);
        return res.redirect("/login")
    }

    if (!targetUser){
      console.log("user not found");
      return res.redirect("/login")
    }
    
    let groupId = req.params.groupId
    
    try {
        var groupMatch = false
        let i =0
        while (i< targetUser.groupsOwned.length){
            if (targetUser.groupsOwned[i] == groupId){
                groupMatch = true;
                break;
            }
        }
        if (!groupMatch){
            return res.redirect("/groups")
        }
        if (!groupId) {
          return res.redirect("/groups")
        }
        if (!ObjectId.isValid(groupId)) {
            return res.redirect("/groups")
        }
      }catch(e) {
        return res.status(400).render("error", {message: e});
      }
      try {
        let groupInfo = await groupFuns.getGroup(new ObjectId(groupId));
        if (!groupInfo) {
          throw `could not retrieve group info`
        }
        console.log(`${groupInfo.groupOwner} ${groupInfo.groupName}`)
        return res.render("groupId", {logged_in: true,title: `Group ${groupInfo.groupName}`, group: groupInfo, coach: true } )
      }catch(e) {
        return res.status(400).render("error", {message: e});
      }
    });
router.get("/:groupId/add", async (req, res) => {
    if (!req.session.user){
        console.log("user not authenticated");
        return res.redirect("/login")
      }
      
      try {
           //get user obj
          var targetUser = await userFuns.getUser(req.session.user.user_id);
      } catch (error) {
          console.log(error);
          return res.redirect("/login")
      }
  
      if (!targetUser){
        console.log("user not found");
        return res.redirect("/login")
      }
      
      let groupId = req.params.groupId
      
      try {
        let groupMatch = false
        let i =0
        while (i< targetUser.groupsOwned.length){
            if (targetUser.groupsOwned[i] == groupId){
                groupMatch = true;
                break;
            }
        }
        if (!groupMatch){
            return res.redirect("/groups")
        }
          if (!groupId) {
            return res.redirect("/groups")
          }
          if (!ObjectId.isValid(groupId)) {
              return res.redirect("/groups")
          }
        }catch(e) {
          return res.status(400).render("error", {message: e});
        }
        try {
            let groupInfo = await groupFuns.getGroup(new ObjectId(groupId));
            if (!groupInfo) {
              throw `could not retrieve group info`
            }
            return res.render("groupRecAdd", {title: `Adding Recommendations to ${groupInfo.groupName}`, id: groupId, groupName:groupInfo.groupName })
          }catch(e) {
            return res.status(400).render("error", {message: e});
          }
        
    })
router.post("/:groupId/add", async (req, res) => {
    if (!req.session.user){
        console.log("user not authenticated");
        return res.redirect("/login")
      }
      
      try {
           //get user obj
          var targetUser = await userFuns.getUser(req.session.user.user_id);
      } catch (error) {
          console.log(error);
          return res.redirect("/login")
      }
  
      if (!targetUser){
        console.log("user not found");
        return res.redirect("/login")
      }
      
      let groupId = req.params.groupId
      
      try {
        let groupMatch = false
        let i =0
        while (i< targetUser.groupsOwned.length){
            if (targetUser.groupsOwned[i] == groupId){
                groupMatch = true;
                break;
            }
        }
        if (!groupMatch){
            return res.redirect("/groups")
        }
          if (!groupId) {
            return res.redirect("/groups")
          }
          if (!ObjectId.isValid(groupId)) {
              return res.redirect("/groups")
          }
        }catch(e) {
          return res.status(400).render("error", {message: e});
        }
        let workoutName = xss(req.body.workoutName);
        let equipment = xss(req.body.equipment);
        let duration = xss(req.body.duration);
        let level = xss(req.body.level);
        let reps = xss(req.body.reps);
        let rounds = xss(req.body.rounds);
        let tags = xss(req.body.tags);
            try{
            workoutName = help.checkString(workoutName, "Workout name").toUpperCase();
            equipment = help.checkString(equipment, "Name of equipment");
            help.isNum(duration)
            if (duration <= 0 || duration >= 60) throw "The work out is too long or invalid number of minutes"
            level = help.checkString(level, "level").toLowerCase()
            if (level !== "beginner" && level !== "intermediate" && level !== "advanced" ) throw "not valid level"
            help.isNum(reps)
            if (reps <= 0 || reps >1000) throw "Invalid reps number for this work out"
            help.isNum(rounds)
            if (rounds <= 0 || rounds >= 20) throw "Invalid rounds number for this work out"
            //tag help
            tags = help.checkString(tags, "tags")
            } catch (e){
                return res.status(400).render("groupRecAdd",{title: "Adding Recommendations", error: e})
              }
        try{
            let addRec = groupFuns.addRecommendationToGroup(groupId,workoutName, equipment, duration, level, reps, rounds, tags);
            if (addRec) return res.redirect(`/groups/${groupId}`)
        } catch (e){
            return res.status(400).render("groupRecAdd",{title: "Adding Recommendations", error: e})
        }
            

})
router.post("/edit/:id", async (req, res) => {
    //ensure user is logged in
    if (!req.session.user){
        console.log("user not authenticated");
        return res.redirect("/login")
    }

    //ensure data was sent
    if (!req.body){
        console.log("no data sent");
        return res.redirect("/groups")
    }

    let data = req.body;
    console.log("from post edit group")
    console.log(data.group)
    let user = req.session.user;

    //ensure data is valid
    if (help.strPrep(data.groupName).length == 0 || help.strPrep(data.description) == 0){
        console.log("invalid data");
        return res.redirect("/groups")
    }

    //trim data
    data.groupName = help.strPrep(data.groupName).substring(0, 30);
    data.description = help.strPrep(data.description).substring(0, 100);

    //get group
    try {
        var group = await groupFuns.getGroup(data.groupId);

        //ensure group exists
        if (!group){
            console.log("group not found");
            return res.redirect("/groups")
        }

        //ensure user is owner of group
        if (group.groupOwner != req.session.user.user_id){
            console.log("user not owner");
            return res.redirect("/groups")
        }

        //update group
        await groupFuns.updateGroup(data.groupId, data.groupName, user.user_id, group.groupMembers, group.groupPosts, data.description);

        return res.redirect("/groups")
    } catch (error) {
        console.log(error);
        return res.redirect("/groups")
    }



})

router.get("/edit/:id", async (req, res) => {
    //Ensure the user is logged in
    if (!req.session.user){
        console.log("user not authenticated");
        return res.redirect("/login")
    }

    //ensure data was sent
    if (!req.params.id){
        console.log("no data sent");
        return res.redirect("/groups")
    }

    //get req data
    let data = req.params.id

    //ensure data is valid
    if (!data){
        console.log("invalid data");
        return res.redirect("/groups")
    }

    //get group
    try {
        var group = await groupFuns.getGroup(data);

        //ensure group exists
        if (!group){
            console.log("group not found");
            return res.redirect("/groups")
        }

        //ensure user is owner of group
        if (group.groupOwner != req.session.user.user_id){
            console.log("user not owner");
            return res.redirect("/groups")
        }


        //get each group members username besides the owner
        let groupUsers = [];
        for (let i = 0; i < group.groupMembers.length; i++) {
            if (group.groupMembers[i].toString() == group.groupOwner.toString()){
                continue;
            }
            let user = await userFuns.getUser(group.groupMembers[i]);
           groupUsers.push(user.username)
        }

        //add group members to group obj
        group.groupUsers = groupUsers;

        //load page
        return res.render("group_edit", {
            logged_in: true,
            username: req.session.user.userName,
            user_id: req.session.user.user_id,
            group: group,
        });
    } catch (error) {
        console.log(error);
        return res.redirect("/groups")
    }

    
})



router.post("/delete_group", async (req, res) => {
    console.log("/edit/delete")
    //ensure user is logged in
    if (!req.session.user){
        console.log("user not authenticated");
        return res.redirect("/login")
    }

    //ensure data was sent
    if (!req.body){
        console.log("no data sent");
        return res.redirect("/groups")
    }

    let data = req.body;
    let user = req.session.user;

    //ensure data is valid
    if (help.strPrep(data.groupId).length == 0){
        console.log("invalid data");
        return res.send({response: false})
    }

    //get group
    try {
        var group = await groupFuns.getGroup(data.groupId);

        //ensure group exists
        if (!group){
            console.log("group not found");
            return res.send({response: false})
        }

        //ensure user is owner of group
        if (group.groupOwner != req.session.user.user_id){
            console.log("user not owner");
            return res.send({response: false})
        }

        //delete group
        await groupFuns.deleteGroup(data.groupId, user.user_id);

        return res.send({response: true})
    } catch (error) {
        console.log(error);
        return res.send({response: false})
    }


})

router.post("/remove_member", async (req, res) => {
    //remove target member route
    //ensure user is logged in
    if (!req.session.user){
        console.log("user not authenticated");
        return res.redirect("/login")
    }

    //ensure data was sent
    if (!req.body){
        console.log("no data sent");
        return res.redirect("/groups")
    }

    let data = req.body;
    console.log("from post remove member")
    console.log(data)

    //ensure data is valid
    if (!data.groupId || !data.userName){
        console.log("invalid data");
        return res.redirect("/groups")
    }

    //ensure valid inputs
    if (!ObjectId.isValid(data.groupId) || help.strPrep(data.userName).length == 0){
        console.log("invalid data");
        return res.redirect("/groups")
    }

    try {
        //get user
        var user = await userFuns.getUserByUsername(data.userName);

        //ensure user exists
        if (!user){
            console.log("user not found");
            return res.redirect("/groups")
        }

        //get group
        
        var group = await groupFuns.getGroup(data.groupId);

        //ensure group exists
        if (!group){
            console.log("group not found");
            return res.redirect("/groups")
        }

        //ensure user is owner of group
        if (group.groupOwner != req.session.user.user_id){
            console.log("user not owner");
            return res.redirect("/groups")
        }

        //ensure user is not owner
        if (user._id == group.groupOwner){
            console.log("user is owner");
            return res.redirect("/groups")
        }

        //remove user from group
        await groupFuns.memberRemove(data.groupId, user._id);

        return res.send({response: true})
    } catch (error) {
        console.log(error);
        return res.send({response: false})
    }



})



export default router;