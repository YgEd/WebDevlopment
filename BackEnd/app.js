import {dbConnection, closeConnection} from './config/mongoConnection.js';
import * as help from "./helpers.js"
import * as user from "./data/users.js"


const db = await dbConnection();
await db.dropDatabase();

console.log(await user.createUser(
    "joshmeh",
    "asdf123",
    "03/04/2002",
    "hey im josh",
    ["want to get bigger"]
))





console.log("exiting");
await closeConnection();