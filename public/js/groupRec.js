// To be implemented
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
let isNum= (num,varName) => {
    //return boolean specifing whether input is a number
    if (!num) throw `You must provide an input for ${varName}`
    return /^\d+$/.test(num);
  }
const groupRecForm = document.getElementById('newRecFormG');
let errorDivReg = document.getElementById('error-group-rec');
if (groupRecForm){
  groupRecForm.addEventListener('submit', (event) => {
    let workoutNameInput = document.getElementById('workoutNameG');
    let equipmentInput = document.getElementById('equipmentG');
    let durationInput = document.getElementById('durationG');
    let levelInput = document.getElementById('levelG');
    let repsInput = document.getElementById('repsG');
    let roundInput = document.getElementById('roundsG');
    let tagsInput = document.getElementById('tagsG')
    try {
      let workoutName = checkName(workoutNameInput.value, 'workout name');
      let equipment = checkName(equipmentInput.value, 'equipment');
      let duration = durationInput.value;
      isNum(duration, "duration invalid")
      if (duration <= 0 || duration >= 60) throw "The work out duration is too long or invalid number of minutes"
      let level = checkString(levelInput.value, "level").toLowerCase()
      if (level !== "beginner" && level !== "intermediate" && level !== "advanced" ) throw "not valid level"
      let reps = repsInput.value
      isNum(reps, "reps number invalid")
      if (reps <= 0 || reps >1000) throw "Invalid reps number for this work out"
      let rounds = roundInput.value
      isNum(rounds, "rounds number invalid")
      if (rounds <= 0 || rounds >= 10) throw "Invalid rounds number for this work out"
      let tags = tagsInput.value;
      tags = checkString(tags, "tags")
    
      // Clear any inputClass
      workoutNameInput.classList.remove('inputClass');
      equipmentInput.classList.remove('inputClass');
      durationInput.classList.remove('inputClass');
      levelInput.classList.remove('inputClass');
      repsInput.classList.remove('inputClass');
      roundInput.classList.remove('inputClass');
      tagsInput.classList.remove('inputClass');
      errorDivReg.hidden = true;
      groupRecForm.classList.remove('error');
    } catch (e) {
      event.preventDefault();
      errorDivReg.hidden = false;
      errorDivReg.innerHTML = e;
      groupRecForm.classname = 'error';
      // Add inputClass to invalid fields
      if (e.includes('workout')) {
        workoutNameInput.value = '';
        workoutNameInput.focus();
        workoutNameInput.className = 'inputClass';
      } else if (e.includes('equipment')) {
        equipmentInput.value = '';
        equipmentInput.focus();
        equipmentInput.className = 'inputClass';
      } else if (e.includes('duration')) {
        durationInput.value = '';
        durationInput.focus();
        durationInput.className = 'inputClass';
      } else if (e.includes('level')) {
        levelInput.focus();
        levelInput.className = 'inputClass';
      } else if (e.includes('reps')) {
        repsInput.value = '';
        repsInput.focus();
        repsInput.className = 'inputClass';
      }else if (e.includes('rounds')) {
        roundInput.value = '';
        roundInput.focus();
        roundInput.className = 'inputClass';
      }else if (e.includes('tags')) {
        tagsInput.focus();
        tagsInput.className = 'inputClass';
      }
    }
  });
}