
#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include <climits>

##USER_CODE_HERE##

int main() {
  int size_arr;
  std::ifstream inputFile("/sandbox/input.txt");
  inputFile >> size_arr;
  std::vector<int> arr(size_arr);
  for(int i = 0; i < size_arr; ++i) inputFile >> arr[i];
  int result = maxElement(arr);
  std::cout << result << std::endl;
  return 0;
}
    