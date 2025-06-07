```markdown
# System Monitoring Backend

This project provides a real-time system monitoring backend built with FastAPI. It gathers system metrics—such as CPU usage (overall and per-core), memory usage, disk usage, and network speed—and streams them via Server-Sent Events (SSE) to be consumed by a frontend dashboard.

## Features

- **Real-Time Metrics Streaming:**  
  Streams system metrics every second via SSE.
- **System Metrics Collection:**  
  Uses [psutil](https://github.com/giampaolo/psutil) for CPU, memory, and disk usage.
- **Network Speed Testing:**  
  Uses [speedtest-cli](https://pypi.org/project/speedtest-cli/) to fetch network speed data, updated in a background thread.
- **CORS Support:**  
  Configured to allow requests from specified frontend origins (e.g., `http://localhost:3000`).

## Technologies Used

- [Python](https://www.python.org/) (v3.9+)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Uvicorn](https://www.uvicorn.org/)
- [psutil](https://github.com/giampaolo/psutil)
- [speedtest-cli](https://pypi.org/project/speedtest-cli/)
- FastAPI CORS Middleware

## Installation

### Prerequisites

- Python 3.9 or higher
- [pip](https://pip.pypa.io/)

### Steps

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Shreyashs98/SOC_TOR_INTERNSHIP_25.git
   cd backend
   ```

2. **Create and Activate a Virtual Environment:**

   On macOS/Linux:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
   On Windows:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. **Install Dependencies:**

   If you have a `requirements.txt` file:
   ```bash
   pip install -r requirements.txt
   ```
   Otherwise, install the necessary packages manually:
   ```bash
   pip install fastapi uvicorn psutil speedtest-cli
   ```

## Running the Server

Start the FastAPI server using Uvicorn:

```bash
uvicorn system_metrics:app --reload
```

This will run the server on [http://127.0.0.1:8123](http://127.0.0.1:8123) with hot-reloading enabled for development.

## API Endpoints

- **GET `/metrics`**  
  Streams the real-time system metrics using Server-Sent Events (SSE).

## Project Structure

```plaintext
.
├── system_metrics.py      # Main FastAPI application that streams system metrics
├── requirements.txt       # Python dependencies (if provided)
└── README.md              # This file
```

## CORS Configuration

The backend uses FastAPI’s CORS middleware to allow requests from your frontend, typically hosted at `http://localhost:3000`. If your frontend is hosted at a different origin, update the `origins` list in `system_metrics.py` accordingly.

## Troubleshooting

- **Network Speed Errors:**  
  Network speed measurements may sometimes return an error (e.g., HTTP 403 Forbidden). In such cases, the backend logs the error and returns a default value. The frontend can check for these errors and display "0" or "No network" as appropriate.

- **Module Not Found Errors:**  
  Ensure your virtual environment is activated and that all dependencies are installed in the correct environment.
