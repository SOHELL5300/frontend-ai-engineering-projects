# AI Meeting Notes & Action Items Generator

A practical AI-powered meeting assistant built with **Next.js, React, JavaScript, CSS, and Ollama**.

The application converts raw meeting notes or transcripts into structured business insights including summaries, key discussion points, decisions, action items, suggested owners, priorities, risks, blockers, and follow-up questions.

This project is part of the **Frontend AI Engineering Projects** series.

---

## Project Positioning

**React.js Developer building AI-powered frontend systems**

This project demonstrates how a frontend engineer can build a real AI-powered product workflow using Next.js, React, JavaScript, and local AI inference with Ollama.

Instead of building another generic AI chatbot, this application focuses on a practical business workflow: turning unstructured meeting information into actionable output.

---

## Features

* Paste raw meeting notes or meeting transcripts
* Generate an AI-powered meeting summary
* Extract key discussion points
* Identify decisions made
* Generate action items
* Suggest owners for action items
* Assign High, Medium, or Low priority
* Identify risks and blockers
* Generate follow-up questions
* Copy the generated meeting summary
* Loading state while AI is processing
* Error state for failed requests
* Empty state before generating notes
* Server-side AI orchestration through a Next.js API route
* Local AI inference using Ollama
* Clean and responsive portfolio-ready UI

---

## Tech Stack

* **Next.js** – Application framework and server-side API routes
* **React** – Component-based UI
* **JavaScript** – Application logic
* **CSS** – Responsive styling
* **Ollama** – Local AI inference
* **Llama 3.2** – Local language model
* **Next.js Route Handlers** – Server-side AI integration

---

## Why Ollama?

This project uses **Ollama** instead of a paid cloud AI API.

The main reasons are:

* No external AI API credits required for local development
* AI inference runs locally
* No external API key is required
* Better control over development costs
* Easy to experiment with different local models
* Keeps the AI provider replaceable through a dedicated provider layer

The application can therefore be developed and tested locally without depending on a paid AI API account.

---

## Real-World Use Case

Teams often leave meetings with large amounts of unstructured information.

Important decisions, tasks, owners, and blockers can easily get lost in meeting notes or transcripts.

This application converts that unstructured information into a structured format that teams can immediately use.

### Example Use Cases

* Sprint planning
* Daily standups
* Product discussions
* Client meetings
* Requirement gathering
* Engineering discussions
* Project retrospectives
* Support incident reviews
* Release planning

---

## Example Workflow

```text
Raw Meeting Notes
        ↓
Next.js Frontend
        ↓
POST /api/generate-notes
        ↓
Next.js Server Route
        ↓
Ollama Provider
        ↓
Llama 3.2
        ↓
Structured JSON
        ↓
React UI
        ↓
Meeting Summary + Action Items + Decisions + Risks
```

---

## Architecture

The application separates the frontend, server route, AI provider, and prompt logic.

```text
┌──────────────────────────────┐
│          React UI            │
│                              │
│  MeetingInput + Results      │
└──────────────┬───────────────┘
               │
               │ POST
               ▼
┌──────────────────────────────┐
│     Next.js API Route        │
│                              │
│ /api/generate-notes           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Prompt Builder         │
│                              │
│ buildMeetingPrompt()         │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Ollama Provider        │
│                              │
│ generateWithOllama()         │
└──────────────┬───────────────┘
               │
               │ HTTP
               ▼
┌──────────────────────────────┐
│           Ollama             │
│                              │
│        Llama 3.2             │
└──────────────────────────────┘
```

---

## Why Use a Provider Layer?

The application does not call Ollama directly from the React components.

Instead, the AI integration is isolated inside:

```text
lib/ai/ollamaProvider.js
```

The API route communicates with the provider:

```text
route.js
    ↓
ollamaProvider.js
    ↓
Ollama
```

This keeps the application loosely coupled to a specific AI provider.

For example, the project can later support:

```text
lib/ai/
├── ollamaProvider.js
├── openaiProvider.js
└── aiProvider.js
```

without requiring major changes to the frontend.

---

## Why Is the Next.js API Route Used?

The browser communicates with:

```text
/api/generate-notes
```

instead of communicating directly with Ollama.

This gives the application a server-side boundary where we can handle:

* Input validation
* Prompt construction
* AI provider communication
* Error handling
* Response parsing
* Future authentication
* Future rate limiting
* Future logging and monitoring

The architecture therefore becomes:

```text
Browser
   ↓
Next.js API Route
   ↓
AI Provider
   ↓
Ollama
```

---

## Local AI Setup

### 1. Install Ollama

Download and install Ollama from:

https://ollama.com/

Verify the installation:

```bash
ollama --version
```

### 2. Download the Llama 3.2 Model

```bash
ollama pull llama3.2
```

Verify that the model is available:

```bash
ollama list
```

You should see:

```text
llama3.2
```

### 3. Test the Model

```bash
ollama run llama3.2
```

Then enter a simple prompt:

```text
Summarize this meeting: Rahul will fix the login bug tomorrow.
```

If the model responds, the local AI environment is ready.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/frontend-ai-engineering-projects.git
```

Navigate to the project:

```bash
cd frontend-ai-engineering-projects/02-ai-meeting-notes-generator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install and start Ollama

Make sure Ollama is installed and running.

Check available models:

```bash
ollama list
```

If Llama 3.2 is not available:

```bash
ollama pull llama3.2
```

### 4. Create environment file

Create:

```text
.env.local
```

Add:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### 5. Start the Next.js application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Environment Variables

The project uses the following environment variables:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### `.env.example`

The repository contains a `.env.example` file:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

No OpenAI API key is required for this project.

---

## Folder Structure

```text
02-ai-meeting-notes-generator/
│
├── app/
│   ├── api/
│   │   └── generate-notes/
│   │       └── route.js
│   │
│   ├── globals.css
│   ├── layout.js
│   └── page.js
│
├── components/
│   ├── EmptyState.js
│   ├── ErrorMessage.js
│   ├── Footer.js
│   ├── Header.js
│   ├── MeetingInput.js
│   ├── NotesResult.js
│   └── SectionCard.js
│
├── lib/
│   ├── ai/
│   │   └── ollamaProvider.js
│   │
│   └── buildMeetingPrompt.js
│
├── public/
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Core Components

### `MeetingInput`

Responsible for:

* Meeting note input
* Character count
* Generate action
* Clear action
* Loading state

### `NotesResult`

Responsible for displaying:

* Summary
* Discussion points
* Decisions
* Action items
* Suggested owners
* Priority
* Risks
* Follow-up questions

### `SectionCard`

Reusable presentation component for individual generated sections.

### `EmptyState`

Displayed before any meeting notes are generated.

### `ErrorMessage`

Displays user-friendly errors returned by the application.

---

## AI Integration

The AI workflow is handled by:

```text
app/api/generate-notes/route.js
```

The route:

1. Receives meeting notes from the frontend
2. Validates the request
3. Builds the AI prompt
4. Sends the prompt to the Ollama provider
5. Receives the Llama 3.2 response
6. Parses the JSON response
7. Returns structured data to React

---

## AI Provider

The Ollama integration is isolated inside:

```text
lib/ai/ollamaProvider.js
```

This provider communicates with the local Ollama server:

```text
http://localhost:11434
```

The model is configurable through:

```env
OLLAMA_MODEL=llama3.2
```

This allows the model to be changed without modifying the application code.

---

## Structured AI Output

The application asks the model to return structured JSON:

```json
{
  "summary": "Meeting summary",
  "keyDiscussionPoints": [
    "Discussion point"
  ],
  "decisionsMade": [
    "Decision made"
  ],
  "actionItems": [
    {
      "task": "Task description",
      "suggestedOwner": "Frontend Developer",
      "priority": "High"
    }
  ],
  "risksAndBlockers": [
    "Risk or blocker"
  ],
  "followUpQuestions": [
    "Question requiring clarification"
  ]
}
```

This makes the AI response easier for the frontend to consume and render.

---

## Error Handling

The application handles errors at multiple levels.

### Frontend

* Empty input validation
* Loading state
* API failure state
* User-friendly error messages

### API Route

* Invalid request handling
* Ollama connection errors
* Empty AI responses
* Invalid JSON responses

### AI Provider

* HTTP failures
* Ollama server unavailable
* Model unavailable
* Empty responses

---

## UI States

The application intentionally handles the major states of a real frontend product.

### Empty

```text
No generated notes yet
```

### Loading

```text
Analyzing meeting notes with AI...
```

### Success

Displays the structured meeting output.

### Error

Displays a user-friendly error message when generation fails.

---

## Key Learning Points

This project demonstrates:

* Building AI-powered frontend workflows
* Integrating local AI with a Next.js application
* Using Next.js Route Handlers as a server-side boundary
* Separating AI provider logic from application logic
* Prompt engineering for structured output
* Parsing AI-generated JSON
* Handling asynchronous frontend operations
* Designing loading, error, empty, and success states
* Building reusable React components
* Creating responsive interfaces with CSS
* Designing an architecture that can support multiple AI providers

---

## Interview Talking Point

A key architectural decision in this project was separating the AI provider from the application route.

Instead of coupling the application directly to an AI service, the project uses:

```text
React
  ↓
Next.js API Route
  ↓
AI Provider
  ↓
Ollama
```

This makes it easier to replace or extend the AI provider in the future.

For example, the application could eventually support both:

```text
Ollama
OpenAI
```

while keeping the frontend unchanged.

---

## Future Improvements

### AI Improvements

* Structured JSON schema validation
* Better prompt versioning
* Streaming AI responses
* Multiple local model support
* Configurable AI temperature
* Meeting-type-specific prompts
* Better handling of ambiguous owners

### Product Improvements

* Upload meeting transcript files
* Voice-to-text input
* Meeting history
* Search previous meetings
* Editable action items
* Mark action items as completed
* Export to PDF
* Export to Markdown
* Share generated summaries

### Integrations

* Slack
* Jira
* Notion
* Trello
* Microsoft Teams
* Google Calendar

### Platform Improvements

* Authentication
* User accounts
* Team workspaces
* Database persistence
* Rate limiting
* Monitoring
* Analytics
* Production deployment

---

## Project Roadmap

```text
Phase 1
───────
✓ Meeting input
✓ AI generation
✓ Structured output
✓ Loading state
✓ Error state
✓ Empty state
✓ Copy summary

Phase 2
───────
□ File upload
□ Editable action items
□ PDF export
□ Meeting history

Phase 3
───────
□ Authentication
□ Database
□ Team workspace
□ External integrations

Phase 4
───────
□ Voice transcription
□ Streaming responses
□ Multi-provider AI architecture
```

---

## Related Project

This project is part of the:

**Frontend AI Engineering Projects**

series.

The series focuses on building practical AI-powered frontend applications using modern frontend technologies and real AI integrations.

---

## Author

Built by **Sohail Khan** as part of the **Frontend AI Engineering Projects** series.

**Focus:** React.js · Next.js · JavaScript · AI-powered frontend systems
