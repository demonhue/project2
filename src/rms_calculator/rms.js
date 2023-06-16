import { divide, multiply, sqrt } from "./calculator.js";
function square(a) {
  return multiply(a, a);
}
function rootMeanSquare(arr) {
  let result = arr.reduce((sumOfSquares, value) => {
    return sumOfSquares + square(value);
  });
  return sqrt(divide(result, arr.length));
}
let arr = [1, 1, 1];
console.log(rootMeanSquare(arr));