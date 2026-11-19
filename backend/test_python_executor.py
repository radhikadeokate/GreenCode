from app.execution.python_executor import execute_python_code

source_code = """
print("Starting execution...")
x = 10 / 0
print(x)
"""

result = execute_python_code(source_code, timeout=10)

print("\nPython Error Test:")
print(result)