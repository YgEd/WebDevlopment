
import express from 'express';
const app = express();
import configRoutes from './BackEnd/routes/index.js';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import exphbs from 'express-handlebars';
import session from 'express-session'

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
    }
  }
});

app.use('/public', staticDir);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

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
        return res.redirect("/protected")
    }
    next();
  });

  app.use('/register', async (req, res, next) => {
    console.log("nice to meet you")
    if(req.session.user){
        return res.redirect("/protected")
    }
    next();
  });

  app.use('/protected', async (req, res, next) => {
    if(!req.session.user){
        return res.redirect('/login')
    }
    next();
  });

  

  app.use('/logout', async (req, res, next) => {
    if(!req.session.user){
        return res.redirect('/login')
    }
    next();
  });
 

  app.use(async (req, res, next) => {
   console.log(`[${new Date().toUTCString()}] ${req.method} ${req.originalUrl} - authenticated: ${req.session.user ? 'true' : 'false'}`);
    next();
  })
  
  





configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});

  




