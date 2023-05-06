let goalDiv = document.getElementById("goalDiv")
function removeGoal() {
    goalDiv.removeChild(goalDiv.lastChild)
    goalDiv.removeChild(goalDiv.lastChild)
}

function addGoal() {
    let newInput = document.createElement("input");
    newInput.type ="text"
    newInput.name = "goals[]"
    let newBr = document.createElement("br");
    goalDiv.appendChild(newInput);
    goalDiv.appendChild(newBr);
}