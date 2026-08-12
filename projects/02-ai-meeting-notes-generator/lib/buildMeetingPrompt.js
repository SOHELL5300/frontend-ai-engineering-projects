export function buildMeetingPrompt(meetingText) {
  return `
You are an AI assistant helping a product team convert raw meeting notes into structured business output.

Analyze the meeting notes carefully and return ONLY valid JSON.

Do not include markdown.
Do not include explanation outside JSON.
Do not include backticks.

Return this exact JSON structure:

{
  "summary": "Short meeting summary in 3-5 sentences.",
  "keyDiscussionPoints": [
    "Point 1",
    "Point 2"
  ],
  "decisionsMade": [
    "Decision 1",
    "Decision 2"
  ],
  "actionItems": [
    {
      "task": "Action item description",
      "suggestedOwner": "Suggested owner name or role",
      "priority": "High | Medium | Low"
    }
  ],
  "risksAndBlockers": [
    "Risk or blocker 1",
    "Risk or blocker 2"
  ],
  "followUpQuestions": [
    "Question 1",
    "Question 2"
  ]
}

Rules:
- If owner is not clearly mentioned, suggest a likely role such as Product Manager, Frontend Developer, Backend Developer, QA Engineer, Designer, or Project Lead.
- Priority should be based on urgency, business impact, dependency, or blocker severity.
- Keep the output practical and useful for real teams.
- Use simple professional language.

Meeting notes:
${meetingText}
`;
}