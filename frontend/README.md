# System Monitoring Dashboard (Frontend)

This repository contains the frontend code for a real-time system monitoring dashboard built using React and Next.js. The dashboard displays live system metrics including CPU usage (overall and per-core), memory usage, disk usage, and network statistics. It connects to a FastAPI backend via Server-Sent Events (SSE) to fetch and display the data in real time.

## Features

- **Real-Time Monitoring:**  
  Displays live metrics from the backend.
- **Dynamic Charts:**  
  Visualizes overall CPU and per-core usage using charts.
- **Responsive UI:**  
  Built with a mobile-first approach to work across various devices.
- **Dark/Light Mode Toggle:**  
  Easily switch between dark and light themes.
- **Error Handling:**  
  Defaults network metrics to 0 if an error occurs (e.g., HTTP 403).

## Technologies Used

- [React](https://reactjs.org/)
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) (or a similar utility-first CSS framework)
- Custom UI Components (Card, Tabs, Chart, Progress, etc.)
- [lucide-react](https://lucide.dev/) for icons

## Getting Started

### Prerequisites

- **Node.js** (v14 or later)
- **npm** or **yarn**

### Installation

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

### Configuration

The frontend connects to the FastAPI backend's SSE endpoint at `http://127.0.0.1:8123/metrics`. If your backend is hosted at a different URL, update the endpoint in `app/page.tsx`.

### Running the Application

Start the development server with:

```bash
npm run dev
```
or
```bash
yarn dev
```

Then open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the dashboard.
