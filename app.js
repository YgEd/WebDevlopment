import * as postFuns from "./BackEnd/data/posts.js"
import * as userFuns from "./BackEnd/data/users.js"

import express from 'express';
const app = express();
import configRoutes from './BackEnd/routes/index.js';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import exphbs from 'express-handlebars';
import session from 'express-session';
import cookieParser from 'cookie-parser';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



const staticDir = express.static(__dirname + '/public');




const handlebarsInstance = exphbs.create({
  defaultLayout: 'main',
  // Specify helpers which are only registered on this instance.
  helpers: {
    asJSON: (obj, spacing) => {
      if (typeof spacing === 'number')
        return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));

      return new Handlebars.SafeString(JSON.stringify(obj));
    },

    //https://stackoverflow.com/questions/33316562/how-to-compare-a-value-in-handlebars
    when: (operand_1, operator, operand_2, options) => {
      var operators = {
        'eq': function(l,r) { 
          return l == r; },
        'noteq': function(l,r) {
           return l != r; },
        'gt': function(l,r) { return Number(l) > Number(r); },
        'or': function(l,r) { return l || r; },
        'and': function(l,r) { return l && r; },
        '%': function(l,r) { return (l % r) === 0; }
       }
       , result = operators[operator](operand_1,operand_2);
     
       if (result) return options.fn(this);
       else  return options.inverse(this);

    },

    //handlebars helper function
    setFalse: (variable, options) => {
      //console.log("value of " + variable + " before changing is" + options.data.root[variable])
      options.data.root[variable] = false;
      //console.log("value " + variable + " is set to: " + options.data.root[variable])
    },

    setTrue: (variable, options) => {
      options.data.root[variable] = true;
      //console.log("value " + variable + " is set to: " + options.data.root[variable])
    }

  }
});




// const partialsPath = path.join(__dirname, "/views/partials")
// exphbs.registerPartials(partialsPath)


app.use(cookieParser());
app.use('/public', staticDir);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.use(session({
    name: 'AuthCookie',
    secret: 'some secret ',
    resave: false,
    saveUninitialized: false,
  }))
  

app.engine('handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');

//middlewares


  app.use('/login', async (req, res, next) => {
    if(req.session.user){
        return res.redirect("/")
    }
    next();
  });

  app.use('/register', async (req, res, next) => {
    console.log("nice to meet you")
    if(req.session.user){
        return res.redirect("/")
    }
    next();
  });

  app.use('/profile', async (req, res, next) => {
    if(!req.session.user){
        return res.redirect('/')
    }
    next();
  });

  

  app.use('/logout', async (req, res, next) => {
    if(!req.session.user){
        return res.redirect('/')
    }
    next();
  });
 

  app.use(async (req, res, next) => {
   console.log(`[${new Date().toUTCString()}] ${req.method} ${req.originalUrl} - authenticated: ${req.session.user ? 'true' : 'false'}`);
    next();
  })
  
  





configRoutes(app);

//allow has to have session cookies
app.use(
  session({
    name: 'AuthCookie',
    secret: "This is a secret.. shhh don't tell anyone",
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: 60000}
  })
);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});

import {dbConnection, closeConnection} from './BackEnd/config/mongoConnection.js';

// const db = await dbConnection();
// await db.dropDatabase();

// let j = await userFuns.createUser("james", "james", "greenwood", "jgreenwood@yahoo.com", "HeyMans1!2##4#12", "03/04/2002")
// console.log("created james")
// let first = await postFuns.createPost(j._id, "great day", "running", "I love to runddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd", ["/public/img/cutedog.jpg"],[])
// await postFuns.updatePost(first._id, "great day", first.workoutType, "I love to run", ["/public/img/cutedog.jpg"],[j._id], [], [])
// await postFuns.createPost(j._id, "great day","running", "I love to run", ["/public/img/cutedog.jpg"],[])
// await postFuns.createPost(j._id, "great day","running", "I love to run", ["/public/img/cutedog.jpg"],[])
// await postFuns.createPost(j._id, "great day","running", "I love to run", ["/public/img/cutedog.jpg"],[])
// await postFuns.createPost(j._id, "great day","running", "I love to run", ["/public/img/cutedog.jpg"],[])
// await postFuns.createPost(j._id, "great day","running", "I love to run", ["/public/img/cutedog.jpg"],[])
// await postFuns.createPost(j._id, "great day","running", "I love to run", ["/public/img/cutedog.jpg"],[])
// await postFuns.createPost(j._id, "great day","running", "I love to run", ["/public/img/cutedog.jpg"],[])
// await postFuns.createPost(j._id, "great day","running", "I love to run", ["/public/img/cutedog.jpg"],[])
// await postFuns.createPost(j._id, "great day","running", "I love to run", ["/public/img/cutedog.jpg"],[])
// await postFuns.createPost(j._id, "great day","running", "I love to run", ["/public/img/cutedog.jpg"],[])
// let steve = await userFuns.createUser("sDog", "steve", "ringwood", "swood@gmail.com", "!@#123QWEasd", "03/04/2002")
// console.log("created Steve")
// await userFuns.updateUser(steve._id, "sDog","steve","ringwood","swood@gmail.com","!@#123QWEasd",[],0,"hey man",[],[],[],[j._id],[j._id])




