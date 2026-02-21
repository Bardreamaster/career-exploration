"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CareerChat } from "@/components/career-chat";
import { CareerResults } from "@/components/career-results";
import { Compass, ArrowRight, Clock, Target, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Sample data for debug/preview mode
const DEBUG_MESSAGES = [
  { role: "assistant", content: "### Question 1/10\n\nWelcome! Let's explore your career path. What activities or tasks make you feel most energized and engaged?" },
  { role: "user", content: "I love solving complex problems and building things from scratch. I also enjoy writing and explaining ideas to others." },
  { role: "assistant", content: "### Question 2/10\n\nInteresting! When you think about your ideal workday, what does it look like?" },
  { role: "user", content: "A mix of collaborative discussions and focused solo work. I'd like some flexibility in schedule." },
  { role: "assistant", content: "### Question 3/10\n\nWhat kind of environment do you thrive in?" },
  { role: "user", content: "A creative environment where I can experiment with new ideas." },
  { role: "assistant", content: "### Question 4/10\n\nWhat values are most important to you in your career?" },
  { role: "user", content: "Making a positive impact and continuous learning." },
  { role: "assistant", content: "### Question 5/10\n\nWhat are your top 3 skills or strengths?" },
  { role: "user", content: "Analytical thinking, communication, and adaptability." },
  { role: "assistant", content: "### Question 6/10\n\nHow do you handle setbacks or failures?" },
  { role: "user", content: "I treat them as learning opportunities and try different approaches." },
  { role: "assistant", content: "### Question 7/10\n\nWhat kind of team dynamics do you prefer?" },
  { role: "user", content: "Small, cross-functional teams where everyone contributes ideas." },
  { role: "assistant", content: "### Question 8/10\n\nWhere do you see yourself in 5 years?" },
  { role: "user", content: "Leading innovative projects and mentoring others." },
  { role: "assistant", content: "### Question 9/10\n\nWhat industries or fields interest you most?" },
  { role: "user", content: "Technology, education, and sustainable development." },
  { role: "assistant", content: "### Question 10/10\n\nIf money were no object, what would you spend your time doing?" },
  { role: "user", content: "Building tools that help people learn and grow, and traveling to learn from different cultures." },
  { role: "assistant", content: "## 职业人格画像\n\n**The Innovative Builder** - You are a creative problem-solver who thrives at the intersection of technology and human connection. Your analytical mind combined with strong communication skills makes you uniquely positioned to bridge the gap between complex technical concepts and practical applications.\n\n**Core Traits:**\n- Strategic thinker with hands-on execution ability\n- Natural communicator who simplifies complexity\n- Growth-oriented with strong resilience\n\n## 建议职业路径\n\n1. **Product Manager** - Lead cross-functional teams to build innovative products\n2. **EdTech Entrepreneur** - Create educational tools and platforms\n3. **Technical Writer / Developer Advocate** - Bridge technology and communication\n4. **Innovation Consultant** - Help organizations transform and adapt\n\n## 避坑指南\n\n- Avoid purely routine, repetitive roles with no room for creativity\n- Be cautious of rigid corporate hierarchies that limit autonomy\n- Watch out for roles that isolate you from collaborative work\n\n## 坚韧特质 - Perseverance Profile\n\n**Resilience Score: High**\n\nYour approach to setbacks as learning opportunities shows exceptional emotional resilience. You demonstrate:\n- **Adaptive Persistence** - You don't just push through obstacles; you find new paths\n- **Growth Mindset** - Every failure is reframed as data for improvement\n- **Long-term Vision** - Your 5-year goals show sustained commitment to growth\n\n## 执行方案\n\n1. Start building a side project in EdTech within the next 3 months\n2. Join communities of product managers and tech educators\n3. Practice public speaking and technical writing regularly\n4. Seek mentorship from leaders in your target industries" },
];

export default function HomePage() {
  const searchParams = useSearchParams();
  const isDebug = searchParams.get("debug") === "results";

  const [hasStarted, setHasStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [completedMessages, setCompletedMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);

  // Handle debug mode - jump directly to results page
  useEffect(() => {
    if (isDebug && !showResults) {
      setCompletedMessages(DEBUG_MESSAGES);
      setShowResults(true);
    }
  }, [isDebug, showResults]);

  const handleComplete = useCallback(
    (messages: Array<{ role: string; content: string }>) => {
      setCompletedMessages(messages);
      setShowResults(true);
    },
    []
  );

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
      <CareerResults messages={completedMessages} onHome={handleBackToHome} />
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
