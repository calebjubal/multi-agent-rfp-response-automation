"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import RequireAuth from "@/components/auth/RequireAuth";
import ChatInterface from "./ChatInterface";

export default function ChatPage() {
  return (
    <RequireAuth>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Chat Assistant" subtitle="AI-powered RFP automation conversation" />
          <main className="flex-1 overflow-hidden">
            <ChatInterface />
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
