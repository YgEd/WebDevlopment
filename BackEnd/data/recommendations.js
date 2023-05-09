import { ObjectId } from "mongodb";
import { users,recs } from "../config/mongoCollections.js";
import validation from "../helpers.js"
let exportedMethods = {
    async createRec  (
    workoutName,
    equipment,
    duration,
    level,
    reps,
    rounds,
    tags 
  ) {
    workoutName = validation.checkString(workoutName, "Workout name").toUpperCase();
    equipment = validation.checkString(equipment, "name of equipment");
    validation.isNum(duration)
    if (duration <= 0 || duration >= 60) throw "The work out is too long or invalid number of minutes"
    level = validation.checkString(level, "level").toLowerCase()
    if (level !== "beginner" && level !== "intermediate" && level !== "advanced" ) throw "not valid level"
    validation.isNum(reps)
    if (reps <= 0 || reps >1000) throw "Invalid reps number for this work out"
    validation.isNum(rounds)
    if (rounds <= 0 || rounds >= 20) throw "Invalid rounds number for this work out"
    // tags = validation.checkStringArray(tags, "tags")
    tags = validation.checkString(tags, "tags");
    let recsCollection = await recs()
    let newRec = {
        workoutName: workoutName,
        equipment: equipment,
        duration: duration,
        level: level,
        reps: reps,
        rounds: rounds,
        tags: tags
    }
    const findRec = await recsCollection.findOne({ workoutName: workoutName });
  
  //check if if user is found with same username
    if (findRec != null) throw "This workout has been existed"
    const insertInfo = await recsCollection.insertOne(newRec);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw  "could not add recommendations";
    }
    //return this object if success
    return true

  },
async deleteRec (id) {
    id = validation.checkId(id, "recommendation id")
    let recsCollection = await recs();
    const deletionInfo = await recsCollection.findOneAndDelete({
        _id: ObjectId(id)
      });
      if (deletionInfo.lastErrorObject.n === 0)
        throw [404, `Could not delete reccomendation with id of ${id}`];
    return true
},
async getRec(recId){
  //function name to use for error throwing
  let fun = "getRec";
  //test if given id is a valid ObjectId type
  if (!ObjectId.isValid(recId)) {
    help.err(fun, "invalid object ID '" + recId + "'");
  }

  //if recId is ObjectId turn into String
  recId = recId.toString().trim();

  //get rec db
  const recCollection = await recs();
  const findRec = await recCollection.findOne({ _id: new ObjectId(recId) });

  //if user is not found throw error
  if (findRec == null) {
    help.err(fun, "reccommendation with ObjectId '" + recId + "' wasn't found");
  }

  return findRec;
},
async getAllRecs() {
    //function name to use for error throwing
    let fun = "getAllRecs";
    //get users db collection
    const recsCollection = await recs();
  
    //test if userCollection is null
    if (recsCollection == null) {
      help.err(fun, "could not get recommendations");
    }
  
   
    const recsList = await recsCollection.find().toArray();

    //return array of users
    return recsList;
  },
async getRandomRec(){
    let allRec = await this.getAllRecs();
    return validation.getRandomItem(allRec);
},
//Source: From professor Hill github
async searchRecommendationsByKeyword(query) {
  if (!query) {
      throw "No search term given"
  }

  const recsCollection = await recs();
  const regex = new RegExp([".*", query, ".*"].join(""), "i");

  return recsCollection
      .find({
          $or: [
              { "workoutName": regex },
              { "equipment": regex },
              { "level": regex },
              { "tags": regex },
          ]
      })
      .toArray();
}
}
  export default exportedMethods;
