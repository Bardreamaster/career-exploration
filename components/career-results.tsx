"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileText, ImageIcon, ArrowLeft, Check, Home, MessageSquare } from "lucide-react";
import html2canvas from "html2canvas";

interface CareerResultsProps {
  messages: Array<{ role: string; content: string }>;
  onHome: () => void;
}

export function CareerResults({ messages, onHome }: CareerResultsProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [downloadingMd, setDownloadingMd] = useState(false);
  const [downloadingImg, setDownloadingImg] = useState(false);
  const [downloadingChat, setDownloadingChat] = useState(false);

  // Extract the final profile from the last assistant message
  const getFinalProfile = () => {
    const assistantMessages = messages.filter((m) => m.role === "assistant");
    const lastMessage = assistantMessages[assistantMessages.length - 1];
    return lastMessage?.content || "";
  };

  const profile = getFinalProfile();

  // Parse profile sections
  const parseProfile = (content: string) => {
    const sections: {
      title: string;
      content: string;
      icon: string;
    }[] = [];

    // Try to extract sections
    const personalityMatch = content.match(
      /(?:职业人格画像|Career Personality Profile)[：:]*\s*([\s\S]*?)(?=(?:建议职业路径|Recommended Career|避坑指南|Pitfall|坚韧|Perseverance|$))/i
    );
    const careerMatch = content.match(
      /(?:建议职业路径|Recommended Career Paths?)[：:]*\s*([\s\S]*?)(?=(?:避坑指南|Pitfall|坚韧|Perseverance|$))/i
    );
    const pitfallMatch = content.match(
      /(?:避坑指南|Pitfall Guide)[：:]*\s*([\s\S]*?)(?=(?:坚韧|Perseverance|$))/i
    );
    const perseveranceMatch = content.match(
      /(?:坚韧|Perseverance)[^：:]*[：:]*\s*([\s\S]*?)$/i
    );

    if (personalityMatch) {
      sections.push({
        title: "Career Personality Profile",
        content: personalityMatch[1].trim(),
        icon: "🎯",
      });
    }

    if (careerMatch) {
      sections.push({
        title: "Recommended Career Paths",
        content: careerMatch[1].trim(),
        icon: "🚀",
      });
    }

    if (pitfallMatch) {
      sections.push({
        title: "Pitfall Guide",
        content: pitfallMatch[1].trim(),
        icon: "⚠️",
      });
    }

    if (perseveranceMatch) {
      sections.push({
        title: "Perseverance Traits",
        content: perseveranceMatch[1].trim(),
        icon: "💪",
      });
    }

    // If no sections found, return the full content
    if (sections.length === 0) {
      sections.push({
        title: "Your Career Profile",
        content: content,
        icon: "📋",
      });
    }

    return sections;
  };

  const sections = parseProfile(profile);

  const downloadAsMarkdown = () => {
    setDownloadingMd(true);

    // Build markdown content for final profile only
    let markdown = "# Career Exploration Results\n\n";
    markdown += `*Generated on ${new Date().toLocaleDateString()}*\n\n`;
    markdown += "---\n\n";

    // Add final profile section
    markdown += "## Final Career Profile\n\n";
    sections.forEach((section) => {
      markdown += `### ${section.icon} ${section.title}\n\n`;
      markdown += `${section.content}\n\n`;
    });

    // Create and download file
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "career-profile.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => setDownloadingMd(false), 1000);
  };

  const downloadChatHistory = () => {
    setDownloadingChat(true);

    // Build markdown content from all messages
    let markdown = "# Career Exploration Chat History\n\n";
    markdown += `*Generated on ${new Date().toLocaleDateString()}*\n\n`;
    markdown += "---\n\n";

    let questionNum = 0;
    messages.forEach((msg) => {
      if (msg.content === "开始职业探索") return;
      if (msg.role === "assistant") {
        questionNum++;
        markdown += `## AI (Question ${questionNum})\n\n`;
        markdown += `${msg.content}\n\n`;
      } else {
        markdown += `## Your Response\n\n`;
        markdown += `> ${msg.content}\n\n`;
      }
      markdown += "---\n\n";
    });

    // Create and download file
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "career-chat-history.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => setDownloadingChat(false), 1000);
  };

  const downloadAsImage = async () => {
    setDownloadingImg(true);

    try {
      // Create an iframe to completely isolate from document styles
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position: absolute; left: -9999px; width: 850px; height: 1200px; border: none;";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Could not access iframe document");

      // Write clean HTML with only hex colors (no oklch)
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; background: #ffffff; }
          </style>
        </head>
        <body>
          <div id="poster" style="width: 800px; background: #ffffff; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #4a6fa5 0%, #3d5a80 100%); padding: 48px 32px; text-align: center; color: #ffffff;">
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 50%; margin-bottom: 16px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 8px 0; color: #ffffff;">Your Career Profile</h1>
              <p style="font-size: 14px; opacity: 0.85; margin: 0; color: #ffffff;">Career Exploration Assessment Results</p>
            </div>
            <div style="padding: 32px; background: #ffffff;">
              ${sections
                .map(
                  (section) => `
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px; overflow: hidden;">
                  <div style="background: #f1f5f9; padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <h2 style="font-size: 16px; font-weight: 600; margin: 0; color: #1e293b; display: flex; align-items: center; gap: 12px;">
                      <span style="font-size: 24px;">${section.icon}</span>
                      ${section.title}
                    </h2>
                  </div>
                  <div style="padding: 16px 20px;">
                    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0; white-space: pre-wrap;">${section.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                  </div>
                </div>
              `
                )
                .join("")}
              <div style="border-top: 1px solid #e2e8f0; padding: 24px 0 0 0; text-align: center;">
                <p style="font-size: 13px; color: #64748b; margin: 0 0 4px 0;">Generated by Career Explorer AI</p>
                <p style="font-size: 11px; color: #94a3b8; margin: 0;">${new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
      iframeDoc.close();

      // Wait for iframe to render
      await new Promise((resolve) => setTimeout(resolve, 100));

      const poster = iframeDoc.getElementById("poster");
      if (!poster) throw new Error("Could not find poster element");

      const canvas = await html2canvas(poster, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });

      document.body.removeChild(iframe);

      const link = document.createElement("a");
      link.download = "career-profile.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    }

    setTimeout(() => setDownloadingImg(false), 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={onHome}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              onClick={downloadChatHistory}
              disabled={downloadingChat}
              className="flex items-center gap-2 bg-transparent"
            >
              {downloadingChat ? (
                <Check className="h-4 w-4 text-accent" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              导出对话
            </Button>
            <Button
              variant="outline"
              onClick={downloadAsMarkdown}
              disabled={downloadingMd}
              className="flex items-center gap-2 bg-transparent"
            >
              {downloadingMd ? (
                <Check className="h-4 w-4 text-accent" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              导出报告
            </Button>
            <Button
              onClick={downloadAsImage}
              disabled={downloadingImg}
              className="flex items-center gap-2"
            >
              {downloadingImg ? (
                <Check className="h-4 w-4" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
              导出海报
            </Button>
          </div>
        </div>
      </header>

      {/* Results Display */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Poster Preview */}
        <div
          ref={posterRef}
          className="overflow-hidden rounded-2xl bg-card shadow-lg"
        >
          {/* Poster Header */}
          <div className="bg-primary px-8 py-10 text-center text-primary-foreground">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20">
              <Download className="h-8 w-8" />
            </div>
            <h1 className="text-balance text-3xl font-bold">
              Your Career Profile
            </h1>
            <p className="mt-2 text-primary-foreground/80">
              Career Exploration Assessment Results
            </p>
          </div>

          {/* Sections */}
          <div className="p-8">
            <div className="grid gap-6">
              {sections.map((section, index) => (
                <Card
                  key={index}
                  className="overflow-hidden border-border bg-secondary/30"
                >
                  <div className="border-b border-border bg-secondary/50 px-6 py-4">
                    <h2 className="flex items-center gap-3 text-lg font-semibold text-foreground">
                      <span className="text-2xl">{section.icon}</span>
                      {section.title}
                    </h2>
                  </div>
                  <div className="px-6 py-4">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                      {section.content}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-8 border-t border-border pt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Generated by Career Explorer AI
              </p>
              <p className="text-xs text-muted-foreground/60">
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* V0 Attribution */}
        <div className="mt-8 text-center">
          <a
            href="https://v0.app/ref/1L7MKB"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground/70 hover:text-primary hover:underline"
          >
            使用V0创建你自己的应用
          </a>
        </div>
      </main>
    </div>
  );
}
