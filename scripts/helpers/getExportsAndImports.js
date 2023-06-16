const {parser} = require("./utils");
const traverse = require("@babel/traverse").default;
const joinPath = require("path").join;

exports.default = function (code, fileLocation) {
  const exportsAndImports = {
    importedVariables: [],
    exportedVariables: [],
  };

  const ast = parser(code);

  traverse(ast, {
    ExportSpecifier(path) {
      exportsAndImports.exportedVariables.push({
        localName: path.node.local.name,
        exportedName: path.node.exported.name,
        from: fileLocation,
      });
    },
  });

  traverse(ast, {
    ImportDeclaration(path) {
      const relativeAddressOfSource = path.node.source.value;
      const absoluteAddressOfSource = joinPath(
        fileLocation,
        "..",
        relativeAddressOfSource
      );
      if (path.node.specifiers != null && path.node.specifiers.length) {
        //console.log(path.node.specifiers);
        path.node.specifiers.forEach((value) =>
          exportsAndImports.importedVariables.push({
            importedName:
              value.type == "ImportDefaultSpecifier"
                ? "default"
                : value.imported.name,
            localName: value.local.name,
            from: absoluteAddressOfSource,
          })
        );
      }
    },
  });
  return exportsAndImports;
};
