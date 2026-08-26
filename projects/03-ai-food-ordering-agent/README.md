# 🤖 AI Food Ordering Agent

> **Project 3 — Frontend AI Engineering Series**

An AI-powered food ordering application that allows users to interact with a food-ordering interface using **natural-language text and voice commands**.

Instead of navigating through multiple screens, users can simply say:

> "Order two paneer burgers from Burger House with extra cheese."

The application understands the command, extracts the user's intent, validates the requested restaurant and menu items, and converts the request into structured application actions.

This project focuses on understanding how **AI can be integrated into real frontend product experiences**, rather than building a simple AI text-generation application.

---

## 🎯 Project Goal

Traditional food-ordering applications usually require users to:

```text
Open restaurant
      ↓
Search menu
      ↓
Select item
      ↓
Select quantity
      ↓
Select modifiers
      ↓
Add to cart
      ↓
Review cart
      ↓
Place order
```

The goal of this project is to explore an AI-driven interaction model:

```text
User
 ↓
"Order two paneer burgers from Burger House
 with extra cheese."
 ↓
AI understands intent
 ↓
Application validates the request
 ↓
Cart is updated
 ↓
User confirms
 ↓
Final action
```

The user doesn't need to understand the application's internal navigation.

They simply tell the application what they want.

---

## ✨ Key Features

### 🗣️ Natural Language Commands

Users can interact with the application using normal conversational language.

Example:

```text
Order two paneer burgers from Burger House.
```

The application converts the command into structured data.

### 🎤 Voice Commands

Users can speak commands using the browser's **Web Speech API**.

Example:

```text
"Order one masala dosa from South Kitchen."
```

The flow becomes:

```text
Voice
 ↓
Speech Recognition
 ↓
Text Command
 ↓
AI Command Parser
 ↓
Structured Intent
 ↓
Application Action
```

### 🤖 AI Command Parsing

The AI converts natural-language commands into structured JSON.

Example:

```json
{
  "intent": "ADD_TO_CART",
  "restaurantName": "Burger House",
  "items": [
    {
      "name": "paneer burger",
      "quantity": 2,
      "modifiers": [
        "extra cheese"
      ]
    }
  ],
  "originalCommand": "Order two paneer burgers from Burger House with extra cheese."
}
```

### 🛒 Command-Driven Cart

The application supports commands such as:

- Add items to cart
- Remove items from cart
- Clear cart
- View cart
- Update quantities
- Prepare order confirmation

### 🧠 AI Provider Abstraction

The application does not tightly couple the business logic to a specific AI provider.

The AI layer is abstracted:

```text
Application
     ↓
AI Provider
     ↓
┌───────────────┐
│    Ollama     │
│    Local LLM  │
└───────────────┘
```

The architecture allows additional providers to be added later:

```text
AI Provider
    │
    ├── Ollama
    ├── OpenAI
    ├── Gemini
    └── Other providers
```

Currently, the project uses **Ollama for local AI inference**.

---

## 🏗️ Architecture

The application follows a separation between **AI interpretation**, **application validation**, and **application execution**.

```text
                         USER
                           │
                 ┌─────────┴─────────┐
                 │                   │
                TEXT               VOICE
                 │                   │
                 │            Web Speech API
                 │                   │
                 └─────────┬─────────┘
                           │
                           ▼
                    COMMAND INPUT
                           │
                           ▼
                  NEXT.JS API ROUTE
                           │
                           ▼
                   AI PROVIDER LAYER
                           │
                           ▼
                        OLLAMA
                           │
                           ▼
                       LOCAL LLM
                           │
                           ▼
                  STRUCTURED INTENT
                           │
                           ▼
                 APPLICATION VALIDATION
                           │
                 ┌─────────┴─────────┐
                 │                   │
          Restaurant Validation   Menu Validation
                 │                   │
                 └─────────┬─────────┘
                           │
                           ▼
                     CART ACTION
                           │
                           ▼
                   USER CONFIRMATION
                           │
                           ▼
                     FINAL ACTION
```

---

## 🔐 AI Safety & Application Responsibility

One of the most important architectural decisions in this project is:

> **The AI does not directly execute application actions.**

The AI is responsible for:

```text
Understanding the user's command
             ↓
Extracting intent
             ↓
Extracting parameters
```

The application is responsible for:

```text
Validating the AI output
             ↓
Checking restaurant
             ↓
Checking menu items
             ↓
Executing application actions
             ↓
Requesting user confirmation
```

Therefore:

```text
User Command
      ↓
AI Intent Extraction
      ↓
Application Validation
      ↓
User Confirmation
      ↓
Application Action
```

This approach helps prevent unreliable AI output from directly changing application state or triggering sensitive actions.

---

## 🧰 Tech Stack

### Frontend

- **Next.js**
- **React**
- **JavaScript**
- **CSS Modules**
- **React Context API**

### AI

- **Ollama**
- **Llama 3.2 3B**
- Local LLM inference
- AI Provider abstraction
- Structured JSON output

### Voice

- **Web Speech API**
- Browser Speech Recognition

### Backend

- **Next.js API Routes**
- Server-side AI communication
- Application-level validation

### Development

- Node.js
- npm
- Git
- GitHub
- VS Code

---

## 📁 Project Structure

```text
ai-food-ordering-agent/
│
├── app/
│   ├── api/
│   │   └── parse-command/
│   │       └── route.js
│   │
│   ├── page.js
│   └── ...
│
├── components/
│   ├── CommandInput/
│   ├── VoiceInput/
│   ├── Cart/
│   └── ...
│
├── services/
│   └── ai/
│       ├── aiProvider.js
│       └── ollamaProvider.js
│
├── utils/
│   ├── matchMenuItem.js
│   ├── matchRestaurant.js
│   └── ...
│
├── public/
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Prerequisites

Before running the project, make sure the following are installed.

### 1. Node.js

Install Node.js from:

https://nodejs.org/

Verify:

```bash
node --version
```

Recommended:

```text
Node.js 20+
```

### 2. npm

npm is included with Node.js.

Verify:

```bash
npm --version
```

### 3. Ollama

This project currently uses Ollama for local AI inference.

Download Ollama:

https://ollama.com/download

Install Ollama for your operating system.

After installation, verify:

```bash
ollama --version
```

You should receive an Ollama version.

---

## 🧠 Ollama Model Setup

This project currently uses:

```text
llama3.2:3b
```

Download the model:

```bash
ollama pull llama3.2:3b
```

Verify that the model is installed:

```bash
ollama list
```

You should see:

```text
NAME
llama3.2:3b
```

---

## ▶️ Running Ollama

Start the Ollama server:

```bash
ollama serve
```

Ollama normally runs its local API at:

```text
http://localhost:11434
```

You can also test the model directly:

```bash
ollama run llama3.2:3b
```

Try:

```text
Hello
```

If the model responds, Ollama is ready.

---

## 🚀 Running the Project

### 1. Clone the repository

```bash
git clone https://github.com/SOHELL5300/frontend-ai-engineering-projects.git
```

Navigate into the project:

```bash
cd 03-ai-food-ordering-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a file named:

```text
.env.local
```

Add:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
```

### Environment variables explained

| Variable | Description |
|---|---|
| `OLLAMA_BASE_URL` | URL of the local Ollama server |
| `OLLAMA_MODEL` | Local model used by the application |

### 4. Start Ollama

Open a terminal:

```bash
ollama serve
```

Keep this terminal running.

### 5. Start Next.js

Open another terminal:

```bash
npm run dev
```

The application should be available at:

```text
http://localhost:3000
```

---

## 🧪 Example Commands

### Add an item

```text
Order one masala dosa from South Kitchen.
```

### Add multiple items

```text
Order two paneer burgers from Burger House.
```

### Add a modifier

```text
Order one paneer tikka pizza from Pizza Hub with extra cheese.
```

### Remove an item

```text
Remove the paneer burger from my cart.
```

### Clear the cart

```text
Clear my cart.
```

### View the cart

```text
Show my cart.
```

### Place the order

```text
Place my order.
```

---

## 🔄 Example AI Processing Flow

Input:

```text
Order two paneer burgers from Burger House with extra cheese.
```

AI processing:

```text
Natural Language
       ↓
Ollama
       ↓
Llama 3.2
       ↓
Structured JSON
```

Output:

```json
{
  "intent": "ADD_TO_CART",
  "restaurantName": "Burger House",
  "items": [
    {
      "name": "paneer burger",
      "quantity": 2,
      "modifiers": [
        "extra cheese"
      ]
    }
  ],
  "originalCommand": "Order two paneer burgers from Burger House with extra cheese."
}
```

Application processing:

```text
Structured Intent
       ↓
Restaurant Validation
       ↓
Menu Validation
       ↓
Cart Action
       ↓
User Confirmation
```

---

## 🧩 AI Provider Architecture

The AI provider is isolated from the rest of the application.

Current implementation:

```text
services/
└── ai/
    ├── aiProvider.js
    └── ollamaProvider.js
```

The application communicates with:

```text
getAIProvider()
```

instead of directly depending on Ollama.

This makes the architecture extensible.

Future implementation:

```text
services/
└── ai/
    ├── aiProvider.js
    ├── ollamaProvider.js
    ├── openaiProvider.js
    └── geminiProvider.js
```

The rest of the application can remain unchanged while the AI provider changes.

---

## 💡 Why Ollama?

The project uses Ollama during development for several reasons:

- Local AI inference
- No API key required
- No per-request API cost
- Easier experimentation
- Works without sending development commands to a cloud provider
- Allows the project to be developed without depending on paid AI APIs

The architecture is intentionally designed so that Ollama is a **development AI provider**, rather than making the entire application permanently dependent on it.

For production deployment, a hosted AI provider can be integrated through the same provider abstraction.

---

## 🌐 Deployment

The current version is primarily designed for **local development and demonstration** because the AI model runs locally through Ollama.

Ollama cannot simply run on a normal frontend hosting environment and be accessed by every visitor.

Therefore, the current architecture separates:

```text
Development
     ↓
Ollama
     ↓
Local LLM
```

from the future production architecture:

```text
Production
     ↓
Cloud AI Provider
     ↓
Hosted LLM
```

The AI Provider abstraction allows this transition without rewriting the application's core logic.

---

## 🎥 Demo

A recorded demo will demonstrate:

### Text Command

```text
"Order two paneer burgers from Burger House."
```

### Voice Command

```text
🎤 "Order one masala dosa from South Kitchen."
```

### AI Processing

```text
Command
 ↓
AI
 ↓
Structured Intent
```

### Application Processing

```text
Intent
 ↓
Validation
 ↓
Cart
 ↓
Confirmation
```

---

## 🛡️ Error Handling

The application handles common states including:

- Empty commands
- Invalid commands
- Unknown intents
- AI request failures
- Ollama unavailable
- Invalid AI responses
- Menu item not found
- Restaurant not found
- Loading state
- Empty cart
- Order confirmation state

The application does not blindly trust the AI response.

---

## 🚧 Current Limitations

This project is currently a **portfolio/engineering demonstration** and does not place real orders on food-delivery platforms.

The restaurant and menu data are used to demonstrate the AI command and application workflow.

A real-world integration would require an official API/integration from the food-delivery platform.

The project is intentionally designed so that external ordering providers can be integrated later.

---

## 🔮 Future Improvements

- [ ] AI tool/function calling
- [ ] Restaurant search tool
- [ ] Menu search tool
- [ ] Cart management tools
- [ ] Multi-step conversational ordering
- [ ] Context-aware conversations
- [ ] Better structured output validation
- [ ] Schema validation
- [ ] Production cloud AI provider
- [ ] Persistent cart state
- [ ] User authentication
- [ ] Database integration
- [ ] Rate limiting
- [ ] Production logging
- [ ] Monitoring
- [ ] Real food-delivery platform integration where official APIs are available
- [ ] Multi-provider AI configuration

---

## 📚 Key Learnings

This project helped me explore several concepts involved in building AI-powered frontend systems:

- Designing AI-powered frontend experiences
- Natural-language command interfaces
- Voice-driven application interactions
- Integrating local LLMs with Next.js
- AI provider abstraction
- Structured AI output
- Separating AI reasoning from application execution
- Validating AI-generated data
- Designing safer AI action flows
- Managing AI loading and error states
- Building server-side AI integrations
- Thinking about AI applications from a production architecture perspective

---

## 🧠 Core Engineering Principle

The biggest lesson from this project:

> **AI should interpret intent, not blindly control the application.**

A safer architecture is:

```text
User
 ↓
Natural Language
 ↓
AI
 ↓
Intent Extraction
 ↓
Schema / Data Validation
 ↓
Business Logic
 ↓
User Confirmation
 ↓
Final Action
```

This pattern can be applied to many AI-powered applications beyond food ordering.

Examples include:

- Travel assistants
- Shopping assistants
- Productivity applications
- CRM systems
- Scheduling applications
- Customer support systems
- Enterprise workflow automation

---

## 📈 Frontend AI Engineering Series

This project is part of my **Frontend AI Engineering Series**, where I am exploring how to design and build AI-powered frontend systems using modern web technologies.

The focus of this series is not just:

```text
Frontend + AI API
```

but:

```text
Frontend
    +
AI
    +
Application State
    +
Validation
    +
Business Logic
    +
Tools / Actions
    +
Production Architecture
```

---

## 👨‍💻 Author

**Sohail Khan**

Frontend Developer focused on building **AI-powered frontend systems** using React, Next.js, JavaScript, and modern AI technologies.

### Connect

- LinkedIn: https://www.linkedin.com/in/sohailkhan7/
- GitHub: https://github.com/SOHELL5300/frontend-ai-engineering-projects/tree/main/projects

---

## ⭐ If you find this project useful

Feel free to explore the repository, try the project locally, and share feedback or ideas for improving the architecture.
