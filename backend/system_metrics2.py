# backend code- showing cpu processes in realtime 

import os
import psutil
import asyncio
import time
import threading
import json
import logging
import subprocess
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)

app = FastAPI()

# Enable CORS for your frontend (adjust origins as needed).
origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Function to get memory usage
def get_memory_usage():
    return psutil.virtual_memory().percent

# Function to get disk usage
def get_disk_usage():
    disk_path = "C:\\" if os.name == "nt" else "/"
    return psutil.disk_usage(disk_path).percent

# Global variable for network data
network_data = {"download_speed": 0, "upload_speed": 0, "ping": 0}

# Function to get CPU process details using PowerShell
def get_cpu_processes():
    try:
        result = subprocess.run([
            "powershell", "-Command", "Get-Process | Select-Object ProcessName,Id,@{Name='CPU';Expression={$_.CPU}},@{Name='Memory';Expression={$_.WS}} | ConvertTo-Json"
        ], capture_output=True, text=True, check=True)
        return json.loads(result.stdout)
    except Exception as e:
        logging.warning(f"Error fetching CPU processes: {e}")
        return {"error": str(e)}

# Background thread to update network speed every 3 seconds
def update_network_speed():
    global network_data
    while True:
        network_data = {"download_speed": 0, "upload_speed": 0, "ping": 0}  # Placeholder (replace with actual network speed function)
        time.sleep(3)

threading.Thread(target=update_network_speed, daemon=True).start()

# Streaming function to update metrics every second via SSE
async def stream_metrics():
    while True:
        data = {
            "memory_usage": get_memory_usage(),
            "disk_usage": get_disk_usage(),
            "network_speed": network_data,
        }
        yield f"data: {json.dumps(data)}\n\n"
        await asyncio.sleep(1)

# Streaming function to update CPU process details every 2 seconds via SSE
async def stream_cpu_processes():
    while True:
        process_data = get_cpu_processes()
        yield f"data: {json.dumps(process_data)}\n\n"
        await asyncio.sleep(2)

# API Endpoint to stream system metrics in real time
@app.get("/metrics")
def metrics():
    return StreamingResponse(stream_metrics(), media_type="text/event-stream")

# API Endpoint to stream live CPU process details
@app.get("/cpu-processes")
def cpu_processes():
    return StreamingResponse(stream_cpu_processes(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
