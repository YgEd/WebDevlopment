// login page validate
let checkString = (strVal, varName) => {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    return strVal;
  }
let checkName = (str, varName) =>{
    str = checkString(str, varName);
    if (/\d/.test(str)) throw `${varName} cannot contain any numbers`
    if (str.length < 2 || str.length > 25) throw `${varName} should be at least 2 characters long with a max of 25 characters`
    return str
  }
let checkEmail = (str, varName) => {
    str = checkString(str, varName);
    str = str.toLowerCase();
    if (/\s/.test(str)) throw `${varName} can't have any empty spaces`;
    if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)*(\.[a-zA-Z]{2,})$/.test(str)) throw `${varName} should be a valid email address`;
    return str;
  }
let checkPassword = (str, varName) =>{
    if (!str) throw `Error: You must supply a ${varName}!`;
    if (typeof str !== 'string') throw `Error: ${varName} must be a string!`;
    if (str.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (str.length<8) throw `${varName} must be a minimum of 8 characters long` 
    if (/\s/.test(str)) throw `${varName} can't have any empty spaces`;
    if (!/[A-Z]/.test(str)) throw `${varName} must contain at least one uppercase character`
    if (!/[0-9]/.test(str)) throw `${varName} must contain at least one number`
    if (!/[^a-zA-Z0-9\s]/.test(str)) throw `${varName} must contain at least one special character`;
    return str
  }
let checkDateFormat = (string) => {
    let date = string.split('/');
    if (date.length != 3) throw 'has to be in MM/DD/YYYY format'
    date.forEach((value) => parseInt(value,10))
    for (let i =0; i<date.length;i++){
      if (isNaN(date[i])) throw 'one of the date is not a number' 
    }
    if (date[1] <1) throw "Not a valid date"
    if (date[2] <1900 || date[2] > new Date().getFullYear() +1) throw "release Year is not valid"
    if ([1,3,5,7,8,10,12].includes(date[0])){
       if (date[1] > 31) throw "Not a valid date"
    }else if ([4,6,9,11].includes(date[0])){
       if (date[1] >30) throw "Not a Valid date"
    }else if (date[0] == 2){
        if (date[2] % 4 === 0){
          if (date[1] > 29) throw "Not a Valid date"
        }
        if (date[1] >28) throw "Not a valid date"
    }else throw 'Month is not valid'
  }
const loginForm = document.getElementById('login-form');
let errorDiv = document.getElementById('error');
if (loginForm){
loginForm.addEventListener('submit', (event) => {
  
  let emailInput = document.getElementById('emailAddressInput');
  let passwordInput = document.getElementById('passwordInput');
  try {
    let email = checkEmail(emailInput.value, 'email address');
    let password = checkPassword(passwordInput.value, 'password');
    emailInput.classList.remove('inputClass');
    passwordInput.classList.remove('inputClass');
    loginForm.classList.remove('error');
    errorDiv.hidden = true;
  } catch (e) {
    event.preventDefault();
    errorDiv.hidden = false;
    errorDiv.innerHTML = e;
    loginForm.className = 'error';
    if (e.inclues('email')){
        emailInput.value = '';
        emailInput.focus();
        emailInput.className = 'inputClass';
    }
    if (e.includes('password')){
        passwordInput.value = '';
        passwordInput.focus();
        passwordInput.className = 'inputClass';
    }
  }
 

});}
//register page validate
const registrationForm = document.getElementById('registration-form');
let errorDivReg = document.getElementById('error-reg');
if (registrationForm){
  registrationForm.addEventListener('submit', (event) => {
    let firstNameInput = document.getElementById('firstNameInput');
    let lastNameInput = document.getElementById('lastNameInput');
    let emailInput = document.getElementById('emailAddressInput');
    let passwordInput = document.getElementById('passwordInput');
    let confirmPasswordInput = document.getElementById('confirmPasswordInput');
    let dob = document.getElementById('dob');

    try {
      let firstName = checkName(firstNameInput.value, 'first name');
      let lastName = checkName(lastNameInput.value, 'last name');
      let email = checkEmail(emailInput.value, 'email address');
      let password = checkPassword(passwordInput.value, 'password');
      let confirmPassword = checkPassword(confirmPasswordInput.value, 'confirm password');
      checkDateFormat(dob);
      if (password !== confirmPassword) {
        throw 'Error: Password and confirm password do not match';
      }

      // Clear any inputClass
      firstNameInput.classList.remove('inputClass');
      lastNameInput.classList.remove('inputClass');
      emailInput.classList.remove('inputClass');
      passwordInput.classList.remove('inputClass');
      confirmPasswordInput.classList.remove('inputClass');
      roleInput.classList.remove('inputClass');
      errorDivReg.hidden = true;
      registrationForm.classList.remove('error');
    } catch (e) {
      event.preventDefault();
      errorDivReg.hidden = false;
      errorDivReg.innerHTML = e;
      registrationForm.classname = 'error';
      // Add inputClass to invalid fields
      if (e.includes('first name')) {
        firstNameInput.value = '';
        firstNameInput.focus();
        firstNameInput.className = 'inputClass';
      } else if (e.includes('last name')) {
        lastNameInput.value = '';
        lastNameInput.focus();
        lastNameInput.className = 'inputClass';
      } else if (e.includes('email address')) {
        emailInput.value = '';
        emailInput.focus();
        emailInput.className = 'inputClass';
      } else if (e.includes('password')) {
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        passwordInput.focus();
        passwordInput.className = 'inputClass';
        confirmPasswordInput.className = 'inputClass';
      } else if (e.includes('role')) {
        roleInput.focus();
        roleInput.className = 'inputClass';
      }
    }
  });
}