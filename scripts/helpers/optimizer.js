//const Parser = require("@babel/parser");
const {parser, generator} = require("./utils.js");
const transform = require("./transform.js").default;

/*
takes javascript code as text as input
returns ast as ouput
*/
//const input = fs.readFileSync(fileLocation).toString();
//'./src/main.js'
function getOptimizedCode(input) {
  let ast = parser(input);
  let print = (input === 'function logg(x) {\n  console.log(x);\n}\n');
  let output = {code:input},
    lastOutputCode = "";
  /*
    putting a limit to the number of loops so that
    we don't get infinite loop
    */
  let maxIteration = 10;
  
  /*
    number of loops for convergence
    */
  let totalIterations = 0;

  /*
    looping until there is no optimizations possible
    */
  while (output.code !== lastOutputCode && maxIteration--) {
    ++totalIterations;
    transform(ast,print);
    lastOutputCode = output.code;
    output = generator(ast);
    ast = parser(output.code);
    // console.log("output",output.code);
    // console.log("lastOutputCode",lastOutputCode);
  }

  console.log(totalIterations);
  return output;
}

exports.default = getOptimizedCode;
//fs.writeFileSync('./output/final.js', output.code, 'utf8');
