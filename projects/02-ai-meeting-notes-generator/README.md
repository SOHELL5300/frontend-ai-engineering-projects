# AI Meeting Notes & Action Items Generator

A practical AI-powered Next.js app that converts raw meeting notes or transcripts into structured summaries, key discussion points, decisions, action items, suggested owners, priority levels, risks, blockers, and follow-up questions.

This project is part of the **Frontend AI Engineering Projects** series.

## Project Positioning

**React.js Developer building AI-powered frontend systems**

This project shows how a frontend engineer can build a real AI product workflow using Next.js, JavaScript, CSS Modules, and a protected server-side AI API integration.

## Features

* Paste raw meeting notes or transcript
* Generate meeting summary
* Extract key discussion points
* Identify decisions made
* Generate action items
* Suggest owners for tasks
* Assign priority levels
* Identify risks and blockers
* Generate follow-up questions
* Copy generated summary
* Loading state
* Error state
* Empty state
* Protected API key using Next.js API route
* Clean, portfolio-ready UI

## Tech Stack

* Next.js
* React
* JavaScript
* CSS Modules / Plain CSS
* OpenAI API
* Next.js API Route Handlers

## Real-World Use Case

Teams often come out of meetings with messy notes and unclear action items. This app helps convert unstructured meeting text into structured, useful business output.

It can be used for:

* Sprint planning
* Daily standups
* Product discussions
* Client meetings
* Requirement gathering
* Retrospectives
* Support incident reviews

## Architecture

```txt
User pastes meeting notes
        ↓
Next.js frontend validates input
        ↓
Frontend calls /api/generate-notes
        ↓
Next.js API route calls OpenAI securely
        ↓
AI returns structured JSON
        ↓
Frontend renders meeting insights
```

## Why API Route Is Used

The OpenAI API key should never be exposed in frontend code.

This project uses a Next.js API route so the browser calls:

```txt
/api/generate-notes
```

The API route then calls OpenAI from the server.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/frontend-ai-engineering-projects.git
cd frontend-ai-engineering-projects/02-ai-meeting-notes-generator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create a `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5.4-mini
```

### 4. Run the development server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Folder Structure

```txt
02-ai-meeting-notes-generator/
│
├── app/
│   ├── api/
│   │   └── generate-notes/
│   │       └── route.js
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
│   └── buildMeetingPrompt.js
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Key Learning Points

* How to build AI-powered frontend workflows
* How to protect API keys in Next.js
* How to call AI APIs from server routes
* How to handle loading, error, and empty states
* How to render structured AI responses
* How to build interview-friendly React components
* How prompt engineering works in a frontend product

## Future Improvements

* Add file upload for meeting transcripts
* Add voice-to-text transcription
* Add export to PDF
* Add save history
* Add authentication
* Add team workspace
* Add editable action items
* Add integrations with Slack, Jira, Notion, or Trello
* Add streaming response UI
* Add structured JSON schema validation

## Author

Built by **Sohail Khan** as part of the Frontend AI Engineering Projects series.
