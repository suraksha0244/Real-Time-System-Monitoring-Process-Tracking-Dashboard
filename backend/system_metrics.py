import os
import psutil
from speedtest import Speedtest
import asyncio
import time
import threading
import json
import logging
import subprocess
import platform
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

# Determine current OS
current_os = platform.system()
logging.info(f"Running on {current_os}")

# Configure logging
logging.basicConfig(level=logging.INFO)

app = FastAPI()

# Enable CORS for frontend
origins = ["http://localhost:3000", "https://soc-tool.vercel.app"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ Fast Metrics ------------------
def get_cpu_usage():
    return psutil.cpu_percent(interval=0)

def get_cpu_core_usage():
    return psutil.cpu_percent(interval=0, percpu=True)

def get_memory_usage():
    return psutil.virtual_memory().percent

def get_disk_usage():
    total, used, free = 0, 0, 0
    for part in psutil.disk_partitions(all=False):
        try:
            usage = psutil.disk_usage(part.mountpoint)
            total += usage.total
            used += usage.used
            free += usage.free
        except PermissionError:
            continue
    return round((used / total) * 100, 2) if total else 0

def get_network_speed():
    try:
        st = Speedtest()
        st.get_best_server()
        download = round(st.download() / 1_000_000, 2)
        upload = round(st.upload() / 1_000_000, 2)
        ping = round(st.results.ping, 2)
        return {"download_speed": download, "upload_speed": upload, "ping": ping}
    except Exception as e:
        logging.warning(f"Network error: {e}")
        return {"download_speed": 0, "upload_speed": 0, "ping": None}

# ------------------ Background Updates for Fast Metrics ------------------
network_data = {"download_speed": 0, "upload_speed": 0, "ping": None}
def update_network_speed():
    global network_data
    while True:
        try:
            network_data = get_network_speed()
        except Exception as e:
            logging.error(f"Error in network monitoring: {e}")
        time.sleep(10)

threading.Thread(target=update_network_speed, daemon=True).start()

# ------------------ Heavy Metrics (Top Processes) ------------------
def get_top_cpu_processes():
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
        try:
            processes.append({
                "pid": proc.info['pid'],
                "name": proc.info['name'],
                "cpu_percent": proc.info['cpu_percent']
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return sorted(processes, key=lambda x: x["cpu_percent"], reverse=True)[:5]

def get_top_memory_processes():
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'memory_percent']):
        try:
            processes.append({
                "pid": proc.info['pid'],
                "name": proc.info['name'],
                "memory_percent": round(proc.info['memory_percent'], 2)
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return sorted(processes, key=lambda x: x["memory_percent"], reverse=True)[:5]

def get_top_network_processes():
    process_data = []
    for proc in psutil.process_iter(['name']):
        try:
            connections = proc.connections()
            if connections:
                process_data.append({
                    "name": proc.info['name'],
                    "connections": len(connections)
                })
        except (psutil.AccessDenied, psutil.NoSuchProcess):
            continue
    process_data.sort(key=lambda x: x["connections"], reverse=True)
    return process_data[:5]

global_top_cpu_processes = []
global_top_memory_processes = []
global_top_network_processes = []

def update_top_processes():
    global global_top_cpu_processes, global_top_memory_processes, global_top_network_processes
    while True:
        global_top_cpu_processes = get_top_cpu_processes()
        global_top_memory_processes = get_top_memory_processes()
        global_top_network_processes = get_top_network_processes()
        time.sleep(5)

threading.Thread(target=update_top_processes, daemon=True).start()

# ------------------ WiFi Details Feature ------------------
def get_wifi_details():
    system = platform.system()
    if system == "Windows":
        try:
            result = subprocess.check_output("netsh wlan show interfaces", shell=True).decode()
            ssid = None
            signal = None
            for line in result.splitlines():
                if "SSID" in line and "BSSID" not in line:
                    parts = line.split(":", 1)
                    if len(parts) == 2:
                        ssid = parts[1].strip()
                if "Signal" in line:
                    parts = line.split(":", 1)
                    if len(parts) == 2:
                        signal = parts[1].strip()
            return {"SSID": ssid, "Signal Strength": signal}
        except Exception as e:
            logging.warning("WiFi details error: " + str(e))
            return {"SSID": None, "Signal Strength": None}
    elif system == "Linux":
        try:
            # Use nmcli to get current WiFi connection details with signal strength
            result = subprocess.check_output("nmcli -t -f active,ssid,signal dev wifi", shell=True).decode()
            ssid, signal_strength = None, None
            for line in result.splitlines():
                parts = line.split(':')
                if parts[0] == "yes":
                    ssid = parts[1].strip() if len(parts) > 1 else None
                    signal_strength = parts[2].strip() if len(parts) > 2 else None
                    break
            return {"SSID": ssid, "Signal Strength": signal_strength}
        except Exception as e:
            logging.warning("WiFi details error: " + str(e))
            return {"SSID": None, "Signal Strength": None}
    elif system == "Darwin":
        try:
            # macOS: using airport command (ensure the path is correct)
            result = subprocess.check_output(
                "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I",
                shell=True
            ).decode()
            ssid = None
            signal = None
            for line in result.splitlines():
                if "SSID:" in line:
                    ssid = line.split("SSID:")[-1].strip()
                if "agrCtlRSSI:" in line:
                    signal = line.split("agrCtlRSSI:")[-1].strip()
            return {"SSID": ssid, "Signal Strength": signal}
        except Exception as e:
            logging.warning("WiFi details error: " + str(e))
            return {"SSID": None, "Signal Strength": None}
    else:
        return {"SSID": None, "Signal Strength": None}

global_wifi_details = {"SSID": None, "Signal Strength": None}
def update_wifi_details():
    global global_wifi_details
    while True:
        global_wifi_details = get_wifi_details()
        time.sleep(5)

threading.Thread(target=update_wifi_details, daemon=True).start()

# ------------------ Custom Parser for Linux Top Output ------------------
def parse_top_output(top_output: str):
    """
    Parse Linux 'top' output by looking for a header line containing both 'PID' and 'COMMAND'
    and splitting subsequent lines into columns.
    """
    lines = top_output.splitlines()
    process_data = []
    header_line = None

    # Look for the header line that contains both "PID" and "COMMAND"
    for line in lines:
        if "PID" in line and "COMMAND" in line:
            header_line = line
            break

    if not header_line:
        return process_data

    headers = header_line.split()
    header_index = lines.index(header_line)

    # Process subsequent lines. Use maxsplit to correctly capture the COMMAND column.
    for line in lines[header_index + 1:]:
        if not line.strip():
            continue
        columns = line.split(None, len(headers) - 1)
        if len(columns) < len(headers):
            continue
        process = {headers[i]: columns[i] for i in range(len(headers))}
        process_data.append(process)
    return process_data

# ------------------ Process Details Feature ------------------
def get_process():
    system = platform.system()
    if system == "Windows":
        result = subprocess.run(
            ["powershell", "-command", "Get-Process | Select-Object Id, SI, ProcessName, CPU, Handles, NPM, PM, WS | ConvertTo-Json -Depth 10"],
            capture_output=True,
            text=True
        )
        return result.stdout if result.returncode == 0 else f"Error: {result.stderr}"
    elif system == "Linux":
        result = subprocess.run(["top", "-b", "-n", "1"], capture_output=True, text=True)
        if result.returncode == 0:
            structured_data = parse_top_output(result.stdout)
            # Transform the parsed data to match the expected frontend structure:
            transformed = []
            for proc in structured_data:
                try:
                    transformed.append({
                        "Id": int(proc.get("PID", 0)),
                        "SI": 0,  # Not available in Linux top output
                        "ProcessName": proc.get("COMMAND", ""),
                        "CPU": float(proc.get("%CPU", 0)),
                        "Handles": 0,  # Not available
                        "NPM": 0,      # Not available
                        "PM": 0,       # Not available
                        "WS": 0        # Not available
                    })
                except ValueError:
                    continue
            return json.dumps(transformed)
        else:
            return f"Error: {result.stderr}"
    elif system == "Darwin":
        result = subprocess.run(["top", "-l", "1", "-n", "0"], capture_output=True, text=True)
        # For macOS, similar parsing/transformation logic can be applied if needed.
        return result.stdout if result.returncode == 0 else f"Error: {result.stderr}"
    else:
        return "Unsupported OS"

global_process_details = None
def update_process_details():
    global global_process_details
    while True:
        global_process_details = get_process()
        time.sleep(0.05)  # Update every 50 milliseconds

threading.Thread(target=update_process_details, daemon=True).start()

# ------------------ Streaming Endpoint ------------------
async def stream_metrics():
    while True:
        data = {
            "cpu_usage": get_cpu_usage(),
            "per_core_usage": get_cpu_core_usage(),
            "memory_usage": get_memory_usage(),
            "disk_usage": get_disk_usage(),
            "network_speed": network_data,
            "wifi_details": global_wifi_details,
            "top_cpu_processes": global_top_cpu_processes,
            "top_memory_processes": global_top_memory_processes,
            "top_network_processes": global_top_network_processes,
            "process_details": global_process_details  # Process details updated every 50ms
        }
        yield f"data: {json.dumps(data)}\n\n"
        await asyncio.sleep(1)

@app.get("/metrics")
def metrics():
    return StreamingResponse(stream_metrics(), media_type="text/event-stream")

@app.get("/process")
def process():
    try:
        process_data = json.loads(global_process_details)
    except Exception as e:
        process_data = {"error": global_process_details}
    return process_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8123, reload=True)
