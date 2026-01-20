"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import RequireAuth from "@/components/auth/RequireAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Play,
  Pause,
  RefreshCw,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const mockLogs = [
  { time: "14:32:15", level: "info", message: "Agent initialized successfully" },
  { time: "14:32:16", level: "info", message: "Connected to OpenAI API" },
  { time: "14:32:18", level: "info", message: "Starting task execution" },
  { time: "14:33:45", level: "success", message: "RFP-2024-0892 processing completed" },
  { time: "14:34:02", level: "info", message: "Waiting for next task..." },
  { time: "14:35:10", level: "warning", message: "API rate limit approaching" },
  { time: "14:36:22", level: "info", message: "New task received from queue" },
];

const mockHistory = [
  { id: 1, task: "Process RFP-2024-0892", status: "completed", duration: "8m 32s" },
  { id: 2, task: "Process RFP-2024-0891", status: "completed", duration: "12m 45s" },
  { id: 3, task: "Process RFP-2024-0890", status: "failed", duration: "2m 10s" },
  { id: 4, task: "Process RFP-2024-0889", status: "completed", duration: "6m 22s" },
];

export default function AgentDetailView({ agentKey, agent, config }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRunning, setIsRunning] = useState(agent.status !== "idle");
  const [restarting, setRestarting] = useState(false);

  const toggleRunning = () => {
    const next = !isRunning;
    setIsRunning(next);
    toast({
      title: next ? "Agent started" : "Agent paused",
      description: `${agent.name} status updated (demo).`,
    });
  };

  const handleRestart = async () => {
    setRestarting(true);
    toast({
      title: "Restarting agent",
      description: "Reinitializing agent process (demo)...",
    });
    await new Promise((resolve) => setTimeout(resolve, 900));
    setRestarting(false);
    setIsRunning(true);
    toast({
      title: "Agent restarted",
      description: `${agent.name} is back online.`,
    });
  };

  const Icon = config.icon;

  const getLogLevelStyle = (level) => {
    switch (level) {
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      case "error":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <RequireAuth>
      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={agent.name} subtitle={config.description} />

          <main className="flex-1 overflow-y-auto p-6">
          {/* Back & Actions */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/agents">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Agents
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleRunning}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Agent
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Agent
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestart}
                disabled={restarting}
              >
                {restarting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Restart
              </Button>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-lg", config.bgColor)}>
                    <Icon className={cn("w-5 h-5", config.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      variant="secondary"
                      className={cn(
                        agent.status === "active" && "bg-success/20 text-success",
                        agent.status === "processing" && "bg-warning/20 text-warning",
                        agent.status === "idle" && "bg-muted text-muted-foreground"
                      )}
                    >
                      {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-secondary">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Activity</p>
                    <p className="font-medium">{agent.lastActivity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {config.metrics.map((metric) => (
              <Card key={metric.key}>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-semibold">
                      {agent[metric.key]}
                      {metric.suffix || ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Current Task */}
          {agent.currentTask && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary animate-pulse" />
                  Current Task
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{agent.currentTask}</p>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="history">Task History</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Agent Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {config.capabilities?.map((cap, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                          {cap}
                        </li>
                      )) || (
                        <>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                            Automated task processing
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                            LLM-powered analysis
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                            Real-time status updates
                          </li>
                        </>
                      )}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Success Rate</span>
                        <span className="font-medium">94%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg Response Time</span>
                        <span className="font-medium">2.3s</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Tasks Today</span>
                        <span className="font-medium">23</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Errors Today</span>
                        <span className="font-medium text-destructive">2</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Real-time Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="font-mono text-sm space-y-1">
                      {mockLogs.map((log, i) => (
                        <div key={i} className="flex items-start gap-3 py-1">
                          <span className="text-muted-foreground">{log.time}</span>
                          <span
                            className={cn(
                              "w-16 uppercase text-xs",
                              getLogLevelStyle(log.level)
                            )}
                          >
                            [{log.level}]
                          </span>
                          <span className="text-foreground">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Task History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockHistory.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {task.status === "completed" ? (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                          )}
                          <span className="text-sm">{task.task}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {task.duration}
                          </span>
                          <Badge
                            variant={task.status === "completed" ? "outline" : "destructive"}
                            className={
                              task.status === "completed"
                                ? "bg-success/20 text-success border-success/30"
                                : ""
                            }
                          >
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Agent Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Model</p>
                        <p className="text-sm font-mono">gpt-4-turbo</p>
                      </div>
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Temperature</p>
                        <p className="text-sm font-mono">0.7</p>
                      </div>
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Max Tokens</p>
                        <p className="text-sm font-mono">4096</p>
                      </div>
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Timeout</p>
                        <p className="text-sm font-mono">60s</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
