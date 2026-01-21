"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import RequireRole from "@/components/auth/RequireRole";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Shield, Users, Database, Settings, RefreshCw, KeyRound, Loader2 } from "lucide-react";

const systemMetrics = [
  { label: "Total Users", value: "128", icon: Users, tone: "text-primary" },
  { label: "Active Agents", value: "3", icon: Shield, tone: "text-success" },
  { label: "Data Stores", value: "6", icon: Database, tone: "text-info" },
  { label: "API Keys", value: "4", icon: KeyRound, tone: "text-warning" },
];

const accessRequests = [
  { id: "AR-409", name: "Meera Joshi", company: "MetroLine Infra", status: "pending" },
  { id: "AR-410", name: "Rahul Verma", company: "Tata Steel", status: "approved" },
  { id: "AR-411", name: "Fatima Khan", company: "Switchgear Labs", status: "review" },
];

export default function AdminPage() {
  const [actionLoading, setActionLoading] = useState("");

  const runAction = async (key, title, description) => {
    setActionLoading(key);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setActionLoading("");
    toast({ title, description });
  };

  return (
    <RequireRole requiredRole="admin">
      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Admin Panel" subtitle="Oversee system access and configuration" />

          <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {systemMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.label} className="border-border">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="text-2xl font-semibold text-foreground mt-2">{metric.value}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${metric.tone}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">Access Requests</CardTitle>
                    <CardDescription>Review and approve new org access.</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      runAction(
                        "refresh-requests",
                        "Refreshed",
                        "Access requests updated."
                      )
                    }
                    disabled={actionLoading === "refresh-requests"}
                  >
                    {actionLoading === "refresh-requests" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium text-foreground">{request.id}</TableCell>
                        <TableCell>{request.name}</TableCell>
                        <TableCell>{request.company}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              request.status === "approved"
                                ? "bg-success/20 text-success"
                                : request.status === "review"
                                ? "bg-warning/20 text-warning"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary"
                            onClick={() =>
                              runAction(
                                `review-${request.id}`,
                                "Review queued",
                                `Opening review for ${request.id}...`
                              )
                            }
                            disabled={actionLoading === `review-${request.id}`}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Admin Tools</CardTitle>
                  <CardDescription>Quick actions for system maintenance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="secondary"
                    className="w-full justify-start"
                    onClick={() =>
                      runAction(
                        "admin-system-config",
                        "Not implemented",
                        "System Configuration is a placeholder in this demo."
                      )
                    }
                    disabled={actionLoading === "admin-system-config"}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    System Configuration
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full justify-start"
                    onClick={() =>
                      runAction(
                        "admin-backups",
                        "Backup started",
                        "Preparing data backup (demo)."
                      )
                    }
                    disabled={actionLoading === "admin-backups"}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Data Backups
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full justify-start"
                    onClick={() =>
                      runAction(
                        "admin-security",
                        "Not implemented",
                        "Security Policies is a placeholder in this demo."
                      )
                    }
                    disabled={actionLoading === "admin-security"}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Security Policies
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">API Health</CardTitle>
                  <CardDescription>Monitor core services.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Auth Service", status: "healthy" },
                    { name: "RFP Pipeline", status: "healthy" },
                    { name: "Agent Orchestration", status: "degraded" },
                  ].map((service) => (
                    <div key={service.name} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{service.name}</p>
                        <p className="text-xs text-muted-foreground">Last check 2 min ago</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={
                          service.status === "healthy"
                            ? "bg-success/20 text-success"
                            : "bg-warning/20 text-warning"
                        }
                      >
                        {service.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>
          </main>
        </div>
      </div>
    </RequireRole>
  );
}
