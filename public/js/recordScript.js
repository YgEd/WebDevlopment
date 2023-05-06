let imgDiv = document.getElementById("imgDiv")
let recordForm = document.getElementById("recordForm")
let title = document.getElementById("postTitle")
let workoutType = document.getElementById("workoutType")
let description = document.getElementById("postDescription")
let titleErr = document.getElementById("titleErr")
let typeErr = document.getElementById("typeErr")
let descErr = document.getElementById("descErr")

let imgCount = 1;
function removeImg() {
    if (imgCount != 1) {
        imgDiv.removeChild(imgDiv.lastChild)
        imgDiv.removeChild(imgDiv.lastChild)
        imgCount--;
    }
}

function addImg() {
    if (imgCount < 5) {
        let newInput = document.createElement("input");
        newInput.type ="file"
        newInput.name = "postImgs[]"
        newInput.accept ="image/jpg, image/png, image/jpeg"
        let newBr = document.createElement("br");
        imgDiv.appendChild(newInput);
        imgDiv.appendChild(newBr);
        imgCount++;
    }
}

if (recordForm) {
    recordForm.addEventListener('submit', (event) => {
        titleErr.hidden = true
        typeErr.hidden = true
        descErr.hidden = true

        if (typeof title.value !== "string") {
            event.preventDefault();
            titleErr.innerHTML = "title must be a string"
            titleErr.hidden = false
        }
        else if (title.value.trim() == "") {
            event.preventDefault();
            titleErr.innerHTML = "title cannot be empty"
            titleErr.hidden = false
        }
        else if (title.value.length > 40) {
            event.preventDefault();
            titleErr.innerHTML = "title can be max 40 characters"
            titleErr.hidden = false;
        }
        
        if(typeof workoutType.value !== "string") {
            event.preventDefault();
            typeErr.hidden = false;
        }
        else if (workoutType.value != "lifting" && workoutType.value != "running" && workoutType.value != "cycling" && workoutType.value != "other") {
            event.preventDefault();
            typeErr.hidden = false;
        }

        if(typeof description.value !== "string") {
            event.preventDefault();
            descErr.hidden = false;
        }
        else if (description.value.trim() == "") {
            event.preventDefault();
            descErr.hidden = false
        }
        else if (description.value.length > 500) {
            event.preventDefault();
            descErr.hidden = false;
        }
    })
}
