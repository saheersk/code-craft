
use std::fs::File;
use std::io::{self, BufRead};
use std::path::Path;

##USER_CODE_HERE##

fn main() {
  let path = Path::new("/sandbox/input.txt");
  let file = File::open(path).unwrap();
  let reader = io::BufReader::new(file);
  let mut lines = reader.lines();
  let num1: i32 = lines.next().unwrap_or(Ok(String::from("0"))).unwrap().parse().unwrap_or(0); 
  let num2: i32 = lines.next().unwrap_or(Ok(String::from("0"))).unwrap().parse().unwrap_or(0);
  let result = sum(num1, num2);
  println!("{}", result);
}
    