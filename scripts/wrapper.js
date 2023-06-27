const fs = require("fs");
const path = require("path");
const analyzeTsConfig= require('ts-unused-exports').default;
const removeExportsFromFile = require("./helpers/removeExportsFromFile").default;
const fileFinder = require("./helpers/fileFinder").default;
const getOptimizedCode = require("./helpers/optimizer").default;

//Path to src
const relativePathOfFolder = "./src/vibesition/src"; //TODO or directly put absolute path in inputFolderLocation
const relativePathOfTsConfigFile = "./src/vibesition/tsconfig.json"; //TODO
const showRunningFile = true;
const showSmallIterations = true;

if(fs.existsSync(path.resolve(relativePathOfTsConfigFile)) === false){
  throw "TSConfigNotFound";
}
if(fs.existsSync(path.resolve(relativePathOfFolder)) === false){
  throw "FolderNotFound";
}

const inputFolderLocation = path.resolve(relativePathOfFolder);
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
      if(showRunningFile)console.log(`Running on file ${file}`);
      const {output,totalSmallIterations} = getOptimizedCode(input,maxSmallIteration,file);
      if(showSmallIterations)console.log(`Iterations: ${totalSmallIterations}\n`);
      fs.writeFileSync(file, output.code, "utf8");
    }catch(e){
      console.log("wrapper.js",{error:e,file:file});
    }
  });
  console.log("\n\n_________________________________________________________________________________\n\n");
  // let unusedExportsByFile = analyzeTsConfig(relativePathOfTsConfigFile);
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
      if(showRunningFile)console.log(`Removing Exports from file ${fileLocation}`);
      output = removeExportsFromFile(input,unusedExports);
    }catch(e){
      console.log("error while removing exports",{error:e,failSafe: "returned original input instead",file:file});
      output = {code: input};
    }
    fs.writeFileSync(fileLocation, output.code, "utf8");
  }
  console.log(`\n\n########################################################################################\nEnd of Big Iteration ${totalBigIteration}\n`);
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
inputFileLocations.forEach((file) => {
  const input = fs.readFileSync(file).toString();
  if (!input.replace(/\s/g, '').length) {
    console.log(`Removing empty file: ${file}`);
    try {
      fs.unlinkSync(file);
      console.log("Removed!");
    }catch(e){
      console.log(e);
    }
  }
})









/////////////////////////////
/*
function BigIterate(){
  totalBigIteration++;
  if(totalBigIteration>maxBigIteration)return;


  let indexOfFile = 0;
  console.log(inputFileLocations.length);

  function optimizeEachFile(){
    do{
      const file = inputFileLocations[indexOfFile];
      indexOfFile++;
      try {
        const input = fs.readFileSync(file).toString();
        if(showRunningFile)console.log(`Running on file ${file} ::: ${indexOfFile}`);
        const {output,totalSmallIterations} = getOptimizedCode(input,maxSmallIteration,file);
        if(showSmallIterations)console.log(`Iterations: ${totalSmallIterations}\n`);
        fs.writeFileSync(file, output.code, "utf8");
      }catch(e){
        console.log("wrapper.js",{error:e,file:file});
      }
    }while(indexOfFile!==inputFileLocations.length && indexOfFile%10!=0);

    if(indexOfFile === inputFileLocations.length){
      setTimeout(removeUnusedExports);
      return;
    }
    else {
      console.log('\n\n - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - \n\n')
      setTimeout(optimizeEachFile);
    }
  }

  optimizeEachFile();

  // inputFileLocations.forEach((file) => {
  //   try {
  //     const input = fs.readFileSync(file).toString();
  //     if(showRunningFile)console.log(`Running on file ${file}`);
  //     const {output,totalSmallIterations} = getOptimizedCode(input,maxSmallIteration,file);
  //     if(showSmallIterations)console.log(`Iterations: ${totalSmallIterations}\n`);
  //     fs.writeFileSync(file, output.code, "utf8");
  //   }catch(e){
  //     console.log("wrapper.js",{error:e,file:file});
  //   }
  // });

  let doNotIterate = false;

  function removeUnusedExports(){
    console.log("\n\n_________________________________________________________________________________\n\n");
    //let unusedExportsByFile = analyzeTsConfig(relativePathOfTsConfigFile);
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
        if(showRunningFile)console.log(`Removing Exports from file ${fileLocation}`);
        output = removeExportsFromFile(input,unusedExports);
      }catch(e){
        console.log("error while removing exports",{error:e,failSafe: "returned original input instead",file:file});
        output = {code: input};
      }
      fs.writeFileSync(fileLocation, output.code, "utf8");
    }
    console.log(`\n\n########################################################################################\nEnd of Big Iteration ${totalBigIteration}\n`);
    //console.log(unusedExportsByFile);
    if(Object.keys(unusedExportsByFile).length==0){
      doNotIterate =  true;
      return;
    }

    const unusedExportsStringified = JSON.stringify(unusedExportsByFile);
    if(lastUnusedExportsStringified!== undefined && unusedExportsStringified === lastUnusedExportsStringified){
      console.log("Ending Big Iteration because unable to remove these unused exports", unusedExportsByFile);
      doNotIterate =  true;
      return;
    }
    else {
      lastUnusedExportsStringified = unusedExportsStringified;
    }
    if(doNotIterate){
      return;
    }
    else {
      setTimeout(BigIterate);
    }
  }
  if(doNotIterate){
    setTimeout(() => {console.log("totalBigIteration: ",totalBigIteration);});
    setTimeout(deleteEmptyFiles);
    return;
  }
}

BigIterate();

function deleteEmptyFiles(){
  inputFileLocations.forEach((file) => {
    const input = fs.readFileSync(file).toString();
    if (!input.replace(/\s/g, '').length) {
      console.log(`Removing empty file: ${file}`);
      try {
        fs.unlinkSync(file);
        console.log("Removed!");
      }catch(e){
        console.log(e);
      }
    }
  })
}
*/