
import { ObjectId } from "mongodb";
import { posts,users,recs } from "../config/mongoCollections.js";
import recsDataCollection from './recommendations.js'


export const recsData = recsDataCollection;