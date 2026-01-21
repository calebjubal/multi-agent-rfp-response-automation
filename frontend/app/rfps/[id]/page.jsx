"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import RequireAuth from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Play,
  Download,
  FileText,
  Calendar,
  Building,
  Package,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { mockRFPs, mockProducts } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";

const workflowStages = [
  { id: 1, name: "RFP Identification", status: "completed" },
  { id: 2, name: "Technical Matching", status: "completed" },
  { id: 3, name: "Pricing Calculation", status: "in-progress" },
  { id: 4, name: "Response Generation", status: "pending" },
];

const matchedProducts = [
  {
    rfpItem: "1.1 kV XLPE Power Cable - 3C x 120 sqmm",
    recommendations: [
      { sku: "SKU-001", name: "XLPE Cable 1.1kV 3C120", matchScore: 95, price: "₹485/m" },
      { sku: "SKU-002", name: "XLPE Cable 1.1kV 3C120A", matchScore: 88, price: "₹465/m" },
      { sku: "SKU-003", name: "XLPE Cable 1.1kV 3C125", matchScore: 82, price: "₹510/m" },
    ],
    selected: "SKU-001",
  },
  {
    rfpItem: "Control Cable 16 Core - 1.5 sqmm",
    recommendations: [
      { sku: "SKU-101", name: "Control Cable 16C 1.5", matchScore: 92, price: "₹320/m" },
      { sku: "SKU-102", name: "Control Cable 16C 2.5", matchScore: 78, price: "₹385/m" },
      { sku: "SKU-103", name: "Control Cable 12C 1.5", matchScore: 72, price: "₹280/m" },
    ],
    selected: "SKU-101",
  },
];

export default function RFPDetailPage() {
  const params = useParams();
  const rfpId = params.id;

  const rfp = mockRFPs.find((r) => r.id === rfpId) || {
    id: rfpId,
    title: "Power Cables Supply for Metro Rail Project",
    client: "DMRC",
    submissionDate: "2024-02-15",
    status: "in-progress",
    value: "₹4.5 Cr",
    matchScore: 92,
    products: 12,
  };

  const [activeTab, setActiveTab] = useState("overview");
  const [rfpStatus, setRfpStatus] = useState(rfp.status);

  const handleStartProcessing = () => {
    setRfpStatus("in-progress");
    toast({
      title: "Processing started",
      description: `RFP ${rfp.id} moved to In Progress.`,
    });
  };

  const handleDownloadResponse = () => {
    toast({
      title: "Download",
      description: `Preparing response for ${rfp.id}...`,
    });
  };

  const getStageIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-warning animate-pulse" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <RequireAuth>
      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={rfp.title} subtitle={`Client: ${rfp.client}`} />

          <main className="flex-1 overflow-y-auto p-6">
            {/* Back Button & Actions */}
            <div className="flex items-center justify-between mb-6">
              <Link href="/rfps">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to RFPs
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                {rfpStatus === "pending" && (
                  <Button onClick={handleStartProcessing}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Processing
                  </Button>
                )}
                {(rfpStatus === "completed" || rfpStatus === "submitted") && (
                  <Button onClick={handleDownloadResponse}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Response
                  </Button>
                )}
              </div>
            </div>

          {/* RFP Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <Building className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{rfp.client}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium">{rfp.submissionDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Value</p>
                    <p className="font-medium">{rfp.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Products</p>
                    <p className="font-medium">{rfp.products} items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Progress */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Processing Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {workflowStages.map((stage, index) => (
                  <div key={stage.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      {getStageIcon(stage.status)}
                      <span className="text-xs mt-2 text-center">{stage.name}</span>
                    </div>
                    {index < workflowStages.length - 1 && (
                      <div className="h-0.5 flex-1 mx-2 bg-border">
                        <div
                          className={`h-full transition-all ${
                            stage.status === "completed"
                              ? "bg-success w-full"
                              : stage.status === "in-progress"
                              ? "bg-warning w-1/2"
                              : "w-0"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="technical">Technical Matching</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="response">Response</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">RFP Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Scope of Supply</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>- 1.1 kV XLPE Power Cables (various sizes)</li>
                        <li>- Control Cables (16, 24, 37 core)</li>
                        <li>- Fire Retardant Cables (FR-LSH)</li>
                        <li>- Instrumentation Cables</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Testing Requirements</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>- Type Testing as per IS standards</li>
                        <li>- Factory Acceptance Test (FAT)</li>
                        <li>- Site Acceptance Test (SAT)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technical">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Product SKU Matching</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {matchedProducts.map((item, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <h4 className="font-medium mb-3">{item.rfpItem}</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left py-2 px-3">SKU</th>
                                <th className="text-left py-2 px-3">Product Name</th>
                                <th className="text-left py-2 px-3">Match Score</th>
                                <th className="text-left py-2 px-3">Price</th>
                                <th className="text-left py-2 px-3">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.recommendations.map((rec) => (
                                <tr
                                  key={rec.sku}
                                  className="border-b border-border last:border-0"
                                >
                                  <td className="py-2 px-3 font-mono text-primary">
                                    {rec.sku}
                                  </td>
                                  <td className="py-2 px-3">{rec.name}</td>
                                  <td className="py-2 px-3">
                                    <div className="flex items-center gap-2">
                                      <Progress value={rec.matchScore} className="w-16 h-2" />
                                      <span>{rec.matchScore}%</span>
                                    </div>
                                  </td>
                                  <td className="py-2 px-3">{rec.price}</td>
                                  <td className="py-2 px-3">
                                    {item.selected === rec.sku ? (
                                      <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                                        Selected
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary">Alternative</Badge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pricing Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Material Cost</p>
                        <p className="text-2xl font-semibold">₹3.8 Cr</p>
                      </div>
                      <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Testing Cost</p>
                        <p className="text-2xl font-semibold">₹45 L</p>
                      </div>
                      <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Quote</p>
                        <p className="text-2xl font-semibold text-primary">₹4.25 Cr</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="response">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Generated Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-secondary rounded-lg text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Response will be generated after pricing is complete.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
