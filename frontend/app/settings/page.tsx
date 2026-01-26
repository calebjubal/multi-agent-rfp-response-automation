"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import RequireAuth from "@/components/auth/RequireAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Globe,
  Key,
  Database,
  Bot,
  Plus,
  Trash2,
  Save,
  TestTube,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { mockWebUrls } from "@/lib/mock-data";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [webUrls, setWebUrls] = useState(mockWebUrls);
  const [newUrl, setNewUrl] = useState({ name: "", url: "" });
  const [actionLoading, setActionLoading] = useState("");

  const runAction = async (key, title, description) => {
    setActionLoading(key);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setActionLoading("");
    toast({ title, description });
  };

  const addWebUrl = () => {
    if (newUrl.name && newUrl.url) {
      setWebUrls([
        ...webUrls,
        { id: Date.now(), ...newUrl, active: true },
      ]);
      setNewUrl({ name: "", url: "" });
    }
  };

  const removeWebUrl = (id) => {
    setWebUrls(webUrls.filter((u) => u.id !== id));
  };

  const toggleWebUrl = (id) => {
    setWebUrls(
      webUrls.map((u) =>
        u.id === id ? { ...u, active: !u.active } : u
      )
    );
  };

  return (
    <RequireAuth>
      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            title="Settings"
            subtitle="Configure system and agent settings"
          />

          <main className="flex-1 overflow-y-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="web-urls">Web URLs</TabsTrigger>
                <TabsTrigger value="api">API Keys</TabsTrigger>
                <TabsTrigger value="agents">Agent Config</TabsTrigger>
                <TabsTrigger value="database">Database</TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Application Settings</CardTitle>
                      <CardDescription>
                        General application configuration
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="app-name">Application Name</Label>
                          <Input
                            id="app-name"
                            defaultValue="RFP Agent System"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timezone">Timezone</Label>
                          <Select defaultValue="ist">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ist">IST (India)</SelectItem>
                              <SelectItem value="utc">UTC</SelectItem>
                              <SelectItem value="est">EST (US)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                    <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium">Auto-process New RFPs</p>
                        <p className="text-sm text-muted-foreground">
                          Automatically start processing when new RFPs are identified
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Send email alerts for completed RFPs
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Web URLs */}
            <TabsContent value="web-urls">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      RFP Source URLs
                    </CardTitle>
                    <CardDescription>
                      Configure websites for the Sales Agent to scan for RFPs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add New URL */}
                    <div className="flex items-end gap-3 p-4 bg-secondary rounded-lg">
                      <div className="flex-1 space-y-2">
                        <Label>Portal Name</Label>
                        <Input
                          placeholder="e.g., GeM Portal"
                          value={newUrl.name}
                          onChange={(e) =>
                            setNewUrl({ ...newUrl, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>URL</Label>
                        <Input
                          placeholder="https://..."
                          value={newUrl.url}
                          onChange={(e) =>
                            setNewUrl({ ...newUrl, url: e.target.value })
                          }
                        />
                      </div>
                      <Button onClick={addWebUrl}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>

                    {/* URL List */}
                    <div className="space-y-2">
                      {webUrls.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <Switch
                              checked={item.active}
                              onCheckedChange={() => toggleWebUrl(item.id)}
                            />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground font-mono">
                                {item.url}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={item.active ? "default" : "secondary"}
                              className={item.active ? "bg-success/20 text-success" : ""}
                            >
                              {item.active ? "Active" : "Inactive"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => removeWebUrl(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* API Keys */}
            <TabsContent value="api">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      API Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure API keys for external services
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="openai-key">OpenAI API Key</Label>
                      <div className="flex gap-3">
                        <Input
                          id="openai-key"
                          type="password"
                          defaultValue="sk-..."
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={() =>
                            runAction(
                              "test-openai",
                              "Testing OpenAI key",
                              "Attempting a quick connectivity check..."
                            )
                          }
                          disabled={actionLoading === "test-openai"}
                        >
                          {actionLoading === "test-openai" ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <TestTube className="w-4 h-4 mr-2" />
                          )}
                          Test
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Used for LLM-powered agent processing
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="chroma-url">ChromaDB URL</Label>
                      <div className="flex gap-3">
                        <Input
                          id="chroma-url"
                          defaultValue="http://localhost:8000"
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={() =>
                            runAction(
                              "test-chroma",
                              "Testing ChromaDB URL",
                              "Checking if the service is reachable..."
                            )
                          }
                          disabled={actionLoading === "test-chroma"}
                        >
                          {actionLoading === "test-chroma" ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <TestTube className="w-4 h-4 mr-2" />
                          )}
                          Test
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-secondary rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-success" />
                          <div>
                            <p className="font-medium">Backend API</p>
                            <p className="text-sm text-muted-foreground">
                              http://localhost:3001
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-success/20 text-success">Connected</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    onClick={() =>
                      runAction(
                        "save-api",
                        "Saved",
                        "API configuration saved successfully."
                      )
                    }
                    disabled={actionLoading === "save-api"}
                  >
                    {actionLoading === "save-api" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save API Keys
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Agent Config */}
            <TabsContent value="agents">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bot className="w-5 h-5" />
                      Agent Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure LLM parameters for each agent
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {["Sales Agent", "Technical Agent", "Pricing Agent"].map(
                      (agent) => (
                        <div key={agent} className="p-4 border border-border rounded-lg">
                          <h4 className="font-medium mb-4">{agent}</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Model</Label>
                              <Select defaultValue="gpt-4-turbo">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Temperature</Label>
                              <Input type="number" defaultValue="0.7" step="0.1" min="0" max="2" />
                            </div>
                            <div className="space-y-2">
                              <Label>Max Tokens</Label>
                              <Input type="number" defaultValue="4096" />
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    onClick={() =>
                      runAction(
                        "save-agents",
                        "Saved",
                        "Agent configuration saved successfully."
                      )
                    }
                    disabled={actionLoading === "save-agents"}
                  >
                    {actionLoading === "save-agents" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Agent Config
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Database */}
            <TabsContent value="database">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Database Connection
                    </CardTitle>
                    <CardDescription>
                      MongoDB connection settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mongo-uri">MongoDB Connection URI</Label>
                      <Input
                        id="mongo-uri"
                        type="password"
                        defaultValue="mongodb://localhost:27017/rfp-agent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Database Name</Label>
                        <Input defaultValue="rfp-agent" />
                      </div>
                      <div className="space-y-2">
                        <Label>Connection Pool Size</Label>
                        <Input type="number" defaultValue="10" />
                      </div>
                    </div>

                    <div className="p-4 bg-secondary rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-success" />
                          <div>
                            <p className="font-medium">Connection Status</p>
                            <p className="text-sm text-muted-foreground">
                              Connected to MongoDB
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <TestTube className="w-4 h-4 mr-2" />
                          Test Connection
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Data Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Export All Data</p>
                        <p className="text-sm text-muted-foreground">
                          Download all RFPs, products, and history as JSON
                        </p>
                      </div>
                      <Button variant="outline">Export</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg">
                      <div>
                        <p className="font-medium text-destructive">Clear All Data</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete all data (cannot be undone)
                        </p>
                      </div>
                      <Button variant="destructive">Clear Data</Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Database Settings
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
