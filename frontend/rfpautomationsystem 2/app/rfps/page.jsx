"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import RequireAuth from "@/components/auth/RequireAuth";
import RFPTable from "@/components/dashboard/RFPTable";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  Filter,
  Upload,
  FileText,
  Calendar,
} from "lucide-react";
import { mockRFPs } from "@/lib/mock-data";
import Loading from "./loading";

export default function RFPsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rfps, setRfps] = useState(mockRFPs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewRFPOpen, setIsNewRFPOpen] = useState(false);
  const [newRfp, setNewRfp] = useState({
    title: "",
    client: "",
    submissionDate: "",
    description: "",
  });
  const [newRfpError, setNewRfpError] = useState("");

  useEffect(() => {
    const shouldOpen = searchParams.get("new") === "1";
    if (!shouldOpen) return;
    setIsNewRFPOpen(true);
    router.replace("/rfps");
  }, [router, searchParams]);

  const filteredRFPs = rfps.filter((rfp) => {
    const matchesSearch =
      rfp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfp.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || rfp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: rfps.length,
    pending: rfps.filter((r) => r.status === "pending").length,
    "in-progress": rfps.filter((r) => r.status === "in-progress").length,
    completed: rfps.filter((r) => r.status === "completed").length,
    submitted: rfps.filter((r) => r.status === "submitted").length,
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

  const handleCreateRFP = () => {
    if (!newRfp.title.trim() || !newRfp.client.trim() || !newRfp.submissionDate) {
      setNewRfpError("Title, client, and submission date are required.");
      return;
    }

    const newEntry = {
      id: `RFP-${new Date().getFullYear()}-${String(rfps.length + 1).padStart(4, "0")}`,
      title: newRfp.title.trim(),
      client: newRfp.client.trim(),
      submissionDate: newRfp.submissionDate,
      status: "pending",
      value: "₹0",
      matchScore: null,
      products: 0,
      description: newRfp.description.trim(),
    };

    setRfps((prev) => [newEntry, ...prev]);
    setIsNewRFPOpen(false);
    setNewRfpError("");
    setNewRfp({ title: "", client: "", submissionDate: "", description: "" });

    toast({
      title: "RFP created",
      description: `${newEntry.id} added to your pipeline.`,
    });
  };

  return (
    <RequireAuth>
      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="RFP Management" subtitle="Track and manage all RFPs in your pipeline" />

          <main className="flex-1 overflow-y-auto p-6">
            <Suspense fallback={<Loading />}>
              <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Toolbar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search RFPs by ID, title, or client..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All ({statusCounts.all})</SelectItem>
                          <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
                          <SelectItem value="in-progress">
                            In Progress ({statusCounts["in-progress"]})
                          </SelectItem>
                          <SelectItem value="completed">Completed ({statusCounts.completed})</SelectItem>
                          <SelectItem value="submitted">Submitted ({statusCounts.submitted})</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Dialog open={isNewRFPOpen} onOpenChange={setIsNewRFPOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Get New RFP
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                      <DialogHeader>
                        <DialogTitle>Add New RFP</DialogTitle>
                        <DialogDescription>
                          Enter the RFP details or upload a PDF document.
                        </DialogDescription>
                      </DialogHeader>
                      {newRfpError && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                          {newRfpError}
                        </div>
                      )}
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="rfp-title">RFP Title</Label>
                          <Input
                            id="rfp-title"
                            placeholder="Enter RFP title"
                            value={newRfp.title}
                            onChange={(e) =>
                              setNewRfp((prev) => ({ ...prev, title: e.target.value }))
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="client">Client Name</Label>
                            <Input
                              id="client"
                              placeholder="Client name"
                              value={newRfp.client}
                              onChange={(e) =>
                                setNewRfp((prev) => ({ ...prev, client: e.target.value }))
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="due-date">Submission Date</Label>
                            <Input
                              id="due-date"
                              type="date"
                              value={newRfp.submissionDate}
                              onChange={(e) =>
                                setNewRfp((prev) => ({ ...prev, submissionDate: e.target.value }))
                              }
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Brief description of the RFP requirements"
                            rows={3}
                            value={newRfp.description}
                            onChange={(e) =>
                              setNewRfp((prev) => ({ ...prev, description: e.target.value }))
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="rfp-document">RFP Document (optional)</Label>
                          <div className="rounded-lg border border-border bg-secondary/40 p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                                <Upload className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">Attach a PDF</p>
                                <p className="text-xs text-muted-foreground">
                                  Use a clear, final version for best results.
                                </p>
                              </div>
                            </div>
                            <Input
                              id="rfp-document"
                              type="file"
                              accept="application/pdf"
                              className="bg-background"
                            />
                            <p className="text-xs text-muted-foreground mt-2">PDF only, up to 50MB.</p>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsNewRFPOpen(false);
                            setNewRfpError("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleCreateRFP}>Create RFP</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                  {[
                    { key: "all", label: "All RFPs" },
                    { key: "pending", label: "Pending" },
                    { key: "in-progress", label: "In Progress" },
                    { key: "completed", label: "Completed" },
                    { key: "submitted", label: "Submitted" },
                  ].map((tab) => (
                    <Button
                      key={tab.key}
                      variant={statusFilter === tab.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(tab.key)}
                    >
                      {tab.label}
                      <Badge variant="secondary" className="ml-2 bg-secondary/80">
                        {statusCounts[tab.key]}
                      </Badge>
                    </Button>
                  ))}
                </div>

                {filteredRFPs.length > 0 ? (
                  <RFPTable
                    rfps={filteredRFPs}
                    onView={handleViewRFP}
                    onProcess={handleProcessRFP}
                    onDownload={handleDownloadResponse}
                  />
                ) : (
                  <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No RFPs found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery
                        ? "Try adjusting your search or filters"
                        : "Get started by adding your first RFP"}
                    </p>
                    <Button onClick={() => setIsNewRFPOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New RFP
                    </Button>
                  </div>
                )}
              </div>
            </Suspense>
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
