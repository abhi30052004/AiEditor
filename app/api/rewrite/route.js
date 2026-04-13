import OpenAI from "openai";
import { buildRewritePrompt } from "@/lib/prompt-builder";

export async function POST(request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          error:
            "Missing OPENAI_API_KEY. Add it to your .env file and restart the dev server.",
        },
        { status: 500 },
      );
    }

    const payload = await request.json();

    if (!payload?.instruction || !String(payload.instruction).trim()) {
      return Response.json(
        { error: "Rewrite instruction is required." },
        { status: 400 },
      );
    }

    if (!payload?.currentContent || !String(payload.currentContent).trim()) {
      return Response.json(
        { error: "There is no content in the editor to rewrite." },
        { status: 400 },
      );
    }

    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You rewrite content inside an editor. Return only the rewritten editable text. No explanation, no labels, no quotes.",
        },
        {
          role: "user",
          content: buildRewritePrompt(payload),
        },
      ],
    });

    const rawContent = completion.choices?.[0]?.message?.content;
    const content = typeof rawContent === "string" ? rawContent.trim() : "";

    if (!content) {
      return Response.json(
        { error: "The model returned an empty rewrite." },
        { status: 502 },
      );
    }

    return Response.json({ content });
  } catch (error) {
    console.error("Rewrite route error:", error);
    return Response.json(
      {
        error:
          "Unable to rewrite content right now. Check your API key and try again.",
      },
      { status: 500 },
    );
  }
}
