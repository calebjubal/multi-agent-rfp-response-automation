"use client";

import AgentDetailView from "@/components/agents/AgentDetailView";
import { mockAgentStatus } from "@/lib/mock-data";
import { Cpu } from "lucide-react";

const config = {
  icon: Cpu,
  color: "text-primary",
  bgColor: "bg-primary/10",
  description: "Coordinates all agent activities and manages the RFP workflow end-to-end",
  metrics: [{ label: "Tasks Completed", key: "tasksCompleted" }],
  capabilities: [
    "Orchestrates multi-agent workflows",
    "Manages data flow between agents",
    "Handles error recovery and retries",
    "Generates final RFP response documents",
    "Coordinates parallel processing tasks",
  ],
};

export default function OrchestratorPage() {
  return (
    <AgentDetailView
      agentKey="orchestrator"
      agent={mockAgentStatus.orchestrator}
      config={config}
    />
  );
}
