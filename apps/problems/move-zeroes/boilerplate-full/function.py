
##USER_CODE_HERE##

with open('/sandbox/input.txt', 'r') as input_file:
    input_file.readline()
    arr = list(map(int, input_file.readline().strip().split()))
result = moveZeroes(arr)
print(' '.join(map(str, result)))