const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const {parser,generator} = require("./utils");
const {getBindings,removeConstantViolations} = require("./transform");

function removeExportsFromFile(input, unusedExports) {
  let ast = parser(input);
  const bindings = getBindings(ast);

  function getStartOfVariablesReferencedMoreThanOnce(ast){
    let startOfVariablesReferencedMoreThanOnce = new Set();
    for(let key of Object.keys(bindings)){
      if(bindings[key].references>1){
        startOfVariablesReferencedMoreThanOnce.add(parseInt(key,10));
      }
    }
    return startOfVariablesReferencedMoreThanOnce;
  }

  const startOfVariablesReferencedMoreThanOnce = getStartOfVariablesReferencedMoreThanOnce(ast);
  //console.log("##",startOfVariablesReferencedMoreThanOnce);

  let unusedExportsSet = new Set();

  for (let unusedExport of unusedExports) {
    unusedExportsSet.add(unusedExport.exportName);
  }

  function isUnusedExport(exportName){
    return unusedExportsSet.has(exportName);
  }

  function isReferenced(start){
    return startOfVariablesReferencedMoreThanOnce.has(start);
  }
  //console.log(bindings);
  function checkAndRemoveConstantViolations(exportName,start){
    //console.log(start);
    if(isUnusedExport(exportName) && !isReferenced(start)){
      //console.log(exportName,start,bindings[start]);
      if(start!=undefined)removeConstantViolations(bindings[start]);
      return true;
    }
    return false;
  }

  traverse(ast, {
    /*
    ExportSpecifier(path) {
      exportsAndImports.push({
        localName: path.node.local.name,
        exportedName: path.node.exported.name,
        from: fileLocation,
      });
    },*/
    ExportNamedDeclaration(path) {
      const {node} = path;
      if(node.declaration){
       	if(node.declaration.id){//Case1
          const exportName = node.declaration.id.name;
          const start = node.declaration.id.start;
          if(checkAndRemoveConstantViolations(exportName,start)){
            path.remove();
          }
        }
        else if(node.declaration.declarations){
          node.declaration.declarations = node.declaration.declarations.filter(value => {
            if(value.id.name){//Case2
              const exportName = value.id.name;
              const start = value.id.start;
              return !checkAndRemoveConstantViolations(exportName,start);
            }
            else if(value.id.properties){//Case6
              value.id.properties = value.id.properties.filter(x => {
                //console.log(x);
                const exportName = x.value.name;
                const start = x.value.start;
                return !checkAndRemoveConstantViolations(exportName,start);
              });
              return value.id.properties.length !== 0;
            }
            else if(value.id.elements){//Case5
              let count = 0;
              value.id.elements = value.id.elements.map(x => {
                if(x === null){
                  count++;
                  return null;
                }
                const exportName = x.name;
                const start = x.start;
                if(checkAndRemoveConstantViolations(exportName,start)){count++;return null;}
                return x;
              });
              //console.log(count,value.id.)
              return (count !== value.id.elements.length);
            }
          });
          if(node.declaration.declarations.length === 0)path.remove();
        }
      }
      else if(node.specifiers){
        if(node.source == null){
            node.specifiers = node.specifiers.filter(value => {
              if(value.exported.type === "StringLiteral"){//Case3
                const exportName = value.exported.value;
                const start = value.exported.start;
                return !checkAndRemoveConstantViolations(exportName,start);
              }else if(value.exported.type === "Identifier"){//Case4
                const exportName = value.exported.name;
                const start = value.exported.start;
                return !checkAndRemoveConstantViolations(exportName,start);
              }
            });
          }
        else {
          node.specifiers = node.specifiers.filter(value => {
            if(value.type === "ExportNamespaceSpecifier"){//Case7
              const exportName = value.exported.name;
              const start = value.exported.start;
              return !checkAndRemoveConstantViolations(exportName,start);
            } else if(value.type === "ExportSpecifier"){//Case8
              const exportName = value.exported.name;
              const start = value.exported.start;
              return !checkAndRemoveConstantViolations(exportName,start);
            }
          });
        }
        if(node.specifiers.length === 0)path.remove();
      }
    },
    ExportDefaultDeclaration(path){
      const exportName = "default";
      if(checkAndRemoveConstantViolations(exportName,(path.node.declaration.id?.start))){
        path.remove();
      }
    }
  });

  const output = generator(ast);

  return output;
}

exports.default = removeExportsFromFile;
