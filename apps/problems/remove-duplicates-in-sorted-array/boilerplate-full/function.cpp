
#include <iostream>
#include <vector>
#include <string>
#include <fstream>

using namespace std; 

##USER_CODE_HERE##

int main() {
  int size_arr;
  std::ifstream inputFile("/sandbox/input.txt");
  inputFile >> size_arr;
  std::vector<int> arr(size_arr);
  for(int i = 0; i < size_arr; ++i) inputFile >> arr[i];
  int result = removeDuplicates(arr);
  std::cout << result << std::endl;
  return 0;
}
    