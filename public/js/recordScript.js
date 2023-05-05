let imgDiv = document.getElementById("imgDiv")
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