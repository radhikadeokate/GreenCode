
import subprocess
import threading
import re


def convert_to_bytes(value):
    """Convert Docker memory/disk values into bytes."""

    value = value.strip()

    match = re.match(
        r"([\d.]+)\s*([KMGT]?i?B)?",
        value,
        re.IGNORECASE
    )

    if not match:
        return 0

    number = float(match.group(1))
    unit = (match.group(2) or "B").upper()

    units = {
        "B": 1,
        "KB": 1000,
        "KIB": 1024,
        "MB": 1000 ** 2,
        "MIB": 1024 ** 2,
        "GB": 1000 ** 3,
        "GIB": 1024 ** 3,
        "TB": 1000 ** 4,
        "TIB": 1024 ** 4
    }

    return int(number * units.get(unit, 1))


def get_container_metrics(container_name):
    """Read one Docker container resource-usage snapshot."""

    command = [
        "docker", "stats",
        "--no-stream",
        "--format",
        "{{.CPUPerc}}|{{.MemUsage}}|{{.BlockIO}}",
        container_name
    ]

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=5
        )

        if result.returncode != 0 or not result.stdout.strip():
            return None

        cpu, memory, block_io = result.stdout.strip().split("|")

        memory_used = memory.split("/")[0].strip()
        disk_values = block_io.split("/")

        return {
            "cpu_usage_percent": float(
                cpu.strip().replace("%", "")
            ),
            "memory_usage_bytes": convert_to_bytes(memory_used),
            "disk_read_bytes": convert_to_bytes(disk_values[0]),
            "disk_write_bytes": convert_to_bytes(disk_values[1])
        }

    except (
        subprocess.SubprocessError,
        ValueError,
        IndexError,
        FileNotFoundError
    ):
        return None


def _monitor_loop(container_name, stop_event, samples):
    """Collect Docker metrics periodically."""

    while not stop_event.is_set():
        metrics = get_container_metrics(container_name)

        if metrics is not None:
            samples.append(metrics)

        stop_event.wait(0.25)


def start_container_monitor(container_name):
    """Start background monitoring."""

    stop_event = threading.Event()
    samples = []

    monitor_thread = threading.Thread(
        target=_monitor_loop,
        args=(container_name, stop_event, samples),
        daemon=True
    )

    monitor_thread.start()

    return stop_event, monitor_thread, samples


def stop_container_monitor(stop_event, monitor_thread, samples):
    """Stop monitoring and calculate final metrics."""

    stop_event.set()
    monitor_thread.join(timeout=6)

    if not samples:
        return {
            "cpu_usage_percent": 0.0,
            "memory_usage_mb": 0.0,
            "disk_read_bytes": 0,
            "disk_write_bytes": 0,
            "sample_count": 0
        }

    return {
        "cpu_usage_percent": round(
            sum(s["cpu_usage_percent"] for s in samples)
            / len(samples), 2
        ),
        "memory_usage_mb": round(
            max(s["memory_usage_bytes"] for s in samples)
            / (1024 * 1024), 2
        ),
        "disk_read_bytes": max(
            s["disk_read_bytes"] for s in samples
        ),
        "disk_write_bytes": max(
            s["disk_write_bytes"] for s in samples
        ),
        "sample_count": len(samples)
    }
