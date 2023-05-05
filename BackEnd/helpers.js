<<<<<<< HEAD
//helper functions to export to other files
import { ObjectId } from "mongodb";
import validate from "validate-date";
const exportedMethods = {

strPrep(string){
    if (typeof(string) != "string"){
        return ""
    }
    return string.trim();
}, 
err(from, msg) {
  // Throws specific error message specified in msg from the function specified in from
  throw "Error from '" + from + "': " + msg;
},

isStr(str) {
  //returns boolean specifing whether input is non-emptys tring
  if (typeof str != "string" || str.trim().length == 0) {
    return false;
  }
  return true;
},

isNum(num) {
  //return boolean specifing whether input is a number
  return /^\d+$/.test(num);
},

getFileType(file){
  //returns the file type of input file
  //if file type can't be found it returns the whole file name
  if (!isStr(file)){
    return "";
  }
  
  //iterate the string from the bakc to find the first instance of a '.' character
  let target=0;
  for (let i=file.length-1; i>=0; i--){
    if (file[i] == '.'){
      target = i+1;
      break;
    }
  }
  return file.substring(target, file.length);
},

verObjectIds(arr){
  //test if all elments of an array are valid ObjectIds
  if (!Array.isArray(arr)){
    return false;
  }

  for(let i=0; i< arr.length; i++){
    if (!ObjectId.isValid(arr[i])){
      return false
    }
  }

  return true

},
checkId(id, varName) {
  if (!id) throw `Error: You must provide a ${varName}`;
  if (typeof id !== 'string') throw `Error:${varName} must be a string`;
  id = id.trim();
  if (id.length === 0)
    throw `Error: ${varName} cannot be an empty string or just spaces`;
  if (!ObjectId.isValid(id)) throw `Error: ${varName} invalid object ID`;
  return id;
},
checkString(strVal, varName) {
  if (!strVal) throw `Error: You must supply a ${varName}!`;
  if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
  strVal = strVal.trim();
  if (strVal.length === 0)
    throw `Error: ${varName} cannot be an empty string or string with just spaces`;
  
  if (!isNaN(strVal))
    throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
  return strVal;
},
checkStringArray(arr, varName) {
  //We will allow an empty array for this,
  //if it's not empty, we will make sure all tags are strings
  if (!arr || !Array.isArray(arr))
    throw `You must provide an array of ${varName}`;
  if (arr.length <1) throw 'array must have at least 1'
  for (let i in arr) {
    if (typeof arr[i] !== 'string' || arr[i].trim().length === 0) {
      throw `One or more elements in ${varName} array is not a string or is an empty string`;
    }
    arr[i] = arr[i].trim();
  }

  return arr;
},
checkName(str, varName){
  str = this.checkString(str, varName);
  if (/\d/.test(str)) throw `${varName} cannot contain any numbers`
  if (str.length < 2 || str.length > 25) throw `${varName} should be at least 2 characters long with a max of 25 characters`
  return str
},
checkNumber(num, varName){
  if (!num) throw `${num} is not supplied`
  if (typeof num !== 'number') {
    throw `${variableName || 'provided variable'} is not a number`;
  }

  if (isNaN(val)) {
    throw `${variableName || 'provided variable'} is NaN`;
  }
},
checkUsername(str, varName){
  str = this.checkString(str, varName);
  str = str.toLowerCase();
  if (/\s/.test(str)) throw `${varName} can't have any empty spaces`;
  if (str.length < 2 || str.length > 25) throw `${varName} should be at least 2 characters long with a max of 25 characters`
  return str
},
checkEmail(str, varName){
  str = this.checkString(str, varName);
  str = str.toLowerCase();
  if (/\s/.test(str)) throw `${varName} can't have any empty spaces`;
  if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)*(\.[a-zA-Z]{2,})$/.test(str)) throw `${varName} should be a valid email address`;
  return str;
},
checkPassword(str, varName){
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
},

// checkDate(string){
//   let date = string.split('/');
//   if (date.length != 3) throw 'has to be in MM/DD/YYYY format'
//   date.forEach((value) => parseInt(value,10))
//   for (let i =0; i<date.length;i++){
//     if (isNaN(date[i])) throw 'one of the date is not a number' 
//   }
//   if (date[1] <1) throw "Not a valid date"
//   if (date[2] <1900 || date[2] > new Date().getFullYear() +1) throw "release Year is not valid"
//   if ([1,3,5,7,8,10,12].includes(date[0])){
//      if (date[1] > 31) throw "Not a valid date"
//   }else if ([4,6,9,11].includes(date[0])){
//      if (date[1] >30) throw "Not a Valid date"
//   }else if (date[0] == 2){
//       if (date[2] % 4 === 0){
//         if (date[1] > 29) throw "Not a Valid date"
//       }
//       if (date[1] >28) throw "Not a valid date"
//   }else throw 'Month is not valid'
// },
checkDOB(str, varName){
  if (!str) throw `Error: You must supply a ${varName}!`;
  if (typeof str !== 'string') throw `Error: ${varName} must be a string!`;
  if (str.length === 0)
    throw `Error: ${varName} cannot be an empty string or string with just spaces`;
  if (!validate(str, "boolean", "mm/dd/yyyy")){
    throw `Error: ${str} is not in proper MM/DD/YYYY form`
  }
  //get current date
  const date = new Date();

  //numerical form of inputted month, day, and year
  let inMonth = parseInt(str.substring(0, 2));
  let inDay = parseInt(str.substring(3, 5));
  let inYear = parseInt(str.substring(6, 10));

  //Tests to ensure if DOB is at least 18 years of age

  if (!(inYear <= date.getFullYear() - 18)) {
    err(fun, "DOB is not 18 years or older: year is too young");
  }

  if (inYear == date.getFullYear() - 18 && inMonth > date.getMonth() + 1) {
    err(fun, "DOB is not 18 years or older: year and month is too young");
  }

  if (
    inMonth == date.getMonth() + 1 &&
    inYear == date.getFullYear() - 18 &&
    inDay > date.getDate()
  ) {
    err(fun,"DOB is not 18 years or older: year, month, day is too young");
  }
  return 
},
getRandomItem(arr) {

  // get random index value
  const randomIndex = Math.floor(Math.random() * arr.length);

  // get random item
  const item = arr[randomIndex];

  return item;
}

}

=======
//helper functions to export to other files
import { ObjectId } from "mongodb";
import validate from "validate-date";
const exportedMethods = {

strPrep(string){
    if (typeof(string) != "string"){
        return ""
    }
    return string.trim();
}, 
err(from, msg) {
  // Throws specific error message specified in msg from the function specified in from
  throw "Error from '" + from + "': " + msg;
},

isStr(str) {
  //returns boolean specifing whether input is non-emptys tring
  if (typeof str != "string" || str.trim().length == 0) {
    return false;
  }
  return true;
},

isNum(num) {
  //return boolean specifing whether input is a number
  return /^\d+$/.test(num);
},

getFileType(file){
  //returns the file type of input file
  //if file type can't be found it returns the whole file name
  if (typeof file != "string" || file.trim().length==0){
    return "";
  }
  
  //iterate the string from the bakc to find the first instance of a '.' character
  let target=0;
  for (let i=file.length-1; i>=0; i--){
    if (file[i] == '.'){
      target = i+1;
      break;
    }
  }
  return file.substring(target, file.length);
},

verObjectIds(arr){
  //test if all elments of an array are valid ObjectIds
  if (!Array.isArray(arr)){
    return false;
  }

  for(let i=0; i< arr.length; i++){
    if (!ObjectId.isValid(arr[i])){
      return false
    }
  }

  return true

},

checkString(strVal, varName) {
  if (!strVal) throw `Error: You must supply a ${varName}!`;
  if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
  strVal = strVal.trim();
  if (strVal.length === 0)
    throw `Error: ${varName} cannot be an empty string or string with just spaces`;
  
  if (!isNaN(strVal))
    throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
  return strVal;
},
checkName(str, varName){
  str = this.checkString(str, varName);
  if (/\d/.test(str)) throw `${varName} cannot contain any numbers`
  if (str.length < 2 || str.length > 25) throw `${varName} should be at least 2 characters long with a max of 25 characters`
  return str
},
checkUsername(str, varName){
  str = this.checkString(str, varName);
  str = str.toLowerCase();
  if (/\s/.test(str)) throw `${varName} can't have any empty spaces`;
  if (str.length < 2 || str.length > 25) throw `${varName} should be at least 2 characters long with a max of 25 characters`
  return str
},
checkEmail(str, varName){
  str = this.checkString(str, varName);
  str = str.toLowerCase();
  if (/\s/.test(str)) throw `${varName} can't have any empty spaces`;
  if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)*(\.[a-zA-Z]{2,})$/.test(str)) throw `${varName} should be a valid email address`;
  return str;
},
checkPassword(str, varName){
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
},
// checkDate(string){
//   let date = string.split('/');
//   if (date.length != 3) throw 'has to be in MM/DD/YYYY format'
//   date.forEach((value) => parseInt(value,10))
//   for (let i =0; i<date.length;i++){
//     if (isNaN(date[i])) throw 'one of the date is not a number' 
//   }
//   if (date[1] <1) throw "Not a valid date"
//   if (date[2] <1900 || date[2] > new Date().getFullYear() +1) throw "release Year is not valid"
//   if ([1,3,5,7,8,10,12].includes(date[0])){
//      if (date[1] > 31) throw "Not a valid date"
//   }else if ([4,6,9,11].includes(date[0])){
//      if (date[1] >30) throw "Not a Valid date"
//   }else if (date[0] == 2){
//       if (date[2] % 4 === 0){
//         if (date[1] > 29) throw "Not a Valid date"
//       }
//       if (date[1] >28) throw "Not a valid date"
//   }else throw 'Month is not valid'
// },
checkDOB(str, varName){
  if (!str) throw `Error: You must supply a ${varName}!`;
  if (typeof str !== 'string') throw `Error: ${varName} must be a string!`;
  if (str.length === 0)
    throw `Error: ${varName} cannot be an empty string or string with just spaces`;
  if (!validate(str, "boolean", "mm/dd/yyyy")){
    throw `Error: ${str} is not in proper MM/DD/YYYY form`
  }
  //get current date
  const date = new Date();

  //numerical form of inputted month, day, and year
  let inMonth = parseInt(str.substring(0, 2));
  let inDay = parseInt(str.substring(3, 5));
  let inYear = parseInt(str.substring(6, 10));

  //Tests to ensure if DOB is at least 18 years of age

  if (!(inYear <= date.getFullYear() - 18)) {
    err(fun, "DOB is not 18 years or older: year is too young");
  }

  if (inYear == date.getFullYear() - 18 && inMonth > date.getMonth() + 1) {
    err(fun, "DOB is not 18 years or older: year and month is too young");
  }

  if (
    inMonth == date.getMonth() + 1 &&
    inYear == date.getFullYear() - 18 &&
    inDay > date.getDate()
  ) {
    err(fun,"DOB is not 18 years or older: year, month, day is too young");
  }
  return 
}

}

>>>>>>> ada2021fcab1d0cc58ae05311b2810eded5e837c
export default exportedMethods;