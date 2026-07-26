import Anthropic from "@anthropic-ai/sdk";

// The AI features are optional: they light up when ANTHROPIC_API_KEY is set,
// and every controller falls back to a heuristic when it isn't.
export const aiEnabled = !!process.env.ANTHROPIC_API_KEY;

const client = aiEnabled ? new Anthropic() : null;

export const AI_MODEL = "claude-opus-4-8";

// Small helper: send one prompt, get back the concatenated text.
export const askClaude = async (
  system: string,
  userText: string,
  maxTokens = 1024
): Promise<string> => {
  if (!client) throw new Error("AI not configured");
  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userText }],
  });
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
};

// Parse a JSON object out of a model reply, tolerating ```json fences / prose.
export const parseJsonReply = <T>(text: string): T | null => {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? (JSON.parse(match[0]) as T) : null;
  } catch {
    return null;
  }
};
