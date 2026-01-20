"use client";

import AgentDetailView from "@/components/agents/AgentDetailView";
import { mockAgentStatus } from "@/lib/mock-data";
import { Globe } from "lucide-react";

const config = {
  icon: Globe,
  color: "text-info",
  bgColor: "bg-info/10",
  description: "Scans websites and portals to identify new RFPs and summarize requirements",
  metrics: [
    { label: "RFPs Scanned", key: "rfpsScanned" },
    { label: "RFPs Identified", key: "rfpsIdentified" },
  ],
  capabilities: [
    "Web scraping of tender portals",
    "RFP document extraction",
    "Submission deadline tracking",
    "Requirement summarization",
    "Automatic notification alerts",
  ],
};

export default function SalesAgentPage() {
  return (
    <AgentDetailView
      agentKey="sales"
      agent={mockAgentStatus.sales}
      config={config}
    />
  );
}
