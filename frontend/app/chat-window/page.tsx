"use client";

import RequireAuth from "@/components/auth/RequireAuth";
import ChatInterface from "../chat/ChatInterface";

export default function ChatWindowPage() {
  return (
    <RequireAuth>
      <ChatInterface />
    </RequireAuth>
  );
}
