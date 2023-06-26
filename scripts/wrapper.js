const fs = require("fs");
const path = require("path");
const analyzeTsConfig= require('ts-unused-exports').default;
const removeExportsFromFile = require("./helpers/removeExportsFromFile").default;
const fileFinder = require("./helpers/fileFinder").default;
const getOptimizedCode = require("./helpers/optimizer").default;

//Path to src
const relativePathOfFolder = "../src/vibesition/src"; //TODO or directly put absolute path in inputFolderLocation
const relativePathOfTsConfigFile = "./src/vibesition/tsconfig.json"; //TODO

const inputFolderLocation = path.join(__dirname, relativePathOfFolder);
const inputFileLocations = fileFinder(inputFolderLocation);

//Won't remove exports from these directories
const excludedDirectories = ["pages","node_modules"];

function isUnderAnExcludedDirectory(fileLocation){
  for(let excludedDirectory of excludedDirectories){
    const pattern = "/" + excludedDirectory + "/";
    if(fileLocation.includes(pattern))return true;
    if(fileLocation.slice(0,excludedDirectory.length) == excludedDirectory)return true;
  }
  return false;
}

let lastUnusedExportsStringified;

const maxBigIteration = 10, maxSmallIteration = 10;
let totalBigIteration = 0;
while (totalBigIteration<=maxBigIteration) {
  totalBigIteration++;
  inputFileLocations.forEach((file) => {
    try {
      const input = fs.readFileSync(file).toString();
      const output = getOptimizedCode(input,maxSmallIteration,file);
      fs.writeFileSync(file, output.code, "utf8");
    }catch(e){
      console.log("wrapper.js",{error:e,file:file});
    }
  });

  let unusedExportsByFile = analyzeTsConfig(relativePathOfTsConfigFile,["--ignoreLocallyUsed=true"]);
  //Processing unusedExportsByFile (ignoring pages folder and if exportName is undefined or empty)
  for(let key of Object.keys(unusedExportsByFile)){
    if(isUnderAnExcludedDirectory(key)){
      delete unusedExportsByFile[key];
      continue;
    }
    unusedExportsByFile[key] = unusedExportsByFile[key].filter(value => !(value.exportName == undefined || value.exportName.length === 0));
    if(unusedExportsByFile[key].length === 0)delete unusedExportsByFile[key];
  }

  for(let [fileLocation, unusedExports] of Object.entries(unusedExportsByFile)){
    const input = fs.readFileSync(fileLocation).toString();
    let output;
    try{
      output = removeExportsFromFile(input,unusedExports);
    }catch(e){
      console.log("error while removing exports",{error:e,failSafe: "returned original input instead",file:file});
      output = {code: input};
    }
    fs.writeFileSync(fileLocation, output.code, "utf8");
  }
  console.log(`End of Big Iteration ${totalBigIteration}`);
  console.log(unusedExportsByFile);
  if(Object.keys(unusedExportsByFile).length==0)break;

  const unusedExportsStringified = JSON.stringify(unusedExportsByFile);
  if(lastUnusedExportsStringified!== undefined && unusedExportsStringified === lastUnusedExportsStringified){
    console.log("Ending Big Iteration because unable to remove these unused exports", unusedExportsByFile);
    break;
  }
  else {
    lastUnusedExportsStringified = unusedExportsStringified;
  }
}

console.log("totalBigIteration: ",totalBigIteration);