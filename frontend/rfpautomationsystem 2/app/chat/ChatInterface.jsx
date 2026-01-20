"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./ChatInterface.module.css";

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        message:
          "👋 Hi! I'm your RFP Assistant. I can help you scan tenders from tendersontime.com, analyze products, and generate pricing.\n\nTry: \"Scan for cable RFPs\" or \"Complete workflow for electrical tenders\"",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      message: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userInput,
          session_id: sessionId,
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          message: data.response,
          timestamp: data.timestamp,
          workflow_state: data.workflow_state,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          message: "❌ Error: Failed to process message. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { label: "🔍 Scan RFPs", message: "Scan for cable and wire RFPs" },
    { label: "⚡ Full Workflow", message: "Complete workflow for electrical tenders" },
    { label: "📊 Show Status", message: "Show me the current status" },
    { label: "💰 Pricing", message: "Calculate pricing for selected RFP" },
  ];

  return (
    <div className={styles.chatInterface}>
      <header className={styles.chatHeader}>
        <div>
          <h1>💬 Chat Assistant</h1>
          <p>AI-powered RFP automation conversation</p>
        </div>
        <div className={styles.sessionInfo}>
          <span className={styles.sessionBadge}>Session: {sessionId.slice(-8)}</span>
        </div>
      </header>

      <div className={styles.chatMessages}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.message} ${msg.role === "user" ? styles.user : styles.assistant}`}>
            <div className={styles.messageAvatar}>{msg.role === "user" ? "👤" : "🤖"}</div>
            <div className={styles.messageContent}>
              <div className={styles.messageText}>
                {msg.message.split("\n").map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < msg.message.split("\n").length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
              <div className={styles.messageTime}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.messageAvatar}>🤖</div>
            <div className={styles.messageContent}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.quickActionsBar}>
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            className={styles.quickActionBtn}
            onClick={() => {
              setInput(action.message);
              setTimeout(() => sendMessage(), 100);
            }}
            type="button"
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className={styles.chatInputContainer}>
        <textarea
          className={styles.chatInput}
          placeholder="Type your message... (e.g., 'Scan for cable RFPs')"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          rows={2}
        />
        <button className={styles.sendBtn} onClick={sendMessage} disabled={loading || !input.trim()} type="button">
          {loading ? "⏳" : "📤"}
        </button>
      </div>
    </div>
  );
}
