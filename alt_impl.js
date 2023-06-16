// function abc({types: t}){
//     return {
//         visitor: {
//             Identifier(path,state){
//                 console.log(path.node);
//             }
//         }
//     }
// }

// const output = babel.transformSync(input, {
//     plugins: [
//       function myCustomPlugin() {
//         //return {
//           visitor: {
//             Identifier(path) {
//                 console.log(path.node);
//             }

//           }
//         //};
//       },
//     ],
// });

// console.log("output +++ ",output);

////////////////////////////
//from complete scratch

//console.log(ast.program);

// let variables = {};

// function getLast(arr){
//     if(arr){
//         if(arr.length === 0)return undefined;
//         else return arr[arr.length-1];
//     } else {
//         return undefined;
//     }
// }

// let declaredVariables = [];
// let usedVariables = [];
// let assignments = [];

// function finder(node,variableIs = ""){
//     if(node===undefined)return;
//     let save = {};
//     switch(node.type){
//         case "Program":
//             for(let child of node.body)finder(child);
//             break;
//         case "BlockStatement":
//             console.log("##bs");
//             save = {};
//             for (let [key,value] of Object.entries(variables))save[key] = [...value];
//             for(let child of node.body)finder(child);
//             variables = save;
//             console.log("##bs-end");
//             break;
//         case "VariableDeclaration":
//             for(let child of node.declarations)finder(child);
//             break;
//         case "ExpressionStatement":
//             finder(node.expression);
//             break;
//         case "FunctionDeclaration":
//             finder(node.id,"declared");
//             save = {};
//             for (let [key,value] of Object.entries(variables))save[key] = [...value];
//             for(let child of node.params)finder(child,"declared");
//             finder(node.body);
//             variables = save;
//             break;
//         case "VariableDeclarator":
//             finder(node.id,"declared");
//             finder(node.init,"used");
//             break;
//         case "Identifier":
//             if(variableIs === "declared"){
//                 if(variables[node.name]){
//                     variables[node.name].push(node.start);
//                 }else {
//                     variables[node.name] = [node.start];
//                 }
//                 console.log("DECLARED",node.name,"at",node.start);
//                 declaredVariables.push(node.start);
//             }
//             else if(variableIs === "used"){
//                 console.log("USED",node.name,"at",node.start,"from",getLast(variables[node.name]));
//                 usedVariables.push(getLast(variables[node.name]));
//             }
//             else if(variableIs === "assigned"){
//                 assignments.push([getLast(variables[node.name]),node.start]);
//                 console.log("ASSIGNED",node.name,"at",node.start,"from",getLast(variables[node.name]));
//             }
//             //console.log(node.name,node.start,variableIs);
//             //console.log("variables ",variables);
//             break;
//         case "NumericLiteral":
//             break;
//         case "BinaryExpression":
//             finder(node.left,"used");
//             finder(node.right,"used");
//             break;
//         case "AssignmentExpression":
//             finder(node.left,"assigned");
//             finder(node.right,"used");
//             break;
//         case "CallExpression":
//             finder(node.callee);
//             for(let child of node.arguments)finder(child,"used");
//             break;
//         case "MemberExpression":
//             finder(node.object);
//             finder(node.property);
//             break;
//         case "ArrowFunctionExpression":
//             if(node.arguments)for(let child of node.arguments)finder(child);
//             finder(node.body);
//             break;
//         case "ReturnStatement":
//             finder(node.argument);
//             break;
//         default:
//             break;
//     }
// }

// traverse(ast, {
//     enter(path) {
//         if(path.node.type === "BlockStatement"){
//             enter(path.)
//         }
//     }
// })

// finder(ast.program);

// console.log(variables);

// console.log(declaredVariables);
// console.log(usedVariables);
// console.log(assignments);

//now remove declarations and assignments

// function cleaner(node,parent){
//     if(node===undefined)return;
//     switch(node.type){
//         case "Program":
//             for(let child of node.body)cleaner(child,node);
//             break;
//         case "BlockStatement":
//             if(node.body === undefined || node.body.length === 0){
//                 if(parent.body && Array.isArray(parent.body))parent.body = parent.body.filter(x => x!==node);
//             }
//             break;
//         case "VariableDeclaration":
//             node.declarations = node.declarations.filter(child => !usedVariables.includes(child.start))
//             //for(let child of node.declarations)cleaner(child,node);
//             //if(!usedVariables.includes(node.start))
//             if(node.declarations.length === 0)
//             break;
//         case "ExpressionStatement":
//             //cleaner(node.expression);
//             break;
//         case "FunctionDeclaration":
//             if(!usedVariables.includes(node.start))delete node;
//             cleaner(node.id,node);
//             cleaner(node.body,node);
//             break;
//         case "VariableDeclarator":
//             // if(!usedVariables.includes(node.start)){
//             //     parent.declarations = parent.declarations.filter(x => x!==node);
//             //     if(parent.declarations.length === 0)
//             // }
//             break;
//         default:
//             break;
//     }
// }

// cleaner(ast.program);

// const code = generate(ast);
// //console.log(code);

// fs.writeFileSync('./output/final.js', code.code, 'utf8');
