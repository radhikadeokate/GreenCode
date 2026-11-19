
import subprocess
import tempfile
import time
import uuid

from pathlib import Path

from app.monitoring.runtime_monitor import (
    start_container_monitor,
    stop_container_monitor
)


def execute_java_code(source_code: str, timeout: int = 15):
    start_time = time.perf_counter()
    container_name = f"greencode-java-{uuid.uuid4().hex[:12]}"

    with tempfile.TemporaryDirectory() as temp_dir:
        code_file = Path(temp_dir) / "Main.java"
        code_file.write_text(source_code, encoding="utf-8")

        command = [
            "docker", "run",
            "--name", container_name,
            "--network", "none",
            "--memory", "256m",
            "--cpus", "0.5",
            "--pids-limit", "64",
            "--read-only",
            "--tmpfs", "/tmp:rw,nosuid,size=64m",
            "--cap-drop", "ALL",
            "--security-opt", "no-new-privileges",
            "--user", "65534:65534",
            "--mount",
            f"type=bind,source={temp_dir},target=/input,readonly",
            "eclipse-temurin:21-jdk",
            "sh", "-c",
            "javac -d /tmp /input/Main.java && java -cp /tmp Main"
        ]

        process = None
        monitor_data = None
        execution_time = 0
        status = "failed"
        output = ""
        error = ""
        return_code = None

        try:
            process = subprocess.Popen(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )

            stop_event, monitor_thread, samples = (
                start_container_monitor(container_name)
            )
            monitor_data = (stop_event, monitor_thread, samples)

            try:
                output, error = process.communicate(timeout=timeout)
                return_code = process.returncode
                status = "completed" if return_code == 0 else "failed"

            except subprocess.TimeoutExpired:
                error = "Execution timed out."
                status = "failed"

                subprocess.run(
                    ["docker", "kill", container_name],
                    capture_output=True,
                    text=True,
                    timeout=5
                )

                try:
                    output, stderr = process.communicate(timeout=3)
                    if stderr:
                        error = stderr
                except subprocess.TimeoutExpired:
                    process.kill()
                    output, stderr = process.communicate()
                    if stderr:
                        error = stderr

            execution_time = round(time.perf_counter() - start_time, 4)

        except FileNotFoundError:
            error = "Docker CLI was not found."

        except subprocess.TimeoutExpired:
            error = "Docker did not respond in time."

        finally:
            if monitor_data:
                stop_event, monitor_thread, samples = monitor_data
                runtime_metrics = stop_container_monitor(
                    stop_event, monitor_thread, samples
                )
            else:
                runtime_metrics = {
                    "cpu_usage_percent": 0.0,
                    "memory_usage_mb": 0.0,
                    "disk_read_bytes": 0,
                    "disk_write_bytes": 0,
                    "sample_count": 0
                }

            try:
                subprocess.run(
                    ["docker", "rm", "-f", container_name],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
            except (subprocess.SubprocessError, FileNotFoundError):
                pass

        return {
            "status": status,
            "output": output,
            "error": error,
            "return_code": return_code,
            "execution_time_seconds": execution_time,
            "runtime_metrics": runtime_metrics
        }
