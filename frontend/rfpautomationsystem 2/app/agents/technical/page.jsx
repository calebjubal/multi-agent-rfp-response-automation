"use client";

import AgentDetailView from "@/components/agents/AgentDetailView";
import { mockAgentStatus } from "@/lib/mock-data";
import { Database } from "lucide-react";

const config = {
  icon: Database,
  color: "text-warning",
  bgColor: "bg-warning/10",
  description: "Matches RFP requirements with OEM product SKUs using RAG-based analysis",
  metrics: [
    { label: "Specs Matched", key: "specsMatched" },
    { label: "Avg Match Score", key: "avgMatchScore", suffix: "%" },
  ],
  capabilities: [
    "RAG-based specification matching",
    "OEM datasheet analysis",
    "Multi-SKU recommendation",
    "Spec match percentage calculation",
    "Technical comparison tables",
  ],
};

export default function TechnicalAgentPage() {
  return (
    <AgentDetailView
      agentKey="technical"
      agent={mockAgentStatus.technical}
      config={config}
    />
  );
}
