let goalDiv = document.getElementById("goalDiv")
let editForm = document.getElementById("editForm")
let aboutMe = document.getElementById("aboutme")
let goals = document.getElementsByName("goals[]")
let aboutErr = document.getElementById("aboutErr")
let goalErr = document.getElementById("goalErr")


function removeGoal() {
    goalDiv.removeChild(goalDiv.lastChild)
    goalDiv.removeChild(goalDiv.lastChild)
    goalDiv.removeChild(goalDiv.lastChild)
}

function addGoal() {
    let newInput = document.createElement("input");
    newInput.type ="text"
    newInput.name = "goals[]"
    newInput.maxlength="50"
    newInput.id = `${goals.length}`
    let newBr = document.createElement("br");
    let newLab = document.createElement("label");
    newLab.htmlFor = `${goals.length}`
    newLab.innerHTML = `Goal ${goals.length}:`
    goalDiv.appendChild(newLab)
    goalDiv.appendChild(newInput);
    goalDiv.appendChild(newBr);
}

if (editForm) {
    editForm.addEventListener('submit', (event) =>  {
      aboutErr.hidden = true
      goalErr.hidden = true  

      if (typeof aboutMe.value !== "string") {
        event.preventDefault();
        aboutErr.hidden = false
      }
      
      else if (aboutMe.value.length > 300) {
        event.preventDefault();
        aboutErr.hidden = false
      }
      for (let x of goals) {
        if (typeof x.value !== "string") {
            event.preventDefault();
            goalErr.hidden = false;
        }
        else if (x.value.length > 50) {
            event.preventDefault();
            goalErr.hidden = false;
        }
      }
    })
}