import OpenAI from "openai";
import { buildMeetingPrompt } from "@/lib/buildMeetingPrompt";

// The OpenAI client is created only on the server.
// This keeps the API key protected and prevents exposing it in browser code.
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const meetingText = body.meetingText?.trim();

    if (!meetingText) {
      return Response.json(
        {
          message: "Meeting notes are required.",
        },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          message:
            "OpenAI API key is missing. Please add OPENAI_API_KEY in .env.local.",
        },
        { status: 500 }
      );
    }

    const prompt = buildMeetingPrompt(meetingText);

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
      input: prompt,
    });

    // The Responses API returns generated text in output_text.
    // We ask the model to return only JSON, so we parse it before sending to frontend.
    const rawOutput = response.output_text;

    let parsedNotes;

    try {
      parsedNotes = JSON.parse(rawOutput);
    } catch (parseError) {
      console.error("AI JSON parsing failed:", parseError);
      console.error("Raw AI output:", rawOutput);

      return Response.json(
        {
          message:
            "AI response could not be parsed. Please try again with clearer meeting notes.",
        },
        { status: 500 }
      );
    }

    return Response.json({
      notes: parsedNotes,
    });
  } catch (error) {
    console.error("Generate notes API error:", error);

    return Response.json(
      {
        message: "Failed to generate meeting notes. Please try again.",
      },
      { status: 500 }
    );
  }
}