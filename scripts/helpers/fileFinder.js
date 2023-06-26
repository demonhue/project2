const fs = require("fs");
const path = require("path");

function getExtension(filename) {
    return filename.split(".").pop();
}

// function removeExtension(filename){
//     return filename.split(".")[0];
// }

function isJSFile(filename) {
    const ext = getExtension(filename);
    return ext === "js" || ext === "jsx" || ext === "ts" || ext === "tsx";
}

const inputFileLocations = [];

const skipDirectories = ["node_modules"];

function traverseDir(dir, files) {
    fs.readdirSync(dir).forEach((file) => {
        if(skipDirectories.includes(file)){
            return;
        }
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (isJSFile(file)) {
            inputFileLocations.push(fullPath);
        }
  });
}

function fileFinder(inputFolderLocation) {
  //const inputFileLocations = [];
    inputFileLocations.splice(0, inputFileLocations.length);
    traverseDir(inputFolderLocation, inputFileLocations);
    return inputFileLocations;
}

exports.default = fileFinder;
