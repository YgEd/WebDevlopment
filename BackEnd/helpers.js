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
