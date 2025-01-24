
#include <iostream>
#include <vector>
#include <string>
#include <fstream>

##USER_CODE_HERE##

int main() {
  std::ifstream inputFile("/sandbox/input.txt");
  inputFile >> num1;
  std::ifstream inputFile("/sandbox/input.txt");
  inputFile >> num2;
  int result = sum(num1, num2);
  std::cout << result << std::endl;
  return 0;
}
    