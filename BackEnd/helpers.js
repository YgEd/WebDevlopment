//helper functions to export to other files
import { ObjectId} from "mongodb";
import validate from "validate-date";
import { getAnalytics } from './data/posts.js';
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
},

async return_week_values(userid){
  const currentDate = new Date();
  const lastWeek = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000); // subtract 7 days in milliseconds
  const get_stuff = await getAnalytics(userid,lastWeek)
  
  let days_of_week = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  let current_day = new Date().getDay()
  let reorganized_days = days_of_week.slice(current_day + 1).concat(days_of_week.slice(0, current_day + 1))
  let times_day_occured = [0, 0, 0, 0, 0, 0, 0]
  let index = 0
  for(let i = 0; i < get_stuff.length; i++) {
    let post_date = get_stuff[i].postTime
    let day_index = post_date.getDay()
    if (day_index < current_day){
       let indice = day_index + (6- current_day)
      times_day_occured[ indice]++
      console.log(times_day_occured[indice])
    }
    if(day_index === current_day){
       times_day_occured[6]++
    }
    if(day_index > current_day){
      times_day_occured[day_index - (current_day + 1)]++
    }
   // let reorganized_index = current_day - (day_index - current_day + 7) % 7 -1
   // times_day_occured[reorganized_index]++
  }
  let week_obj = {
    data: reorganized_days,
    data2: times_day_occured
  }

  return week_obj
},

async return_month_values(userid){
  // Create a new date object for today
  const today = new Date();
  const prev_month = today.getMonth()
 
  const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 1); // set the date to one day before to get the last day of the previous month
  const datesArray = [];
  const datestracker = Array(30).fill(0);

  for (let d = oneMonthAgo; d <= today; d.setDate(d.getDate() + 1)) {
       let new_date = new Date(d)
       if((new_date.getDate() > today.getDate() && new_date.getMonth() + 1 === today.getMonth()) || (new_date.getMonth() ===  today.getMonth()
       && new_date.getDate() <= today.getDate())){
        datesArray.push(new Date(d));
       }
  }
  
  const get_stuff = await getAnalytics(userid, datesArray[0])
  let index = 0
 
  for(let i = 0; i < get_stuff.length; i ++){
    for(let j = 0; j < datesArray.length; j++){
       
       
       if((datesArray[j].getMonth() === get_stuff[i].postTime.getMonth()) && (datesArray[j].getDate() === get_stuff[i].postTime.getDate()) ){
         datestracker[j]++
         break;
       }
       
    }
  }

  



// Print the array of values for the past month
let month_obj = {month_entries:datesArray, array_val: datestracker }

return month_obj

},

async return_year_values(userid){
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let month_counter = [0, 0, 0, 0, 0,0 ,0 ,0, 0,0,0,0]
const d = new Date();
const currentMonth = d.getMonth(); // get the current month, represented as a number from 0 to 11

// slice the array into two parts and concatenate them in reverse order


const lastYear = d.getFullYear() - 1; // get the year before the current year
const sameDayLastYear = new Date(lastYear, d.getMonth() + 1, d.getDate());





const get_stuff = await getAnalytics(userid,sameDayLastYear )
for(let i = 0; i < get_stuff.length; i++){
   month_counter[get_stuff[i].postTime.getMonth()]++
}

const shuffledMonths = months.slice(currentMonth + 1).concat(months.slice(0, currentMonth + 1))
const shuffledcounter = month_counter.slice(currentMonth + 1).concat(month_counter.slice(0, currentMonth + 1))

return {shuffledMonths: shuffledMonths, shuffledcounter: shuffledcounter }




}

}





export default exportedMethods;