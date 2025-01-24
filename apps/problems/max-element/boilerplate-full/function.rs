
use std::fs::File;
use std::io::{self, BufRead};
use std::path::Path;

##USER_CODE_HERE##

fn main() {
let path = Path::new("/sandbox/input.txt");
let file = File::open(path).unwrap();
let reader = io::BufReader::new(file);
let mut lines = reader.lines();
let size_arr: usize = input.next().unwrap().parse().unwrap();
let arr: Vec<i32> = input.take(size_arr).map(|s| s.parse().unwrap()).collect();
let result = maxElement(arr);
println!("{}", result);
}
  