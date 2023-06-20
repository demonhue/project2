const fs = require("fs");
const path = require("path");
const fileFinder = require("./helpers/fileFinder").default;
const getOptimizedCode = require("./helpers/optimizer").default;
const getExportsAndImports = require("./helpers/getExportsAndImports").default;
const removeExportsFromFile =
  require("./helpers/removeExportsFromFile").default;

const inputFolderLocation = path.join(__dirname, "../src");
const inputFileLocations = fileFinder(inputFolderLocation);

function combine(a, b) {
  return a + "+" + b;
}

while (true) {
  let allExports = [];
  let importVariable = new Set();
  let doNotDisturb = new Set();

  inputFileLocations.forEach((file) => {
    const input = fs.readFileSync(file).toString();
    const output = getOptimizedCode(input);
    fs.writeFileSync(file, output.code, "utf8");

    const { exportedVariables, importedVariables } = getExportsAndImports(
      output.code,
      file
    );

    for (const exportedVariable of exportedVariables)
      allExports.push(exportedVariable);
    for (const importedVariable of importedVariables){
      if(importedVariable.importedName === undefined){
        doNotDisturb.add(importedVariable.from);
      }
      else {
        importVariable.add(
          combine(importedVariable.from, importedVariable.importedName)
        );
      }
    }
  });

  const unusedExports = allExports.filter(
    (value) => {
      if(importVariable.has(combine(value.from, value.exportedName)))return false;
      else if(doNotDisturb.has(value.from))return false;
      else if(value.localName === undefined && value.exportedName === undefined)return false;//ExportAll Case
      else return true;
    }
  );

  console.log("unusedExports:",unusedExports);

  if (unusedExports.length === 0) break;

  let unusedExportsByFile = {};

  for (let unusedExport of unusedExports) {
    if (unusedExportsByFile[unusedExport.from] === undefined) {
      unusedExportsByFile[unusedExport.from] = [unusedExport];
    } else {
      unusedExportsByFile[unusedExport.from].push(unusedExport);
    }
  }

  for (let fileLocation of Object.keys(unusedExportsByFile)) {
    const input = fs.readFileSync(fileLocation).toString();
    const output = removeExportsFromFile(
      input,
      unusedExportsByFile[fileLocation]
    );
    fs.writeFileSync(fileLocation, output.code, "utf8");
  }
}
//compare export.exportedName and import.importedName
