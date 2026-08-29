import { generateWithOllama } from "@/lib/ai/ollamaProvider";
import { buildMeetingPrompt } from "@/lib/buildMeetingPrompt";

export async function POST(request) {
  try {
    const body = await request.json();

    const meetingText = body.meetingText?.trim();

    // Validate the request before sending anything to the AI model.
    if (!meetingText) {
      return Response.json(
        {
          message: "Meeting notes are required.",
        },
        {
          status: 400,
        }
      );
    }

    const prompt = buildMeetingPrompt(meetingText);

    // The AI request happens on the server.
    // The browser never communicates directly with Ollama.
    const rawOutput = await generateWithOllama(prompt);

    let parsedNotes;

    try {
      parsedNotes = JSON.parse(rawOutput);
    } catch (error) {
      console.error("Failed to parse Ollama response:", error);
      console.error("Raw Ollama response:", rawOutput);

      return Response.json(
        {
          message:
            "The AI returned an invalid response. Please try generating the notes again.",
        },
        {
          status: 500,
        }
      );
    }

    return Response.json({
      notes: parsedNotes,
    });
  } catch (error) {
    console.error("Generate meeting notes error:", error);

    return Response.json(
      {
        message:
          error?.message ||
          "Failed to generate meeting notes. Please make sure Ollama is running.",
      },
      {
        status: 500,
      }
    );
  }
}