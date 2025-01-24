
##USER_CODE_HERE##

with open('/sandbox/input.txt', 'r') as input_file:
    arr = list(map(int, input_file.readline().strip().split()))
result = maxElement(arr)
print(result)
  