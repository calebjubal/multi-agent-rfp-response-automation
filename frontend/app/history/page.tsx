"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import RequireAuth from "@/components/auth/RequireAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Download,
  Loader2,
} from "lucide-react";
import { mockWorkflowHistory } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import Loading from "./loading";

const extendedHistory = [
  ...mockWorkflowHistory,
  {
    id: "WF-003",
    rfpId: "RFP-2024-0890",
    startTime: "2024-01-18 09:00",
    endTime: null,
    status: "in-progress",
    stages: [
      { name: "RFP Identification", status: "completed", duration: "2 min" },
      { name: "Technical Matching", status: "in-progress", duration: "-" },
      { name: "Pricing Calculation", status: "pending", duration: "-" },
      { name: "Response Generation", status: "pending", duration: "-" },
    ],
  },
  {
    id: "WF-004",
    rfpId: "RFP-2024-0888",
    startTime: "2024-01-17 14:20",
    endTime: "2024-01-17 14:25",
    status: "failed",
    error: "Technical matching failed - no suitable products found",
    stages: [
      { name: "RFP Identification", status: "completed", duration: "3 min" },
      { name: "Technical Matching", status: "failed", duration: "2 min" },
      { name: "Pricing Calculation", status: "skipped", duration: "-" },
      { name: "Response Generation", status: "skipped", duration: "-" },
    ],
  },
];

export default function HistoryPage() {
  const [history, setHistory] = useState(extendedHistory);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const searchParams = useSearchParams();
  const [exporting, setExporting] = useState(false);

  const filteredHistory = history.filter((workflow) => {
    const matchesSearch =
      workflow.rfpId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportHistory = async () => {
    setExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const payload = {
      exportedAt: new Date().toISOString(),
      count: filteredHistory.length,
      items: filteredHistory,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExporting(false);
    toast({
      title: "Export started",
      description: "Your workflow history download has started.",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-destructive" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-warning animate-pulse" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStageStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "in-progress":
        return "bg-warning text-warning-foreground";
      case "failed":
        return "bg-destructive text-destructive-foreground";
      case "skipped":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <RequireAuth>
      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            title="Workflow History"
            subtitle="Review completed and ongoing workflows"
          />

          <main className="flex-1 overflow-y-auto p-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by workflow or RFP ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={handleExportHistory} disabled={exporting}>
                  {exporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Export History
                </Button>
              </div>
            </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Workflows</p>
                    <p className="text-2xl font-semibold">{history.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-semibold text-success">
                      {history.filter((h) => h.status === "completed").length}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-semibold text-warning">
                      {history.filter((h) => h.status === "in-progress").length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-warning" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="text-2xl font-semibold text-destructive">
                      {history.filter((h) => h.status === "failed").length}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflow List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Loading />}>
                <Accordion type="single" collapsible className="space-y-3">
                  {filteredHistory.map((workflow) => (
                    <AccordionItem
                      key={workflow.id}
                      value={workflow.id}
                      className="border border-border rounded-lg px-4"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-4">
                            {getStatusIcon(workflow.status)}
                            <div className="text-left">
                              <p className="font-medium">{workflow.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {workflow.rfpId}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm">{workflow.startTime}</p>
                              {workflow.endTime && (
                                <p className="text-xs text-muted-foreground">
                                  to {workflow.endTime.split(" ")[1]}
                                </p>
                              )}
                            </div>
                            <Badge
                              variant="secondary"
                              className={cn(
                                workflow.status === "completed" &&
                                  "bg-success/20 text-success",
                                workflow.status === "in-progress" &&
                                  "bg-warning/20 text-warning",
                                workflow.status === "failed" &&
                                  "bg-destructive/20 text-destructive"
                              )}
                            >
                              {workflow.status}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        {/* Stages */}
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-3">Workflow Stages</p>
                          <div className="space-y-2">
                            {workflow.stages.map((stage, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                                      getStageStatusStyle(stage.status)
                                    )}
                                  >
                                    {index + 1}
                                  </div>
                                  <span className="text-sm">{stage.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm text-muted-foreground">
                                    {stage.duration}
                                  </span>
                                  <Badge variant="outline" className="capitalize">
                                    {stage.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Error Message */}
                        {workflow.error && (
                          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-sm text-destructive">{workflow.error}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-4 flex items-center gap-3">
                          <Button variant="outline" size="sm">
                            View RFP
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                          {workflow.status === "failed" && (
                            <Button size="sm">Retry Workflow</Button>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Suspense>
            </CardContent>
          </Card>
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
