const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const {parser,generator} = require("./utils");

function removeExportsFromFile(input, unusedExports) {
  let ast = parser(input);

  let unusedExportsSet = new Set();

  for (let unusedExport of unusedExports) {
    unusedExportsSet.add(unusedExport.exportName);
  }
  function check(exportName){
    return unusedExportsSet.has(exportName);
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
          if(check(exportName)){
            path.remove();
          }
        }
        else if(node.declaration.declarations){
          node.declaration.declarations = node.declaration.declarations.filter(value => {
            if(value.id.name){//Case2
              const exportName = value.id.name;
              return !check(exportName);
            }
            else if(value.id.properties){//Case6
              value.id.properties = value.id.properties.filter(x => {
                //console.log(x);
                const exportName = x.value.name;
                return !check(exportName);
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
                if(check(exportName)){count++;return null;}
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
                return !check(exportName);
              }else if(value.exported.type === "Identifier"){//Case4
                const exportName = value.exported.name;
                return !check(exportName);
              }
            });
          }
        else {
          node.specifiers = node.specifiers.filter(value => {
            if(value.type === "ExportNamespaceSpecifier"){//Case7
              const exportName = value.exported.name;
              return !check(exportName);
            } else if(value.type === "ExportSpecifier"){//Case8
              const exportName = value.exported.name;
              return !check(exportName);
            }
          });
        }
        if(node.specifiers.length === 0)path.remove();
      }
    },
    ExportDefaultDeclaration(path){
      const exportName = "default";
      if(check(exportName))path.remove();
    }
  });

  const output = generator(ast);

  return output;
}

exports.default = removeExportsFromFile;
