const traverse = require("@babel/traverse").default;

function getBindings(ast) {
  let bindings = {};
  let setOfScopes = new Set();
  traverse(ast, {
    enter(path) {
      setOfScopes.add(path.scope.bindings);
    }
      // else if(path.node.type === "BlockStatement"){
      //     console.log("__________________\n",path.node,"___________________\nParent____________________\n",path.parent);
      //     //if(path.node.body.length === 0)path.remove();
      // }
    },
  );

  for (let value of setOfScopes) {
    for (let key of Object.keys(value))
      bindings[value[key].identifier.start] = value[key];
  }
  return bindings;
}

function removeConstantViolations(binding){
  if(binding?.constantViolations){
    for (let constantViolation of binding.constantViolations) {
      constantViolation.remove();
    }
  }
}

function transform(ast,file) {
  let JSXelements = new Set();
  traverse(ast, {
    JSXIdentifier(path) {
      JSXelements.add(path.node.name);
    },
  });
  /*
    TERMS:

    IDENTIFIERS:- (variables,classes,functions,..etc)
    I am using the starting postion of each identifier to
    uniquely Identify them (as their name can be same)

    SCOPE:- contains bindings

    PATH:- path to that node in the AST

    BINDINGS:- Its like identifiers but it has identity in a scope,
    It has properties like:-
    -(referenced): It contains information whether the variable has been referenced
    anywhere in the scope or not
    -(constantViolations): or where their value was altered(if altered)
    */

  /*
    Getting bindings for each scope
    */
  let bindings = getBindings(ast);
  /*
    getting name corresponding to each binding
    doesn't get name for each identifier
    I am gonna skip those identifiers whose names
    it can't get for example arguments f(a,b);
  */
  function getName(binding) {
    return binding.path?.node?.id?.name ?? binding.path?.node?.local?.name;
  }

  /*
    checking whether there exists a JSX element with the same
    name as the binding
    */
  function isJSXelement(binding) {
    return JSXelements.has(getName(binding));
  }

  function isFunctionOrClassExpression(binding){
    return (binding.path.node.type === "ClassExpression" || binding.path.node.type === "FunctionExpression");
  }

  /*
    checking whether:
    -the binding is not part of an argument
    -and there is not a JSX element with the same name

    then removing unreferenced bindings and all their assignments
    Also removing the import declaration with no imports(i.e. removing "import  from './modulePath' ")
    */
  for (let key of Object.keys(bindings)){
    if (isJSXelement(bindings[key])){
      continue;
    }
    if(isFunctionOrClassExpression(bindings[key])){
      continue;
    }
    if(bindings[key].referenced){
      continue;
    }
    if(getName(bindings[key]) !== undefined){
      console.log(`removing: ${getName(bindings[key])} from file ${file}`);
      removeConstantViolations(bindings[key]);
      bindings[key].path.remove();
      const parent = bindings[key].path.parentPath;
      if (
        parent?.node?.type === "ImportDeclaration" &&
        parent.node.specifiers.length === 0
      ){
        parent.remove();
      }
    }


    if (bindings[key].path?.node?.id?.type === "ArrayPattern") {
      for (let i = 0; i < bindings[key].path.node.id.elements.length; i++){
        if(bindings[key].path.node.id.elements[i]!=null) {
          if(bindings[key].path.node.id.elements[i].type === "Identifier"){
            if (
              bindings[key].path.node.id.elements[i]?.start ===
              bindings[key].identifier.start
            ) {
              console.log(`removing: ${bindings[key].identifier.name} from file ${file}`);
              bindings[key].path.node.id.elements[i] = null;
            }
          }
          else if(bindings[key].path.node.id.elements[i].type === "RestElement"){
            if (
              bindings[key].path.node.id.elements[i]?.argument?.start ===
              bindings[key].identifier.start
            ) {
              console.log(`removing: ${bindings[key].identifier.name} from file ${file}`);
              bindings[key].path.node.id.elements[i] = null;
            }
          }
        }
      }
      if (bindings[key].path.node.id.elements.every((element) => element == null)){
        bindings[key].path.remove();
      }
    }

    
    if (bindings[key].path?.node?.id?.type === "ObjectPattern") {
      bindings[key].path.node.id.properties = bindings[key].path.node.id.properties.filter(
        (x) => {
          if(x.type==="ObjectProperty"){
            if(x.value.name === bindings[key].identifier.name){
              console.log(`removing: ${x.value.name} from file ${file}`);
              return false;
            }
            else {
              return true;
            }
          }
          else if(x.type === "RestElement"){
            if(x.argument.name === bindings[key].identifier.name){
              console.log(`removing: ${x.argument.name} from file ${file}`);
              return false;
            }
            else {
              return true;
            }
          }
          else return true;
        }
      );
      if (bindings[key].path.node.id.properties.length === 0) {
        bindings[key].path.remove();
      }
    }
  }
}

exports.default = transform;
exports.getBindings = getBindings;
exports.removeConstantViolations = removeConstantViolations;
/*
1)Currently, it doesn't remove any variable whose name matches 
with any of the JSX element which will leave redundancies 
but not if we follow conventions like naming JSX components 
with capital letters and not making nested functional 
components.

2)It doesn't touch objects
*/
