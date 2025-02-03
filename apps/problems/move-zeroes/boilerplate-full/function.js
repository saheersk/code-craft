
##USER_CODE_HERE##

const input = require('fs').readFileSync('/sandbox/input.txt', 'utf8').trim().split('\n');
const size_arr = parseInt(input[0]);
const arr = input[1].split(' ').map(Number);
const result = moveZeroes(arr);
console.log(result.join(' '));
