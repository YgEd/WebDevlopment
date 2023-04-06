import {dbConnection, closeConnection} from './config/mongoConnection.js';
import * as help from "./helpers.js"
import * as user from "./data/users.js"
import * as post from "./data/posts.js"


const db = await dbConnection();
await db.dropDatabase();

let josh = await user.createUser(
    "joshmeh",
    "asdf123",
    "03/04/2002",
    "hey im josh",
    ["want to get bigger"]
)

let tim = await user.createUser(
    "tim",
    "password123",
    "04/13/1997",
    "its me tim",
    ["I want to run fastest", "make my momma proud"]
)

let jon = await user.createUser(
    "jon",
    "password",
    "05/11/2001",
    "hi man",
    ["I like fish"]
)


console.log(await post.createPost(jon._id, "run", "great run today", [], []))

await  user.updateUser(
    josh._id,
    "joshmeh",
    "123asdf",
    [],
    0,
    "hey its me josh",
    [],
    ["get biggest"]

)

console.log(await user.getAllUsers())

console.log(await user.removeUser(tim._id))


const date = new Date()
console.log(date.toLocaleTimeString())

console.log("exiting");
await closeConnection();