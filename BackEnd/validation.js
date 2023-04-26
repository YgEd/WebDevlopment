// You can add and export any helper functions you want here - if you aren't using any, then you can just leave this file as is
import {ObjectId} from 'mongodb';

const exportedMethods = {
  checkId(id, varName) {
    if (!id) throw `Error: You must provide a ${varName}`;
    if (typeof id !== 'string') throw `Error:${varName} must be a string`;
    id = id.trim();
    if (id.length === 0)
      throw `Error: ${varName} cannot be an empty string or just spaces`;
    if (!ObjectId.isValid(id)) throw `Error: ${varName} invalid object ID`;
    return id;
  },
  checkNum(id, varName){
    if (typeof val !== 'number') {
        throw `${varName || 'provided variable'} is not a number`;
      }
    
      if (isNaN(val)) {
        throw `${varName || 'provided variable'} is NaN`;
      }
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
    checkYear(num){
    if (typeof num !== 'number') throw `${num} is not a number`;
    if (isNaN(num)) throw `variable is NaN`;
    if (num < 1900 || num > 2023) throw 'not a valid year'
  },
    checkWebsite(string){
    string = checkStringArray(string, 'Website')
    if (((string.indexOf("http://www.")) !== 0) || !string.includes('http://www.')) throw "website doesn't contain http://www. at front"
    if ((string.length !== string.lastIndexOf(".com") + 4) || !string.includes(".com")) throw "website doesn't contain .com at the end"
    if (string.substring(11, string.length - 4).length < 5) throw "at least 5 characters in-between the http://www. and .com "
    return string;
  },
  
  checkDateFormat(string){
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
};

export default exportedMethods;
