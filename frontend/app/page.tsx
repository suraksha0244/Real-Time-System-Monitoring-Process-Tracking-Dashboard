"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Moon, Sun } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, LineChart } from "@/components/ui/chart";
import { Cpu, Database, HardDrive, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import "./dashboard.css"; // External CSS for custom classes

// --- Define Interfaces matching the backend response ---
interface NetworkSpeed {
  download_speed: number;
  upload_speed: number;
  ping: number | null;
}

interface WiFiDetails {
  SSID: string | null;
  "Signal Strength": string | null;
}

interface CPUProcess {
  pid: number;
  name: number;
  cpu_percent: number;
}

interface MemoryProcess {
  pid: number;
  name: string;
  memory_percent: number;
}

// ProcessDetails as transformed by backend
interface ProcessDetails {
  Id: number;
  SI: number;
  ProcessName: string;
  CPU: number;
  Handles: number;
  NPM: number;
  PM: number;
  WS: number;
}

interface MetricsResponse {
  cpu_usage: number;
  per_core_usage: number[];
  memory_usage: number;
  disk_usage: number;
  network_speed: NetworkSpeed;
  wifi_details: WiFiDetails;
  top_cpu_processes: CPUProcess[]; // Provided but not used in this tab
  top_memory_processes: MemoryProcess[];
  top_network_processes: { name: string; connections: number }[];
  process_details: ProcessDetails[] | string;
}

// --- Initial state ---
const initialMetrics: MetricsResponse = {
  cpu_usage: 0,
  per_core_usage: [],
  memory_usage: 0,
  disk_usage: 0,
  network_speed: { download_speed: 0, upload_speed: 0, ping: 0 },
  wifi_details: { SSID: null, "Signal Strength": null },
  top_cpu_processes: [],
  top_memory_processes: [],
  top_network_processes: [],
  process_details: [],
};

export default function SystemDashboard() {
  const [mounted, setMounted] = useState(false);
  const [metrics, setMetrics] = useState<MetricsResponse>(initialMetrics);
  const [cpuHistory, setCpuHistory] = useState<
    Array<{ timestamp: number; value: number }>
  >([]);
  const [coreHistory, setCoreHistory] = useState<
    Array<Array<{ timestamp: number; value: number }>>
  >([]);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);

    // Updated EventSource URL to use backend port 8123
    const eventSource = new EventSource("http://127.0.0.1:8123/metrics");
    eventSource.onmessage = (event) => {
      const data: MetricsResponse = JSON.parse(event.data);
      const timestamp = Date.now();
      setMetrics(data);

      // Update overall CPU history (capped at 99 and keeping last 60 points)
      setCpuHistory((prev) =>
        [...prev, { timestamp, value: Math.min(data.cpu_usage, 99) }].slice(-60)
      );

      // Update per-core history for each core
      setCoreHistory((prev) => {
        if (prev.length === 0) {
          return data.per_core_usage.map((core: number) => [
            { timestamp, value: Math.min(core, 99) },
          ]);
        }
        return data.per_core_usage.map((core: number, index: number) => {
          const coreData = prev[index] || [];
          return [...coreData, { timestamp, value: Math.min(core, 99) }].slice(-60);
        });
      });
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (!mounted) return null;

  const { download_speed, upload_speed, ping } = metrics.network_speed;
  const pingValue = ping ?? 0;

  // Prepare overall CPU chart data
  const cpuChartData = cpuHistory.map((point, index) => ({
    timestamp: index,
    value: point.value,
    fullTime: new Date(point.timestamp).toLocaleTimeString(),
  }));

  // Prepare per-core chart data
  const coresChartData = (() => {
    if (coreHistory.length === 0) return [];
    const length = coreHistory[0].length;
    return Array.from({ length }).map((_, i) => {
      const point: Record<string, number | string> = { timestamp: i };
      point.fullTime = new Date(coreHistory[0][i].timestamp).toLocaleTimeString();
      coreHistory.forEach((coreArray, coreIndex) => {
        point[`core${coreIndex}`] = coreArray[i].value;
      });
      return point;
    });
  })();

  // Custom Tooltip Component for the charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded shadow border border-gray-200">
          <p className="text-sm text-gray-600">Time: {label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm text-gray-600">
              {item.name}: {item.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex flex-col md:flex-row items-center justify-between px-4 py-2 md:py-0">
          <h1 className="text-2xl font-bold mb-2 md:mb-0">
            System Monitoring Dashboard
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-800" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 py-6 space-y-6">
        {/* CPU Card */}
        <div className="w-full">
          <Card>
            <CardHeader className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Cpu className="h-5 w-5 text-muted-foreground" />
                <CardTitle>CPU Usage</CardTitle>
              </div>
              <CardDescription>
                Usage: {metrics.cpu_usage.toFixed(1)}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overall">
                <TabsList className="mb-4">
                  <TabsTrigger value="overall">Overall</TabsTrigger>
                  <TabsTrigger value="cores">Per Core</TabsTrigger>
                  <TabsTrigger value="processes">Processes</TabsTrigger>
                </TabsList>
                <TabsContent value="overall">
                  <div className="h-96">
                    <ChartContainer>
                      <LineChart
                        data={cpuChartData}
                        xAxisDataKey="timestamp"
                        series={[
                          {
                            dataKey: "value",
                            label: "CPU Usage",
                            color: "#22c55e",
                          },
                        ]}
                        yAxisWidth={40}
                        showXAxis
                        showYAxis
                        showGrid
                        showTooltip
                        showLegend={false}
                        xAxisFormatter={(value) => `${value}s`}
                        yAxisFormatter={(value) => `${value.toFixed(0)}%`}
                      />
                    </ChartContainer>
                  </div>
                </TabsContent>
                <TabsContent value="cores">
                  <div className="h-96">
                    <ChartContainer>
                      <LineChart
                        data={coresChartData as any}
                        xAxisDataKey="timestamp"
                        series={coreHistory.map((_, index) => ({
                          dataKey: `core${index}`,
                          label: `Core ${index + 1}`,
                          color: `hsl(${index * 60}, 70%, 50%)`,
                          valueFormatter: (value: number) =>
                            `${value.toFixed(1)}%`,
                        }))}
                        yAxisWidth={40}
                        showXAxis
                        showYAxis
                        showGrid
                        showTooltip
                        showLegend
                        xAxisFormatter={(value) => `${value}s`}
                        yAxisFormatter={(value) => `${value.toFixed(0)}%`}
                      />
                    </ChartContainer>
                  </div>
                </TabsContent>
                <TabsContent value="processes">
                  <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full text-sm table-fixed">
                      <thead className="sticky top-0 bg-background z-10">
                        <tr className="border-b">
                          <th className="px-2 py-1 text-left w-12">PID</th>
                          <th className="px-2 py-1 text-left w-12">SI</th>
                          <th className="px-2 py-1 text-left w-40">Process Name</th>
                          <th className="px-2 py-1 text-left w-12">CPU</th>
                          <th className="px-2 py-1 text-left w-16">Handles</th>
                          <th className="px-2 py-1 text-left w-16">NPM</th>
                          <th className="px-2 py-1 text-left w-16">PM</th>
                          <th className="px-2 py-1 text-left w-16">WS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          let processData: ProcessDetails[] = [];
                          if (typeof metrics.process_details === "string") {
                            try {
                              processData = JSON.parse(
                                metrics.process_details || "[]"
                              );
                            } catch (err) {
                              console.error("Error parsing process details:", err);
                            }
                          } else if (Array.isArray(metrics.process_details)) {
                            processData = metrics.process_details;
                          }
                          return processData.length > 0 ? (
                            processData.map((proc) => (
                              <tr key={proc.Id} className="border-b">
                                <td className="px-2 py-1 w-12">{proc.Id}</td>
                                <td className="px-2 py-1 w-12">{proc.SI}</td>
                                <td className="px-2 py-1 w-40">{proc.ProcessName}</td>
                                <td className="px-2 py-1 w-12">{proc.CPU}</td>
                                <td className="px-2 py-1 w-16">{proc.Handles}</td>
                                <td className="px-2 py-1 w-16">{proc.NPM}</td>
                                <td className="px-2 py-1 w-16">{proc.PM}</td>
                                <td className="px-2 py-1 w-16">{proc.WS}</td>
                              </tr>
                            ))
                          ) : (
                            <tr className="border-b">
                              <td className="px-2 py-1" colSpan={8}>
                                No process data available.
                              </td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Second Row: Memory, Disk, and Network Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Memory Card */}
          <Card>
            <CardHeader className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Memory Usage</CardTitle>
              </div>
              <CardDescription>
                Usage: {metrics.memory_usage.toFixed(1)}%
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={metrics.memory_usage} className="h-2" />
              <div className="text-sm">
                <p>Memory Usage: {metrics.memory_usage.toFixed(1)}%</p>
              </div>
              <div className="mt-2">
                <h3 className="font-semibold">Top Memory Processes</h3>
                <div className="overflow-x-auto max-h-48">
                  <table className="min-w-full text-sm table-fixed">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 text-left w-12">PID</th>
                        <th className="px-2 py-1 text-left w-24">Name</th>
                        <th className="px-2 py-1 text-left w-16">Memory %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.top_memory_processes.map((proc) => (
                        <tr key={proc.pid} className="border-b">
                          <td className="px-2 py-1 w-12">{proc.pid}</td>
                          <td className="px-2 py-1 w-24">{proc.name}</td>
                          <td className="px-2 py-1 w-16">
                            {proc.memory_percent.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Card */}
          <Card>
            <CardHeader className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Network className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Network</CardTitle>
              </div>
              <CardDescription>
                Download: {download_speed} MB/s | Upload: {upload_speed} MB/s | Ping: {pingValue.toFixed(1)} ms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold">WiFi Details</h3>
                  {metrics.wifi_details.SSID ? (
                    <div className="text-sm">
                      <p>SSID: {metrics.wifi_details.SSID}</p>
                      <p>Signal: {metrics.wifi_details["Signal Strength"]}</p>
                    </div>
                  ) : (
                    <p className="text-sm">No WiFi data available</p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">Network Speed</h3>
                  <p className="text-sm">
                    Download: {download_speed} MB/s, Upload: {upload_speed} MB/s, Ping: {pingValue.toFixed(1)} ms
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <h3 className="font-semibold">Top Network Processes</h3>
                <div className="overflow-x-auto max-h-48">
                  <table className="min-w-full text-sm table-fixed">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 text-left w-32">Name</th>
                        <th className="px-2 py-1 text-left w-20">Connections</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.top_network_processes.map((proc, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="px-2 py-1 w-32">{proc.name}</td>
                          <td className="px-2 py-1 w-20">{proc.connections}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disk Card */}
          <Card>
            <CardHeader className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Disk Usage</CardTitle>
              </div>
              <CardDescription>
                {metrics.disk_usage.toFixed(1)}%
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={metrics.disk_usage} className="h-2" />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
