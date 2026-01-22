"use client";

import { useState, useCallback } from "react";
import { CareerChat } from "@/components/career-chat";
import { CareerResults } from "@/components/career-results";
import { Compass, ArrowRight, Clock, Target, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  const [hasStarted, setHasStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [completedMessages, setCompletedMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);

  const handleComplete = useCallback(
    (messages: Array<{ role: string; content: string }>) => {
      setCompletedMessages(messages);
      setShowResults(true);
    },
    []
  );

  const handleBackToChat = () => {
    setShowResults(false);
  };

  const handleStart = () => {
    setHasStarted(true);
  };

  const handleBackToHome = () => {
    setHasStarted(false);
    setShowResults(false);
    setCompletedMessages([]);
  };

  if (showResults && completedMessages.length > 0) {
    return (
      <CareerResults messages={completedMessages} onBack={handleBackToChat} onHome={handleBackToHome} />
    );
  }

  // Welcome / Instructions Screen
  if (!hasStarted) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Compass className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Career Explorer
                </h1>
                <p className="text-xs text-muted-foreground">
                  Discover your ideal career path
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Welcome Content */}
        <main className="flex-1 px-4 py-8">
          <div className="mx-auto max-w-2xl">
            {/* Hero Section */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mb-3 text-2xl font-bold text-foreground">
                {/* TODO: 在这里添加标题文案 */}
                AI 职业生涯探索测试
              </h2>
              <p className="text-muted-foreground">
                {/* TODO: 在这里添加副标题文案 */}
                与AI对话 探索你理想的职业路径
              </p>
            </div>

            {/* Instructions Card */}
            <Card className="mb-6 border-border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                {/* TODO: 在这里添加说明标题 */}
                使用指南
              </h3>
              <div className="space-y-4">
                {/* Instruction Item 1 */}
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      {/* TODO: 在这里添加步骤1标题 */}
                      第一步: 回答AI的问题
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {/* TODO: 在这里添加步骤1说明 */}
                      AI会问你10个有关职业兴趣取向的问题，你可以给出自由的回答
                    </p>
                  </div>
                </div>

                {/* Instruction Item 2 */}
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      {/* TODO: 在这里添加步骤2标题 */}
                      第二步：查看职业探索总结
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {/* TODO: 在这里添加步骤2说明 */}
                      回答完全部问题后，查看专为你生成的个性化分析报告
                    </p>
                  </div>
                </div>

                {/* Instruction Item 3 */}
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      {/* TODO: 在这里添加步骤3标题 */}
                      第三步：导出和分享
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {/* TODO: 在这里添加步骤3说明 */}
                      下载结果报告的Markdown文档。
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Time Estimate */}
            <div className="mb-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {/* TODO: 在这里添加时间预估文案 */}
                预估耗时: 10-15 分钟
              </span>
            </div>

            {/* Start Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleStart}
                size="lg"
                className="gap-2 px-8 py-6 text-base"
              >
                {/* TODO: 在这里修改按钮文案 */}
                开始职业探索
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Additional Notes */}
            <div className="mt-8 rounded-lg bg-muted/50 p-4">
              <p className="text-center text-xs text-muted-foreground">
                {/* TODO: 在这里添加底部说明文案 */}
                您的回答只会用于生成此报告，不会被记录下来. 因此中途退出会丢失原有进度.
              </p>
            </div>

            {/* V0 Attribution */}
            <div className="mt-6 text-center">
              <a
                href="https://v0.app/ref/1L7MKB"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground/70 hover:text-primary hover:underline"
              >
                使用V0创建你自己的应用
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Compass className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Career Explorer
              </h1>
              <p className="text-xs text-muted-foreground">
                Discover your ideal career path
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-hidden">
        <CareerChat onComplete={handleComplete} onHome={handleBackToHome} />
      </main>
    </div>
  );
}
