// Mock data for UI development (replace with real API calls)

export const mockAgentStatus = {
  sales: {
    name: "Sales Agent",
    status: "active",
    lastActivity: "5 minutes ago",
    rfpsScanned: 128,
    rfpsIdentified: 23,
    currentTask: "Scanning BHEL tender portal",
  },
  technical: {
    name: "Technical Agent",
    status: "processing",
    lastActivity: "1 minute ago",
    specsMatched: 892,
    avgMatchScore: 87.5,
    currentTask: "Matching SKUs for RFP-2024-0892",
  },
  pricing: {
    name: "Pricing Agent",
    status: "idle",
    lastActivity: "15 minutes ago",
    quotesGenerated: 156,
    avgProcessingTime: "2.3 min",
    currentTask: null,
  },
};

export const mockRFPs = [
  {
    id: "RFP-2024-0892",
    title: "Power Cables Supply for Metro Rail Project",
    client: "DMRC",
    submissionDate: "2024-02-15",
    status: "in-progress",
    value: "₹4.5 Cr",
    matchScore: 92,
    products: 12,
  },
  {
    id: "RFP-2024-0891",
    title: "Industrial Wiring for Steel Plant Expansion",
    client: "Tata Steel",
    submissionDate: "2024-02-10",
    status: "completed",
    value: "₹2.8 Cr",
    matchScore: 88,
    products: 8,
  },
  {
    id: "RFP-2024-0890",
    title: "Control Cables for Refinery Automation",
    client: "Indian Oil Corporation",
    submissionDate: "2024-02-20",
    status: "pending",
    value: "₹6.2 Cr",
    matchScore: null,
    products: 15,
  },
  {
    id: "RFP-2024-0889",
    title: "LT Power Cables for Substation Project",
    client: "PowerGrid Corporation",
    submissionDate: "2024-01-28",
    status: "submitted",
    value: "₹3.1 Cr",
    matchScore: 95,
    products: 6,
  },
  {
    id: "RFP-2024-0888",
    title: "Fire Retardant Cables for Commercial Complex",
    client: "DLF Ltd",
    submissionDate: "2024-02-25",
    status: "pending",
    value: "₹1.9 Cr",
    matchScore: null,
    products: 10,
  },
];

export const mockWorkflowHistory = [
  {
    id: "WF-001",
    rfpId: "RFP-2024-0892",
    startTime: "2024-01-20 14:30",
    endTime: "2024-01-20 14:45",
    status: "completed",
    stages: [
      { name: "RFP Identification", status: "completed", duration: "2 min" },
      { name: "Technical Matching", status: "completed", duration: "8 min" },
      { name: "Pricing Calculation", status: "completed", duration: "3 min" },
      { name: "Response Generation", status: "completed", duration: "2 min" },
    ],
  },
  {
    id: "WF-002",
    rfpId: "RFP-2024-0891",
    startTime: "2024-01-19 10:15",
    endTime: "2024-01-19 10:32",
    status: "completed",
    stages: [
      { name: "RFP Identification", status: "completed", duration: "3 min" },
      { name: "Technical Matching", status: "completed", duration: "10 min" },
      { name: "Pricing Calculation", status: "completed", duration: "4 min" },
      { name: "Response Generation", status: "completed", duration: "2 min" },
    ],
  },
];

export const mockProducts = [
  {
    id: "SKU-001",
    name: "XLPE Power Cable 1.1kV",
    category: "Power Cables",
    specifications: {
      voltage: "1.1 kV",
      conductor: "Copper",
      insulation: "XLPE",
      armoring: "Steel Wire",
    },
    price: 450,
    unit: "per meter",
  },
  {
    id: "SKU-002",
    name: "Control Cable 16 Core",
    category: "Control Cables",
    specifications: {
      cores: 16,
      conductor: "Copper",
      insulation: "PVC",
      shielding: "Aluminum Foil",
    },
    price: 320,
    unit: "per meter",
  },
  {
    id: "SKU-003",
    name: "Fire Retardant Cable FR-LSH",
    category: "Safety Cables",
    specifications: {
      rating: "FR-LSH",
      conductor: "Copper",
      insulation: "XLPE",
      sheath: "LSZH",
    },
    price: 580,
    unit: "per meter",
  },
];

export const mockDashboardStats = {
  totalRFPs: 156,
  activeRFPs: 23,
  completedRFPs: 128,
  pendingRFPs: 5,
  avgResponseTime: "18 min",
  successRate: "87%",
  totalValue: "₹245 Cr",
  thisMonthRFPs: 12,
};

export const mockWebUrls = [
  { id: 1, url: "https://gem.gov.in/tenders", name: "GeM Portal", active: true },
  { id: 2, url: "https://eprocure.gov.in", name: "eProcure India", active: true },
  { id: 3, url: "https://bhel.com/tenders", name: "BHEL Tenders", active: true },
  { id: 4, url: "https://ntpc.co.in/tenders", name: "NTPC Tenders", active: false },
];
