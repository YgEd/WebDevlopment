
import userData from '../data/users.js'
import {Router} from 'express';
const router = Router();
import validation from '../helpers.js';
router.route('/').get(
  (req, res, next) => {
    console.log('middleware fired');
    if (req.session.user) {
      if (req.session.user.role === 'admin') return res.redirect("/admin")
      else return res.redirect("/protected")
    } else {
      return res.redirect("/login")
    }
    next();
  },
  async (req, res) => {
    //code here for GET THIS ROUTE SHOULD NEVER FIRE BECAUSE OF MIDDLEWARE #1 IN SPECS.
    return res.json({error: 'YOU SHOULD NOT BE HERE!'});
  }
);
router
  .route('/register')
  .get(async (req, res) => {
    //code here for GET
    return res.render('register', {title: "Register Form"})
  })
  .post(async (req, res) => {
    //code here for POST
    let {firstNameInput,lastNameInput,emailAddressInput,passwordInput,confirmPasswordInput,roleInput} = req.body;
    let missing = []
    //if any are missing you will re-render the form with a 400 status code explaining to the user which fields are missing. 
    if (!firstNameInput) missing.push("First Name")
    if (!lastNameInput) missing.push("Last Name")
    if (!emailAddressInput) missing.push("Email Address")
    if (!passwordInput) missing.push("Password")
    if (!confirmPasswordInput) missing.push("Confirm Password")
    if (!roleInput) missing.push("Role")
    if (missing.length >0) return res.status(400).render("register",{title: "Register Form", error: `Missing: ${missing.join(', ')}`})
    try{
      firstNameInput = validation.checkName(firstNameInput,"First Name");
      lastNameInput = validation.checkName(lastNameInput,"Last Name");
      emailAddressInput = validation.checkEmail(emailAddressInput, "Email Address");
      passwordInput = validation.checkPassword(passwordInput,"Password")
      if (passwordInput !== confirmPasswordInput) throw "password and confirm Password must match"
      roleInput = validation.checkRole(roleInput, "Role")
    } catch (e){
      return res.status(400).render("register",{title: "Register Form", error: e})
    }
    try{
      let insertedUser =  (await userData.createUser(firstNameInput,lastNameInput,emailAddressInput,passwordInput,roleInput)).insertedUser;
      if (insertedUser === true) return res.redirect('/login')
    } catch (e){
      return res.status(400).render("register",{title: "Register Form", error: e})
    }
    return res.status(500).render('error', {title: 'Error',message: "Internal Server Error"})
  });

router
  .route('/login')
  .get(async (req, res) => {
    //code here for GET
    return res.render('login', {title: "Login Form"})
  })
  .post(async (req, res) => {
    //code here for POST
    let {emailAddressInput, passwordInput} = req.body;
    try{
      emailAddressInput = validation.checkEmail(emailAddressInput,"Email Address");
      passwordInput = validation.checkPassword(passwordInput, "Password");
    } catch (e){
      return res.status(400).render('login', {title: "Login Form", error: e})
    }
    try {
      let user = await userData.checkUser(emailAddressInput,passwordInput);
      if (user) {
        req.session.user = user;
        if (user.role === 'admin') return res.redirect('/admin')
        if (user.role === 'user') return res.redirect('/protected')
      }
    }catch (e){
      return res.status(400).render('login', {title: "Login Form", error: e})
    }
  });

router.route('/protected').get(async (req, res) => {
  //code here for GET
  if (req.session.user){
  if (req.session.user.role === 'admin') 
    return res.render('protected',{title: 'Protected Page',firstName: req.session.user.firstName, currentTime: new Date().toUTCString(), role: req.session.user.role, admin :"<a href='/admin'>Admin Page</a>"})
  else return res.render('protected',{title: 'Protected Page',firstName: req.session.user.firstName, currentTime: new Date().toUTCString(), role: req.session.user.role})
  }
  
});

router.route('/admin').get(async (req, res) => {
  //code here for GET
  if (req.session.user){
    if (req.session.user.role === 'admin') 
      return res.render('admin', {title: "Admin Page", firstName: req.session.user.firstName, currentTime: new Date().toUTCString()})
    else return res.status(403).redirect('error')
  }
  else return res.status(400).redirect('error')
});

router.route('/error').get(async (req, res) => {
  //code here for GET
  if (req.session.user)
    return res.status(403).render('error', {title: 'Error', message: 'You must be an admin to see this page'})
  else{
    return res.status(400).render('error', {title: 'Error', message: 'You must log in to see this page'})
  }
});

router.route('/logout').get(async (req, res) => {
  //code here for GET
  
  req.session.destroy();
  return res.render('logout',{title: 'Logging out'});
});
export default router