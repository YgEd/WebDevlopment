
import {createUser,checkUser}  from '../data/users.js'
import {Router} from 'express';
const router = Router();
import validation from '../helpers.js';
router.route('/')
  .get(async (req, res) =>{
    let logged_in = false
    if(req.session.user){
      logged_in = true;
    }
    console.log(logged_in)
        return res.render('posts/home', {logged_in: logged_in})
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
    let {username, firstNameInput,lastNameInput,emailAddressInput,passwordInput,confirmPasswordInput, dob} = req.body;
    let missing = []
    //if any are missing you will re-render the form with a 400 status code explaining to the user which fields are missing. 
    if (!username) missing.push("User name")
    if (!firstNameInput) missing.push("First Name")
    if (!lastNameInput) missing.push("Last Name")
    if (!emailAddressInput) missing.push("Email Address")
    if (!passwordInput) missing.push("Password")
    if (!confirmPasswordInput) missing.push("Confirm Password")
    if  (!dob) missing.push("enter date of birth")
    if (missing.length >0) return res.status(400).render("register",{title: "Register Form", error: `Missing: ${missing.join(', ')}`})
    try{
      username = validation.checkUsername(username, "UserName");
      firstNameInput = validation.checkName(firstNameInput,"First Name");
      lastNameInput = validation.checkName(lastNameInput,"Last Name");
      emailAddressInput = validation.checkEmail(emailAddressInput, "Email Address");
      passwordInput = validation.checkPassword(passwordInput,"Password");
      if (passwordInput !== confirmPasswordInput) throw "password and confirm Password must match"
      // dob = validation.checkDOB(dob,"Date of Birth")
    } catch (e){
      console.log(e)
    }
    try{
      let insertedUser =  (await createUser(username, firstNameInput,lastNameInput,emailAddressInput,passwordInput, dob))
      if(insertedUser){
        console.log(insertedUser)
        return res.redirect('/login')
      }
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
      let user = await checkUser(emailAddressInput,passwordInput);
      if (user) {
        
        req.session.user = user;
        return res.redirect("/profile")
      }
    }catch (e){
     return res.status(400).render('login', {title: "Login Form", error: e})
    }
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


