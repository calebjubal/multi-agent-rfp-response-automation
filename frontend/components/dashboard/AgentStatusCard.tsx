"use client";

import { cn } from "@/lib/utils";
import { Activity, Pause, Loader2, CheckCircle2, ArrowUpRight } from "lucide-react";

const statusConfig = {
  active: {
    label: "Active",
    color: "bg-success",
    bgColor: "bg-success/10",
    textColor: "text-success",
    icon: Activity,
  },
  processing: {
    label: "Processing",
    color: "bg-warning",
    bgColor: "bg-warning/10",
    textColor: "text-warning",
    icon: Loader2,
  },
  idle: {
    label: "Idle",
    color: "bg-muted-foreground",
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
    icon: Pause,
  },
  completed: {
    label: "Completed",
    color: "bg-primary",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
    icon: CheckCircle2,
  },
};

export default function AgentStatusCard({ agent, onClick }) {
  const config = statusConfig[agent.status] || statusConfig.idle;
  const StatusIcon = config.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl p-5 cursor-pointer transition-all group card-hover"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", config.bgColor)}>
            <StatusIcon
              className={cn(
                "w-4 h-4",
                config.textColor,
                agent.status === "processing" && "animate-spin"
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">{agent.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn("w-1.5 h-1.5 rounded-full", config.color)} />
              <span className={cn("text-xs", config.textColor)}>{config.label}</span>
            </div>
          </div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {agent.currentTask && (
        <div className="mb-4 p-3 rounded-lg bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Current Task</p>
          <p className="text-sm text-foreground line-clamp-2">{agent.currentTask}</p>
        </div>
      )}

      <div className="pt-3 border-t border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Last activity: <span className="text-foreground">{agent.lastActivity}</span>
        </p>
      </div>
    </div>
  );
}
