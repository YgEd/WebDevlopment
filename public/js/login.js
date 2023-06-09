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
let calculateAge = (birthday) => {
    var today = new Date();
    var age = today.getFullYear() - birthday.getFullYear();
    var monthDifference = today.getMonth() - birthday.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthday.getDate())) {
        age--;
    }
    return age;
}
let checkDOB = (dob, varName) =>{
    if (!dob) throw `Error: You must supply a ${varName}!`;
    var dobValue = dob.value;
    var age = calculateAge(new Date(dobValue));
    if (age < 18){
        throw "User must be 18 years old or older"
    }

}
  
const loginForm = document.getElementById('login-form');
let errorDiv = document.getElementById('error-log');
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
    if (e.includes('email')){
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
      checkDOB(dob, "date of birth");
      if (password !== confirmPassword) {
        throw 'Error: Password and confirm password do not match';
      }

      // Clear any inputClass
      firstNameInput.classList.remove('inputClass');
      lastNameInput.classList.remove('inputClass');
      emailInput.classList.remove('inputClass');
      passwordInput.classList.remove('inputClass');
      confirmPasswordInput.classList.remove('inputClass');
      dob.classList.remove('inputClass');
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
      } else if (e.includes('dob')) {
        dob.focus();
        dob.className = 'inputClass';
      }
    }
  });
}