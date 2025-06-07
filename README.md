# System Monitoring Dashboard

This full-stack project provides a real-time system monitoring dashboard. The application displays live system metrics—such as CPU usage (overall and per-core), memory usage, disk usage, and network statistics—using a FastAPI backend and a React/Next.js frontend. The backend streams metrics via Server-Sent Events (SSE) to be consumed and visualized by the frontend.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Frontend Setup](#frontend-setup)
  - [Getting Started](#getting-started-frontend)
  - [Folder Structure](#frontend-folder-structure)
- [Backend Setup](#backend-setup)
  - [Getting Started](#getting-started-backend)
  - [Project Structure](#backend-project-structure)

---

## Overview

The System Monitoring Dashboard is divided into two main components:

1. **Frontend:**  
   A React/Next.js application that consumes real-time metrics from the backend and displays them using dynamic charts and responsive UI components.
   
2. **Backend:**  
   A FastAPI application that collects system metrics using [psutil](https://github.com/giampaolo/psutil) and [speedtest-cli](https://pypi.org/project/speedtest-cli/), streaming the data via SSE. It also includes CORS support to allow communication with the frontend.

---

## Features

- **Real-Time Monitoring:**  
  Live updates of system metrics via SSE.
- **Dynamic Data Visualization:**  
  Interactive charts for CPU and per-core usage.
- **Responsive Design:**  
  A mobile-first, responsive UI built with Next.js and Tailwind CSS.
- **Dark/Light Mode:**  
  Toggle between dark and light themes.
- **Robust Error Handling:**  
  Provides default values (e.g., network speed as 0) when errors occur (e.g., HTTP 403).
- **Backend Metrics Collection:**  
  Gathers CPU, memory, disk, and network metrics using industry-standard libraries.

---

## Technologies Used

### Frontend
- [React](https://reactjs.org/)
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- Custom UI Components (Card, Tabs, Chart, Progress, etc.)
- [lucide-react](https://lucide.dev/) for icons

### Backend
- [Python](https://www.python.org/) (v3.9+)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Uvicorn](https://www.uvicorn.org/)
- [psutil](https://github.com/giampaolo/psutil)
- [speedtest-cli](https://pypi.org/project/speedtest-cli/)
- FastAPI CORS Middleware

---

## Frontend Setup

### Getting Started (Frontend)

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Shreyashs98/SOC_TOR_INTERNSHIP_25.git
   cd frontend
   ```

2. **Install Dependencies:**

   Using npm:
   ```bash
   npm install
   ```
   or using yarn:
   ```bash
   yarn install
   ```

3. **Configuration:**

   The frontend connects to the FastAPI backend's SSE endpoint at `http://127.0.0.1:8123/metrics`. Update the endpoint in `app/page.tsx` if your backend is hosted elsewhere.

4. **Running the Application:**

   Start the development server with:
   ```bash
   npm run dev
   ```
   or
   ```bash
   yarn dev
   ```

   Then open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## Backend Setup

### Getting Started (Backend)

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

### Running the Server

Start the FastAPI server using Uvicorn:

```bash
uvicorn system_metrics:app --reload
```

This runs the server on [http://127.0.0.1:8123](http://127.0.0.1:8123) with hot-reloading enabled for development.

### Backend Project Structure

```plaintext
backend/
├── system_metrics.py    # Main FastAPI application streaming system metrics
├── requirements.txt     # Python dependencies (if provided)
└── README.md            # This file
```

### CORS Configuration

The backend uses FastAPI’s CORS middleware to allow requests from the frontend (typically at `http://localhost:3000`). Modify the `origins` list in `system_metrics.py` if your frontend is hosted at a different origin.

---

