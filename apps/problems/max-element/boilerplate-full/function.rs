
use std::fs::File;
use std::io::{self, BufRead};
use std::path::Path;

##USER_CODE_HERE##

fn main() -> io::Result<()> {
    let path = Path::new("/sandbox/input.txt");
    let file = File::open(path)?;
    let reader = BufReader::new(file);

    // Read the size of the array
    let mut lines = reader.lines();
    let size_arr: usize = match lines.next() {
        Some(Ok(line)) => line.parse().unwrap_or(0), // Default to 0 if parsing fails
        _ => 0, // If no input is present, default to 0
    };

    if size_arr == 0 {
        println!("Array size is zero. Exiting.");
        return Ok(());
    }

    // Read the elements of the array
    let arr: Vec<i32> = lines
        .take(size_arr)
        .filter_map(|s| s.ok()?.parse().ok()) // Safely parse each line
        .collect();

    if arr.is_empty() {
        println!("Array is empty after filtering.");
    } else {
        let result = maxElement(arr);
        println!("Maximum element: {}", result);
    }

    Ok(())
}