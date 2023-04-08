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