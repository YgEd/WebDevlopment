//helper functions to export to other files

export function err(from, msg) {
  // Throws specific error message specified in msg from the function specified in from
  throw "Error from '" + from + "': " + msg;
}

export function isStr(str) {
  //returns boolean specifing whether input is non-emptys tring
  if (typeof str != "string" || str.trim().length == 0) {
    return false;
  }
  return true;
}

export function isNum(num) {
  //return boolean specifing whether input is a number
  return /^\d+$/.test(num);
}

export function getFileType(file){
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
}
const exportedMethods = {
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
checkRole(str, varName){
  str= str.trim()
  str = str.toLowerCase();
  if (str !== 'admin' && str !== 'user') throw `invalid values for ${varName}`
  return str;
}
}

export default exportedMethods;