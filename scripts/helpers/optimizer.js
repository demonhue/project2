//const Parser = require("@babel/parser");
const {parser, generator} = require("./utils.js");
const transform = require("./transform.js").default;

/*
takes javascript code as text as input
returns ast as ouput
*/
//const input = fs.readFileSync(fileLocation).toString();
//'./src/main.js'
function getOptimizedCode(input,file) {  
  let output = {code:input},
    lastOutputCode = undefined;
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
    try {
      let ast = parser(input);
      transform(ast,file);
      lastOutputCode = output.code;
      output = generator(ast);
    }catch(e){
      console.log({error:e,file: file, failSafe: "returning original input", iteration: totalIterations});
      //throw e;
      return {code: input};
    }
  }

  console.log(totalIterations);
  return output;
}

exports.default = getOptimizedCode;
//fs.writeFileSync('./output/final.js', output.code, 'utf8');
