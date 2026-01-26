"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import RequireAuth from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Activity,
  Pause,
  Loader2,
  Globe,
  Database,
  DollarSign,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { mockAgentStatus } from "@/lib/mock-data";

const agentConfigs = {
  sales: {
    icon: Globe,
    color: "text-info",
    bgColor: "bg-info/10",
    description: "Scans websites and portals to identify new RFPs and summarize requirements",
    metrics: [
      { label: "RFPs Scanned", key: "rfpsScanned" },
      { label: "RFPs Identified", key: "rfpsIdentified" },
    ],
  },
  technical: {
    icon: Database,
    color: "text-warning",
    bgColor: "bg-warning/10",
    description: "Matches RFP requirements with OEM product SKUs using RAG-based analysis",
    metrics: [
      { label: "Specs Matched", key: "specsMatched" },
      { label: "Avg Match Score", key: "avgMatchScore", suffix: "%" },
    ],
  },
  pricing: {
    icon: DollarSign,
    color: "text-success",
    bgColor: "bg-success/10",
    description: "Calculates pricing based on product costs and testing requirements",
    metrics: [
      { label: "Quotes Generated", key: "quotesGenerated" },
      { label: "Avg Processing", key: "avgProcessingTime" },
    ],
  },
};

const statusConfig = {
  active: { label: "Active", color: "bg-success", icon: Activity },
  processing: { label: "Processing", color: "bg-warning", icon: Loader2 },
  idle: { label: "Idle", color: "bg-muted-foreground", icon: Pause },
};

export default function AgentsPage() {
  const [activeAgents, setActiveAgents] = useState(mockAgentStatus);
  const [loading, setLoading] = useState(null);

  const refreshAgents = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const agentList = [
    { key: "sales", ...activeAgents.sales },
    { key: "technical", ...activeAgents.technical },
    { key: "pricing", ...activeAgents.pricing },
  ];

  return (
    <RequireAuth>
      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="AI Agents" subtitle="Monitor and control your automation agents" />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Agent Dashboard</h2>
                  <p className="text-muted-foreground mt-1">
                    Manage your AI agents and monitor their performance
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshAgents}
                  disabled={loading}
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                  Refresh Status
                </Button>
              </div>

              {/* Agent Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {agentList.map((agent) => {
                  const config = agentConfigs[agent.key];
                  const status = statusConfig[agent.status] || statusConfig.idle;
                  const Icon = config.icon;
                  const StatusIcon = status.icon;

                  return (
                    <Card
                      key={agent.key}
                      className="hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => (window.location.href = `/agents/${agent.key}`)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2.5 rounded-lg", config.bgColor)}>
                              <Icon className={cn("w-5 h-5", config.color)} />
                            </div>
                            <div>
                              <CardTitle className="text-base">{agent.name}</CardTitle>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Last activity: {agent.lastActivity}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "flex items-center gap-1.5",
                              agent.status === "active" && "bg-success/20 text-success",
                              agent.status === "processing" && "bg-warning/20 text-warning",
                              agent.status === "idle" && "bg-muted text-muted-foreground"
                            )}
                          >
                            <StatusIcon
                              className={cn(
                                "w-3 h-3",
                                agent.status === "processing" && "animate-spin"
                              )}
                            />
                            {status.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{config.description}</p>

                        {agent.currentTask && (
                          <div className="p-3 bg-secondary rounded-lg mb-4">
                            <p className="text-xs text-muted-foreground mb-1">Current Task</p>
                            <p className="text-sm">{agent.currentTask}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <div className="flex items-center gap-6">
                            {config.metrics.map((metric) => (
                              <div key={metric.key}>
                                <p className="text-xs text-muted-foreground">{metric.label}</p>
                                <p className="text-lg font-semibold">
                                  {agent[metric.key]}
                                  {metric.suffix || ""}
                                </p>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/agents/${agent.key}`;
                            }}
                          >
                            View Details
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

            </div>

          {/* System Status */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">System Integration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <div>
                    <p className="text-sm font-medium">OpenAI API</p>
                    <p className="text-xs text-muted-foreground">Connected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <div>
                    <p className="text-sm font-medium">MongoDB</p>
                    <p className="text-xs text-muted-foreground">Connected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <div>
                    <p className="text-sm font-medium">ChromaDB</p>
                    <p className="text-xs text-muted-foreground">Connected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <div>
                    <p className="text-sm font-medium">Backend API</p>
                    <p className="text-xs text-muted-foreground">localhost:3001</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
