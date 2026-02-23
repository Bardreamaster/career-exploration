"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, ImageIcon, Home, MessageSquare, ChevronDown } from "lucide-react";
import html2canvas from "html2canvas";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

interface CareerResultsProps {
  messages: Array<{ role: string; content: string }>;
  onHome: () => void;
}

export function CareerResults({ messages, onHome }: CareerResultsProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  // Extract the final profile from the last assistant message
  const getFinalProfile = () => {
    const assistantMessages = messages.filter((m) => m.role === "assistant");
    const lastMessage = assistantMessages[assistantMessages.length - 1];
    return lastMessage?.content || "";
  };

  const profile = getFinalProfile();

  // Parse profile into sections for the image export
  const parseProfileSections = (content: string) => {
    const sections: { title: string; content: string; icon: string }[] = [];

    const personalityMatch = content.match(
      /(?:职业人格画像|Career Personality Profile)[：:]*\s*([\s\S]*?)(?=(?:建议职业路径|Recommended Career|避坑指南|Pitfall|坚韧|Perseverance|执行方案|$))/i
    );
    const careerMatch = content.match(
      /(?:建议职业路径|Recommended Career Paths?)[：:]*\s*([\s\S]*?)(?=(?:避坑指南|Pitfall|坚韧|Perseverance|执行方案|$))/i
    );
    const pitfallMatch = content.match(
      /(?:避坑指南|Pitfall Guide)[：:]*\s*([\s\S]*?)(?=(?:坚韧|Perseverance|执行方案|$))/i
    );
    const perseveranceMatch = content.match(
      /(?:坚韧|Perseverance)[^：:]*[：:]*\s*([\s\S]*?)(?=(?:执行方案|$))/i
    );
    const planMatch = content.match(
      /(?:执行方案|Action Plan)[：:]*\s*([\s\S]*?)$/i
    );

    if (personalityMatch) sections.push({ title: "Career Personality Profile", content: personalityMatch[1].trim(), icon: "🎯" });
    if (careerMatch) sections.push({ title: "Recommended Career Paths", content: careerMatch[1].trim(), icon: "🚀" });
    if (pitfallMatch) sections.push({ title: "Pitfall Guide", content: pitfallMatch[1].trim(), icon: "⚠️" });
    if (perseveranceMatch) sections.push({ title: "Perseverance Traits", content: perseveranceMatch[1].trim(), icon: "💪" });
    if (planMatch) sections.push({ title: "Action Plan", content: planMatch[1].trim(), icon: "📋" });

    if (sections.length === 0) {
      sections.push({ title: "Your Career Profile", content: content, icon: "📋" });
    }
    return sections;
  };

  const sections = parseProfileSections(profile);

  const downloadAsMarkdown = () => {
    setExporting("md");
    let markdown = "# Career Exploration Results\n\n";
    markdown += `*Generated on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
    markdown += profile;

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "career-profile.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => setExporting(null), 5000);
  };

  const downloadChatHistory = () => {
    setExporting("chat");
    let markdown = "# Career Exploration Chat History\n\n";
    markdown += `*Generated on ${new Date().toLocaleDateString()}*\n\n---\n\n`;

    let questionNum = 0;
    messages.forEach((msg) => {
      if (msg.content === "开始职业探索") return;
      if (msg.role === "assistant") {
        questionNum++;
        markdown += `## AI (Round ${questionNum})\n\n`;
        markdown += `${msg.content}\n\n`;
      } else {
        markdown += `## Your Response\n\n`;
        markdown += `> ${msg.content}\n\n`;
      }
      markdown += "---\n\n";
    });

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "career-chat-history.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => setExporting(null), 5000);
  };

  const downloadAsImage = async () => {
    setExporting("img");

    try {
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position: absolute; left: -9999px; width: 850px; height: 1200px; border: none;";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Could not access iframe document");

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

      await new Promise((resolve) => setTimeout(resolve, 1000));

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

    setTimeout(() => setExporting(null), 5000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Button
            variant="ghost"
            onClick={onHome}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center gap-2" disabled={exporting !== null}>
                <Download className="h-4 w-4" />
                {exporting ? "Exporting..." : "Export"}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={downloadAsMarkdown} className="flex items-center gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                Export Report (MD)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadChatHistory} className="flex items-center gap-2 cursor-pointer">
                <MessageSquare className="h-4 w-4" />
                Export Chat History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadAsImage} className="flex items-center gap-2 cursor-pointer">
                <ImageIcon className="h-4 w-4" />
                Export as Image
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Results Display */}
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Poster Preview */}
        <div
          ref={posterRef}
          className="overflow-hidden rounded-2xl bg-card shadow-lg"
        >
          {/* Poster Header */}
          <div className="bg-primary px-6 py-8 text-center text-primary-foreground sm:px-8 sm:py-10">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/20 sm:h-16 sm:w-16">
              <Download className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <h1 className="text-balance text-2xl font-bold sm:text-3xl">
              Your Career Profile
            </h1>
            <p className="mt-2 text-sm text-primary-foreground/80 sm:text-base">
              Career Exploration Assessment Results
            </p>
          </div>

          {/* Rendered Markdown Profile */}
          <div className="p-4 sm:p-8">
            <div className="prose prose-sm max-w-none sm:prose-base [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:my-2 [&_p]:leading-relaxed [&_p]:text-foreground/80 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1 [&_li]:text-foreground/80 [&_strong]:text-foreground [&_hr]:my-6 [&_hr]:border-border">
              <ReactMarkdown
                remarkPlugins={[remarkBreaks]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="flex items-center gap-3 text-xl font-bold text-foreground">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-semibold text-foreground">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm leading-relaxed text-foreground/80 sm:text-base">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 text-sm sm:text-base">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 text-sm sm:text-base">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm text-foreground/80 sm:text-base">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">{children}</strong>
                  ),
                  hr: () => <hr className="my-6 border-border" />,
                }}
              >
                {profile}
              </ReactMarkdown>
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
        {/* Buy Me a Coffee & V0 Attribution */}
        <div className="mt-8 flex flex-col items-center gap-4 pb-6">
          <a href="https://www.buymeacoffee.com/changshan" target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
              alt="Buy Me A Coffee"
              style={{ height: "60px", width: "217px" }}
            />
          </a>
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
