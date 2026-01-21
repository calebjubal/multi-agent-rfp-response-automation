"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Play, Download, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusConfig = {
  pending: { label: "Pending", variant: "secondary", className: "bg-muted text-muted-foreground" },
  "in-progress": { label: "In Progress", variant: "default", className: "bg-warning/20 text-warning border-warning/30" },
  completed: { label: "Completed", variant: "outline", className: "bg-success/20 text-success border-success/30" },
  submitted: { label: "Submitted", variant: "outline", className: "bg-primary/20 text-primary border-primary/30" },
};

export default function RFPTable({ rfps, onView, onProcess, onDownload, compact = false }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-4">
                RFP ID
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-4">
                Title
              </th>
              {!compact && (
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-4">
                  Client
                </th>
              )}
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-4">
                Due Date
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-4">
                Status
              </th>
              {!compact && (
                <>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-4">
                    Value
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-4">
                    Match Score
                  </th>
                </>
              )}
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rfps.map((rfp) => {
              const status = statusConfig[rfp.status] || statusConfig.pending;
              return (
                <tr
                  key={rfp.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-secondary/20 group"
                >
                  <td className="px-5 py-4">
                    <span className="text-sm font-mono text-primary font-medium">{rfp.id}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-card-foreground font-medium line-clamp-1">
                      {rfp.title}
                    </span>
                  </td>
                  {!compact && (
                    <td className="px-5 py-4">
                      <span className="text-sm text-muted-foreground">{rfp.client}</span>
                    </td>
                  )}
                  <td className="px-5 py-4">
                    <span className="text-sm text-muted-foreground">
                      {rfp.submissionDate}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={status.variant} className={status.className}>
                      {status.label}
                    </Badge>
                  </td>
                  {!compact && (
                    <>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-card-foreground">
                          {rfp.value}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {rfp.matchScore ? (
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  rfp.matchScore >= 90 ? "bg-success" :
                                  rfp.matchScore >= 70 ? "bg-primary" :
                                  rfp.matchScore >= 50 ? "bg-warning" : "bg-destructive"
                                )}
                                style={{ width: `${rfp.matchScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-foreground min-w-[40px]">
                              {rfp.matchScore}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Pending</span>
                        )}
                      </td>
                    </>
                  )}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onView?.(rfp)}
                      >
                        View
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView?.(rfp)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {rfp.status === "pending" && (
                            <DropdownMenuItem onClick={() => onProcess?.(rfp)}>
                              <Play className="w-4 h-4 mr-2" />
                              Process RFP
                            </DropdownMenuItem>
                          )}
                          {(rfp.status === "completed" || rfp.status === "submitted") && (
                            <DropdownMenuItem onClick={() => onDownload?.(rfp)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download Response
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
