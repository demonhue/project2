const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const {parser,generator} = require("./utils");

function combine(a, b) {
  return a + "+" + b;
}

function removeExportsFromFile(input, unusedExports) {
  let ast = parser(input);

  let unusedExportsSet = new Set();

  for (let unusedExport of unusedExports) {
    unusedExportsSet.add(
      combine(unusedExport.localName, unusedExport.exportedName)
    );
  }

  traverse(ast, {
    ExportSpecifier(path) {
      if (
        unusedExportsSet.has(
          combine(path.node.local.name, path.node.exported.name)
        )
      ) {
        path.remove();
      }
    },
  });

  const output = generator(ast);

  return output;
}

exports.default = removeExportsFromFile;
