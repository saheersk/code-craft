
##USER_CODE_HERE##

with open('/sandbox/input.txt', 'r') as input_file:
    num1 = int(input_file.readline().strip())
    num2 = int(input_file.readline().strip())
result = sum(num1, num2)
print(result)