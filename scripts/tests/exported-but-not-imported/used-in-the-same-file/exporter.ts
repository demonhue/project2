export function add_one(a){
  return a+1;
}

export default function (a,b){
  return a+b;
}

export let arr = [1,2,3];

export let [,aaa,bbb] = [1,2,3,4,5], var_1 = 5;

console.log(aaa);

let a = 20, aa = 10;
console.log(aa);
export {a as aa};