import { convertToModelMessages, streamText, UIMessage } from "ai";

export const maxDuration = 60;

/**
 * Model Fallback Configuration
 * ============================
 * Add your preferred models here in priority order.
 * If the first model fails (e.g., token quota exceeded, rate limit, network error),
 * the system will automatically try the next model in the list.
 *
 * Supported providers (zero-config via Vercel AI Gateway):
 *   - OpenAI:      "openai/gpt-4o", "openai/gpt-4o-mini", "openai/gpt-5-mini"
 *   - Anthropic:   "anthropic/claude-sonnet-4", "anthropic/claude-haiku-3.5"
 *   - Google:      "google/gemini-2.5-flash", "google/gemini-2.5-pro"
 *   - xAI:         "xai/grok-3-mini-fast"
 *   - Fireworks:   "fireworks/llama-v3p1-70b-instruct"
 *
 * Other providers require you to set an API key in environment variables.
 */
const MODEL_LIST: string[] = [
  "deepseek/deepseek-v3",
  "google/gemini-2.5-flash",
  "deepseek/deepseek-v3.2",
  "minimax/minimax-m2.1",
];

// Hidden system prompt for career exploration
const SYSTEM_PROMPT = `Role
你是一名顶尖的"职业探索规划专家"。你曾是成功推荐过 500 位高管的猎头，现在专注于通过"认知与情感契合度"帮助用户发现真正的热情。

Task
引导用户进行一场个性化的职业探索之旅，包含 10 道动态调整的选择题。

Workflow Logic (必须严格执行)
分阶段探索：
- 1-3 题：广泛偏好探索。
- 4-6 题：深入挖掘核心优势。
- 7-9 题：环境与价值观契合度。
- 第 10 题：终极愿景整合。

自适应调整：禁止一次性给出所有问题。你必须根据用户对上一题的回答（内容、语气、深度），分析其潜在模式，动态生成下一道题。

分析思考：在每一道题之前，请先输出一段 [分析思考]，简述你对用户上一次回答的理解，以及你为什么要设计下一道题。

每道题给出4-6个选项，但是要提示用户尽可能多的表达自己的想法。例如可以想同时选择几项，以及为什么；或者可以都不选，并给出原因；也可以只认同选项中的某一部分，并给出原因。总之，尝试让用户理解选项只是让他在给出答案前有充足的思考和参考，并不是对他的限制。

最终合成：10 道题结束后，基于所有数据，为用户生成一份包含：职业人格画像、建议职业路径、避坑指南的"执行方案"。特别强调用户的坚韧性格特质(perseverance)。

Tone
专业、敏锐、理性且具有智力高度。不要给出平庸的建议，要尝试挖掘用户灵魂深处的驱动力。

IMPORTANT: 
- Track which question number you are on (1-10)
- Always show the current question number like "Question X/10" at the start
- After question 10, provide the final comprehensive career profile
- The final profile MUST include:
  1. Career Personality Profile (职业人格画像)
  2. Recommended Career Paths (建议职业路径) 
  3. Pitfall Guide (避坑指南)
  4. Key personality traits with emphasis on perseverance (坚韧性)
- Format the final profile with clear sections using markdown

Start
请先介绍你的角色背景，然后直接抛出第 1 题（关于用户进入"心流"状态的场景选择）。`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawMessages = body.messages;

    // Sanitize messages: ensure every message has proper parts with text content
    const messages: UIMessage[] = rawMessages
      .filter((m: UIMessage) => m.role && m.parts && m.parts.length > 0)
      .map((m: UIMessage) => ({
        ...m,
        parts: m.parts.filter(
          (p) => p.type === "text" && (p as { type: "text"; text: string }).text?.trim()
        ),
      }))
      .filter((m: UIMessage) => m.parts.length > 0);

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid messages provided." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const modelMessages = await convertToModelMessages(messages);

    // Try each model in order; if one fails, fall back to the next
    let lastError: unknown = null;
    for (const modelId of MODEL_LIST) {
      try {
        const result = streamText({
          model: modelId,
          system: SYSTEM_PROMPT,
          messages: modelMessages,
          maxOutputTokens: 2000,
        });

        return result.toUIMessageStreamResponse();
      } catch (modelError) {
        console.error(`[v0] Model "${modelId}" failed:`, modelError);
        lastError = modelError;
        // Continue to next model
      }
    }

    // All models failed
    console.error("[v0] All models failed. Last error:", lastError);
    return new Response(
      JSON.stringify({ error: "All models are currently unavailable. Please try again later." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[v0] Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
