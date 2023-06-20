const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const {parser,generator} = require("./utils");

function combine(a, b, c) {
  return a + "+" + b + "+" + c;
}

function removeExportsFromFile(input, unusedExports) {
  let ast = parser(input);

  let unusedExportsSet = new Set();

  for (let unusedExport of unusedExports) {
    unusedExportsSet.add(
      combine(unusedExport.localName, unusedExport.exportedName, unusedExport.relativeAddressOfSource)
    );
  }

  function check({localName,exportedName,relativeAddressOfSource}){
    return unusedExportsSet.has(
      combine(localName,exportedName,relativeAddressOfSource)
    );
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
          const obj = {
            localName: node.declaration.id.name,
            exportedName: node.declaration.id.name,
            //from: fileLocation,
          };
          if(check(obj)){
            path.remove();
          }
        }
        else if(node.declaration.declarations){
          node.declaration.declarations = node.declaration.declarations.filter(value => {
            if(value.id.name){//Case2
              const obj = {
                localName: value.id.name,
                exportedName: value.id.name,
              };
              return !check(obj);
            }
            else if(value.id.properties){//Case6
              value.id.properties = value.id.properties.filter(x => {
                const obj ={
                  localName: value.init.name,
                  exportedName: x.key.name,
                  //from: fileLocation,
                };
                return !check(obj);
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
                const obj = {
                  localName: value.init.name,
                  exportedName: x.name,
                  //from: fileLocation,
                };
                if(check(obj)){count++;return null;}
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
                const obj = {
                  localName: value.local.name,
                  exportedName: value.exported.value,
                  //from: fileLocation,
                };
                return !check(obj);
              }else if(value.exported.type === "Identifier"){//Case4
                const obj = {
                  localName: value.local.name,
                  exportedName: value.exported.name,
                  //from: fileLocation,
                };
                return !check(obj);
              }
            });
          }
        else {
          node.specifiers = node.specifiers.filter(value => {
            if(value.type === "ExportNamespaceSpecifier"){//Case7
              const obj = {
                localName: undefined,
                exportedName: value.exported.name,
                relativeAddressOfSource: path.node.source.value
              };
              return !check(obj);
            } else if(value.type === "ExportSpecifier"){//Case8
              const obj = {
                localName: value.local.name,
                exportedName: value.exported.name,
                relativeAddressOfSource: path.node.source.value
              };
              return !check(obj);
            }
          });
        }
        if(node.specifiers.length === 0)path.remove();
      }
    },
    ExportDefaultDeclaration(path){
      const obj = {
        localName: undefined,
        exportedName:"default",
        //from: fileLocation
      };
      if(check(obj))path.remove();
    }
  });

  const output = generator(ast);

  return output;
}

exports.default = removeExportsFromFile;
