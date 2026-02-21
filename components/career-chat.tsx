"use client";

import React from "react";
import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Send, Home, Sparkles, FileCheck, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

interface CareerChatProps {
  onComplete: (messages: Array<{ role: string; content: string }>) => void;
  onHome: () => void;
}

export function CareerChat({ onComplete, onHome }: CareerChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const { messages, sendMessage, status, setMessages, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    initialMessages: [],
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track question count and detect completion
  useEffect(() => {
    const assistantMessages = messages.filter((m) => m.role === "assistant");
    const userMessages = messages.filter((m) => {
      const content = m.parts
        .filter((p) => p.type === "text")
        .map((p) => (p as { type: "text"; text: string }).text)
        .join("");
      return m.role === "user" && content !== "开始职业探索";
    });
    const latestAssistant = assistantMessages[assistantMessages.length - 1];

    if (latestAssistant) {
      // Count questions by looking for question patterns
      const content = messages
        .filter((m) => m.role === "assistant")
        .map((m) =>
          m.parts
            .filter((p) => p.type === "text")
            .map((p) => (p as { type: "text"; text: string }).text)
            .join("")
        )
        .join("");

      const questionMatches = content.match(/Question\s+(\d+)\/10/gi);
      if (questionMatches) {
        const lastMatch = questionMatches[questionMatches.length - 1];
        const num = parseInt(lastMatch.match(/\d+/)?.[0] || "0");
        setQuestionCount(num);
      }

      // Check if final profile is complete
      // User must have answered 10 questions AND AI must have generated the final profile
      const lastContent = latestAssistant.parts
        .filter((p) => p.type === "text")
        .map((p) => (p as { type: "text"; text: string }).text)
        .join("");

      const hasProfileContent =
        lastContent.includes("职业人格画像") ||
        lastContent.includes("Career Personality") ||
        lastContent.includes("建议职业路径") ||
        lastContent.includes("Recommended Career") ||
        lastContent.includes("执行方案");

      // Only mark complete when user has answered 10 questions AND final profile is generated AND streaming is done
      if (assistantMessages.length >= 11 && hasProfileContent && status === "ready") {
        setIsComplete(true);
      }
    }
  }, [messages, questionCount, onComplete, status]);

  // Start conversation only once when component mounts
  useEffect(() => {
    if (!hasInitialized && status === "ready") {
      setHasInitialized(true);
      sendMessage({ text: "开始职业探索" });
    }
  }, [hasInitialized, status, sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== "ready") return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleRestart = () => {
    setMessages([]);
    setQuestionCount(0);
    setIsComplete(false);
    setTimeout(() => {
      sendMessage({ text: "开始职业探索" });
    }, 100);
  };

  const handleViewResults = () => {
    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.parts
        .filter((p) => p.type === "text")
        .map((p) => (p as { type: "text"; text: string }).text)
        .join(""),
    }));
    onComplete(formattedMessages);
  };

  const getTextFromParts = (parts: Array<{ type: string; text?: string }>) => {
    return parts
      .filter((p) => p.type === "text")
      .map((p) => p.text || "")
      .join("");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Progress indicator */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Progress
            </span>
            <span className="text-sm font-semibold text-foreground">
              {Math.min(questionCount, 10)}/10 Questions
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(Math.min(questionCount, 10) / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages
            .filter((m) => m.role !== "user" || m.parts.length > 0)
            .map((message, index) => {
              // Skip the initial trigger message
              const content = getTextFromParts(
                message.parts as Array<{ type: string; text?: string }>
              );
              if (message.role === "user" && content === "开始职业探索") {
                return null;
              }

              return (
                <div
                  key={message.id || index}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <Card
                    className={cn(
                      "max-w-[85%] px-4 py-3 shadow-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "border-border bg-card"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          Career Explorer
                        </span>
                      </div>
                    )}
                    <div
                      className={cn(
                        "prose prose-sm max-w-none",
                        message.role === "user"
                          ? "prose-invert [&_p]:text-primary-foreground [&_strong]:text-primary-foreground"
                          : "prose-slate [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-2 [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5"
                      )}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkBreaks]}
                        components={{
                          p: ({ children }) => <p className="text-sm leading-relaxed">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc pl-4 text-sm">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 text-sm">{children}</ol>,
                          li: ({ children }) => <li className="text-sm">{children}</li>,
                          h1: ({ children }) => <h1 className="text-lg font-bold mt-3 mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-semibold mt-3 mb-1.5">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                    </div>
                  </Card>
                </div>
              );
            })}

          {status === "streaming" && (
            <div className="flex justify-start">
              <Card className="border-border bg-card px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Thinking...
                  </span>
                </div>
              </Card>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <Card className="border-destructive/50 bg-destructive/10 px-4 py-3 shadow-sm">
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-sm text-destructive">
                    Connection error. Please try again.
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRestart}
                    className="mt-1 bg-transparent"
                  >
                    <RotateCcw className="mr-2 h-3 w-3" />
                    Restart
                  </Button>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-card px-4 py-4">
        <div className="mx-auto max-w-2xl">
          {isComplete && (
            <div className="mb-3 flex items-center justify-center">
              <Button
                onClick={handleViewResults}
                className="flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <FileCheck className="h-4 w-4" />
                查看你的职业探索报告
              </Button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={isComplete ? "END" : "Type your response..."}
                disabled={isComplete || status !== "ready" } 
              />
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || status !== "ready"}
              className="h-12 w-12 shrink-0 rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onHome}
              className="h-12 w-12 shrink-0 rounded-xl bg-transparent"
              title="Back to Home"
            >
              <Home className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
