import {Router} from 'express';
const router = Router();
import validation from "../helpers.js";
import multer from 'multer';
import {photos} from "../config/mongoCollections.js";
import { ObjectId } from 'mongodb';
import {uploadPhoto, upload, getPhotoSrc } from '../data/photos.js';
import recData from "../data/recommendations.js"
import xss from 'xss'
router
  .route('/')
  .get(async (req, res) => {
    let recs = await recData.getAllRecs()
    if (!req.session.user) return res.render("recommendations", {title: "All Recommendations", recs: recs})
    if (req.session.user.groupsOwned.length > 0)
        return res.render("recommendations", {title: "Adding Recommendations", recs: recs,coach: true, logged_in: true});
    else return res.render("recommendations", {title: "Adding Recommendations", recs: recs, logged_in: true});
    
})
router.route('/search').post(async(req,res) =>{
    
    let keyword = req.body.keyword
    try{
    keyword = xss(keyword)
    keyword = validation.checkString(keyword, "search keyword")
    let results = await recData.searchRecommendationsByKeyword(keyword)
    if (results.length == 0) throw "No results"
    return res.render("recommendations", {title: "Search result", recs: results})
    } catch (e){
        return res.status(400).render("recommendations",{title: "Search error", error: e})
    }
})
router
  .route('/add')
  .get( async(req, res) =>{
    return res.render("coach", {title: "Adding Recommendations", logged_in: true});
})
.post(async (req,res) =>{
    let workoutName = req.body.workoutName
    let equipment = req.body.equipment
    let duration = req.body.duration
    let level = req.body.level
    let reps = req.body.reps
    let rounds = req.body.rounds
    let tags = req.body.tags
        try{

            workoutName = xss(workoutName)
            equipment = xss(equipment)
            duration = xss(duration)
            level = xss(level)
            reps = xss(reps)
            rounds = xss(rounds)
            tags = xss(tags)
        workoutName = validation.checkString(workoutName, "Workout name").toUpperCase();
        equipment = validation.checkString(equipment, "Name of equipment");
        validation.isNum(duration)
        if (duration <= 0 || duration >= 60) throw "The work out is too long or invalid number of minutes"
        level = validation.checkString(level, "level").toLowerCase()
        if (level !== "beginner" && level !== "intermediate" && level !== "advanced" ) throw "not valid level"
        validation.isNum(reps)
        if (reps <= 0 || reps >1000) throw "Invalid reps number for this work out"
        validation.isNum(rounds)
        if (rounds <= 0 || rounds >= 20) throw "Invalid rounds number for this work out"
        //tag validation
        tags = validation.checkString(tags, "tags")
        } catch (e){
            return res.status(400).render("coach",{title: "Adding Recommendations", error: e, logged_in: true})
          }
        try {
            let addRec = recData.createRec(workoutName, equipment, duration, level, reps, rounds, tags);
            if (addRec) return res.redirect("/recommendation")
        } catch (e){
            return res.status(400).render("coach",{title: "Adding Recommendations", error: e, logged_in: true})
        }
})
router
    .route('/:recId')
    .get(async (req, res) => {
        //get rec by id and send to rec specific page
        let recId = req.params.recId;
        let thisRec;
        try {
            if (typeof recId !== "string") {
                throw `recId must be a string`
            }
            recId = recId.trim();
            if (recId == "") {
                throw `recId cannot be empty`
            }
            if (!ObjectId.isValid(new ObjectId(recId))) {
                throw `invalid recId`
            }
        }catch(e) {
            console.log(e);
            return res.status(400).send(e);
        }
        try {
            thisRec = await recData.getRec(recId);
        }catch(e) {
            console.log(e);
            return res.status(404).send("could not find reccomendation");
        }
        if (req.session.user) return res.render("rec", {title: thisRec.workoutName, workout: thisRec, logged_in: true})
        return res.render("rec", {title: thisRec.workoutName, workout: thisRec});
    });
export default router