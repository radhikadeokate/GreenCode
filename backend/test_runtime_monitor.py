
import time

from app.execution.python_executor import execute_python_code

source_code = """
import time

total = 0

for i in range(1000000):
    total += i

print("Calculation completed:", total)

time.sleep(3)
"""

result = execute_python_code(source_code, timeout=10)

print("\nGreenCode Runtime Monitoring Result:")
print(result)

assert result["status"] == "completed"
assert "cpu_usage_percent" in result["runtime_metrics"]
assert "memory_usage_mb" in result["runtime_metrics"]
assert "disk_read_bytes" in result["runtime_metrics"]
assert "disk_write_bytes" in result["runtime_metrics"]
assert result["runtime_metrics"]["sample_count"] > 0
