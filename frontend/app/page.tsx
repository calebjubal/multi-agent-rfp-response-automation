"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import RequireAuth from "@/components/auth/RequireAuth";
import StatsCard from "@/components/dashboard/StatsCard";
import AgentStatusCard from "@/components/dashboard/AgentStatusCard";
import RFPTable from "@/components/dashboard/RFPTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  FileText,
  Bot,
  Clock,
  TrendingUp,
  RefreshCw,
  Plus,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import {
  mockAgentStatus,
  mockRFPs,
  mockDashboardStats,
} from "@/lib/mock-data";

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [stats] = useState(mockDashboardStats);
  const [agents] = useState(mockAgentStatus);
  const [rfps, setRfps] = useState(mockRFPs);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const handleViewRFP = (rfp) => {
    window.location.href = `/rfps/${rfp.id}`;
  };

  const handleProcessRFP = (rfp) => {
    setRfps((prev) =>
      prev.map((item) =>
        item.id === rfp.id
          ? { ...item, status: item.status === "pending" ? "in-progress" : item.status }
          : item
      )
    );
    toast({
      title: "Processing started",
      description: `RFP ${rfp.id} moved to In Progress.`,
    });
  };

  const handleDownloadResponse = (rfp) => {
    toast({
      title: "Download",
      description: `Preparing response for ${rfp.id}...`,
    });
  };

  return (
    <RequireAuth>
      <div className="flex h-screen bg-background">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            title="Dashboard"
            subtitle="AI-Powered RFP Response Automation"
          />
          
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Welcome back, {user?.name?.split(" ")[0]}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {"Here's what's happening with your RFP pipeline today."}
                </p>
              </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Overview</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your RFP processing pipeline
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  disabled={loading}
                  className="bg-transparent"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
                <Button size="sm" onClick={() => router.push("/rfps?new=1")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New RFP
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatsCard
                title="Total RFPs"
                value={stats.totalRFPs}
                subtitle={`${stats.thisMonthRFPs} this month`}
                icon={FileText}
                trend={{ positive: true, value: "12%" }}
              />
              <StatsCard
                title="Active Processing"
                value={stats.activeRFPs}
                subtitle="Currently in pipeline"
                icon={Bot}
              />
              <StatsCard
                title="Avg Response Time"
                value={stats.avgResponseTime}
                subtitle="Per RFP completion"
                icon={Clock}
              />
              <StatsCard
                title="Success Rate"
                value={stats.successRate}
                subtitle="RFPs completed successfully"
                icon={TrendingUp}
                trend={{ positive: true, value: "5%" }}
              />
            </div>

            {/* Agent Status Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">AI Agent Status</h3>
                  <p className="text-sm text-muted-foreground">Real-time agent activity monitoring</p>
                </div>
                <Link href="/agents">
                  <Button variant="ghost" size="sm" className="text-primary">
                    View All Agents
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <AgentStatusCard
                  agent={agents.sales}
                  onClick={() => (window.location.href = "/agents/sales")}
                />
                <AgentStatusCard
                  agent={agents.technical}
                  onClick={() => (window.location.href = "/agents/technical")}
                />
                <AgentStatusCard
                  agent={agents.pricing}
                  onClick={() => (window.location.href = "/agents/pricing")}
                />
              </div>
            </div>

            {/* Recent RFPs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">Recent RFPs</h3>
                  <p className="text-sm text-muted-foreground">Latest RFPs in your pipeline</p>
                </div>
                <Link href="/rfps">
                  <Button variant="ghost" size="sm" className="text-primary">
                    View All RFPs
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <RFPTable
                rfps={rfps.slice(0, 5)}
                onView={handleViewRFP}
                onProcess={handleProcessRFP}
                onDownload={handleDownloadResponse}
              />
            </div>
          </div>
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
