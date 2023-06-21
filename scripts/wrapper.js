const fs = require("fs");
const path = require("path");
const analyzeTsConfig= require('ts-unused-exports').default;
const removeExportsFromFile = require("./helpers/removeExportsFromFile").default;
const fileFinder = require("./helpers/fileFinder").default;
const getOptimizedCode = require("./helpers/optimizer").default;

//const inputFolderLocation = path.join(__dirname, "../src/React-Typescript-Project/src");///////////////////////
const inputFolderLocation = path.join(__dirname, "../src/ts-project");
const inputFileLocations = fileFinder(inputFolderLocation);

let maxIteration = 20;
let totalBigIteration = 0;
while (maxIteration--) {
  totalBigIteration++;
  inputFileLocations.forEach((file) => {
    const input = fs.readFileSync(file).toString();
    const output = getOptimizedCode(input);
    fs.writeFileSync(file, output.code, "utf8");
  });

  //let unusedExportsByFile = analyzeTsConfig('./src/React-Typescript-Project/tsconfig.json');//////////////////////
  let unusedExportsByFile = analyzeTsConfig('./src/ts-project/tsconfig.json');
  //Processing unusedExportsByFile
  for(let key of Object.keys(unusedExportsByFile)){
    unusedExportsByFile[key] = unusedExportsByFile[key].filter(value => !(value.exportName == undefined || value.exportName.length === 0));
    if(unusedExportsByFile[key].length === 0)delete unusedExportsByFile[key];
  }

  for(let [fileLocation, unusedExports] of Object.entries(unusedExportsByFile)){
    const input = fs.readFileSync(fileLocation).toString();
    const output = removeExportsFromFile(input,unusedExports);
    fs.writeFileSync(fileLocation, output.code, "utf8");
  }
  console.log(unusedExportsByFile);
  if(Object.keys(unusedExportsByFile).length==0)break;
}

console.log("totalBigIteration: ",totalBigIteration);