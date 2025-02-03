
#include <iostream>
#include <vector>
#include <string>
#include <fstream>

using namespace std; 

##USER_CODE_HERE##

int main() {
    std::ifstream inputFile("/sandbox/input.txt");
    int size_arr;
    inputFile >> size_arr;
    std::vector<int> arr(size_arr);
    for (int i = 0; i < size_arr; ++i) {
        inputFile >> arr[i];
    }
    std::vector<int> result = moveZeroes(arr);
    for (int i = 0; i < result.size(); ++i) {
        std::cout << result[i] << " ";
    }
    std::cout << std::endl;
    return 0;
}
