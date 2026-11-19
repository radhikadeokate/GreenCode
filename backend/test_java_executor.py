from app.execution.java_executor import execute_java_code

source_code = """
public class Main {
    public static void main(String[] args) {
        System.out.println("Starting execution...");
        int x = 10 / 0;
        System.out.println(x);
    }
}
"""

result = execute_java_code(source_code, timeout=10)

print("\nJava Error Test:")
print(result)