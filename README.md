
# 📊 Real-Time System Monitoring & Process Tracking Dashboard

A full-stack real-time system monitoring dashboard designed to track system performance and running processes, inspired by the Windows Task Manager. Built as part of a SOC internship project, it offers accurate, live system metrics including CPU usage, memory, disk usage, network speed, and per-process CPU details — streamed to a modern frontend.

---

## 📑 Table of Contents

- [📖 Project Overview](#-project-overview)
- [🚀 Features](#-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [📈 Backend Implementation Phases](#-backend-implementation-phases)
- [📊 Demo](#-demo)
- [📦 Project Setup](#-project-setup)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [📎 Next Steps](#-next-steps)

---

## 📖 Project Overview

As part of the Security Operations Center (SOC) track, we (a team of 2) were assigned to build a **System Monitoring Dashboard**.

**Objectives:**
- Real-time system metrics display:
  - CPU usage (overall & per-core)
  - Memory usage
  - Disk usage
  - Network speed (Download/Upload/Ping)
  - Running process details (name, CPU usage)
- Emphasis on accuracy and real-time updates
- Mimic the Windows Task Manager functionality
- Enable live metric streaming to a modern frontend interface

---

## 🚀 Features

- 📊 **Real-Time Monitoring:** Continuous live updates via Server-Sent Events (SSE)
- 📉 **Dynamic Data Visualization:** Responsive, interactive charts and metric cards
- 📱 **Mobile-Friendly UI:** Built with Tailwind CSS and Next.js
- 🌙 **Dark/Light Mode Toggle**
- ⚙️ **Accurate Process Tracking:** CPU usage by processes via PowerShell integration
- 🛡️ **Cross-Platform Compatibility:** Windows/Linux support
- 🐍 **Robust Error Handling:** Default values returned on errors (e.g., HTTP 403)

---

## 🛠️ Technology Stack

### 🔙 Backend:
- **Language:** Python 3.9+
- **Framework:** FastAPI
- **Libraries/Tools:**
  - `psutil` — System metrics collection
  - `speedtest-cli` — Network speed tests
  - `subprocess` — PowerShell integration
  - `asyncio`, `uvicorn`, `logging` — Async tasks and debugging
  - FastAPI CORS middleware — Frontend-backend integration
  - `StreamingResponse` — Real-time SSE streaming

### 🔜 Frontend:
- **Framework:** React (Next.js)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Tools:**
  - Custom UI Components (Cards, Tabs, Progress Bars)
  - `lucide-react` icons

---

## 📈 Backend Implementation Phases

**Phase 1:**  
Terminal-based metrics collection via `psutil` and `speedtest`

**Phase 2:**  
API-based system monitoring using FastAPI endpoints for:
- `/cpu`
- `/memory`
- `/disk`
- `/network`

**Phase 3:**  
Integrated CPU process monitoring via PowerShell (`Get-Process | Select Name, CPU`)

**Phase 4:**  
Real-time streaming using FastAPI's `StreamingResponse` and SSE:
- `/metrics` — System metrics stream
- `/cpu-processes` — Process details stream

✔️ Resolved Windows/Linux path issues  
✔️ Matched metrics with Task Manager for higher accuracy  

**Optimization Note:**  
Initially explored a Flask-based polling approach for process data — later replaced by SSE due to polling's inefficiency, higher latency, and increased server load.

---

## 📊 Demo

▶️ [📺 Click here to watch the demo](https://drive.google.com/file/d/1ugOHzbIH6faRnB-N0TNWeuVGBIwK1ZUg/view?usp=drive_link)

---
---
## 📦 Project Setup
## ⚙️ Backend Setup

1. **Clone the Repository**

   ```bash
   git clone <repo_url>
   cd backend
   ```

2. **Create and Activate a Virtual Environment**

   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   source venv/bin/activate  # macOS/Linux
   ```

3. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Run the FastAPI Server**

   ```bash
   uvicorn system_metrics:app --reload
   ```

   Backend runs on: [http://127.0.0.1:8123](http://127.0.0.1:8123)

---

## 🖥️ Frontend Setup

1. **Clone the Repository**

   ```bash
   git clone <repo_url>
   cd frontend
   ```

2. **Install Dependencies using pnpm**

   ```bash
   pnpm install
   ```

3. **Configure Backend SSE Endpoint**
   In `app/page.tsx`, set:

   ```ts
   const backendUrl = "http://127.0.0.1:8123/metrics"
   ```

4. **Run the Frontend**

   ```bash
   pnpm dev
   ```

   Frontend runs on: [http://localhost:3000](http://localhost:3000)

---




## 📎 Next Steps

This System Monitoring Dashboard was integrated with the **Threat Detection Team's network capture tool** for comprehensive monitoring, analysis, and visualization.

---
