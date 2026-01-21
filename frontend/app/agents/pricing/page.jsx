"use client";

import AgentDetailView from "@/components/agents/AgentDetailView";
import { mockAgentStatus } from "@/lib/mock-data";
import { DollarSign } from "lucide-react";

const config = {
  icon: DollarSign,
  color: "text-success",
  bgColor: "bg-success/10",
  description: "Calculates pricing based on product costs and testing requirements",
  metrics: [
    { label: "Quotes Generated", key: "quotesGenerated" },
    { label: "Avg Processing", key: "avgProcessingTime" },
  ],
  capabilities: [
    "Unit price calculation",
    "Testing cost estimation",
    "Bulk pricing logic",
    "Margin optimization",
    "Cost breakdown reports",
  ],
};

export default function PricingAgentPage() {
  return (
    <AgentDetailView
      agentKey="pricing"
      agent={mockAgentStatus.pricing}
      config={config}
    />
  );
}
