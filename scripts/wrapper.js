const fs = require("fs");
const path = require("path");
const analyzeTsConfig= require('ts-unused-exports').default;
const removeExportsFromFile = require("./helpers/removeExportsFromFile").default;
const fileFinder = require("./helpers/fileFinder").default;
const getOptimizedCode = require("./helpers/optimizer").default;

const relativePathOfFolder = "../src/vibesition/src"; //TODO
const relativePathOfTsConfigFile = "./src/vibesition/tsconfig.json"; //TODO

const inputFolderLocation = path.join(__dirname, relativePathOfFolder);
const inputFileLocations = fileFinder(inputFolderLocation);

let maxBigIteration = 10;
let totalBigIteration = 0;
while (maxBigIteration--) {
  totalBigIteration++;
  inputFileLocations.forEach((file) => {
    const input = fs.readFileSync(file).toString();
    try {
      const output = getOptimizedCode(input,file);
      fs.writeFileSync(file, output.code, "utf8");
    }catch(e){
      console.log("wrapper.js",{error:e,file:file});
    }
  });

  let unusedExportsByFile = analyzeTsConfig(relativePathOfTsConfigFile);
  //Processing unusedExportsByFile (ignoring pages folder and if exportName is undefined or empty)
  for(let key of Object.keys(unusedExportsByFile)){
    if(key.includes("/pages/")){
      delete unusedExportsByFile[key];
      continue;
    }
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