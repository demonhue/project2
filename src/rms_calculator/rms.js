import * as calc from "./calculator.js";
function square(a) {
  return calc.mul(a, a);
}

function rootMeanSquare(arr) {
  let result = arr.reduce((sumOfSquares, value) => {
    return sumOfSquares + square(value);
  });
  return calc.sqrt(calc.divide(result, arr.length));
}

let arr = [1, 1, 1];

console.log(rootMeanSquare(arr));
export * from "./calculator.js";
/*
import * as calc from "./calculator.js";

function square(a) {
  return calc.mul(a, a);
}

function rootMeanSquare(arr) {
  let result = arr.reduce((sumOfSquares, value) => {
    return sumOfSquares + square(value);
  });
  return calc.sqrt(calc.divide(result, arr.length));
}

let arr = [1, 1, 1];

console.log(rootMeanSquare(arr));
*/

/*

import mul, { divide, sqrt, sub, add } from "./calculator.js";

function square(a) {
  return mul(a, a);
}

function cube(a){
  return multiply(a,square(a));
}

function rootMeanSquare(arr) {
  let result = arr.reduce((sumOfSquares, value) => {
    return sumOfSquares + square(value);
  });
  return sqrt(divide(result, arr.length));
}

let arr = [1, 1, 1];

console.log(rootMeanSquare(arr));

*/