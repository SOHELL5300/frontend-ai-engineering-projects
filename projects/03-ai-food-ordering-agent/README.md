# AI Food Ordering Agent

Project 3 of my **Frontend AI Engineering Series**.

An AI-powered food ordering interface that allows users to interact with a food ordering application using **natural-language text or voice commands** instead of navigating through multiple screens manually.

For example, users can say:

> "Order two paneer burgers from Burger House with extra cheese."

The application interprets the command, extracts the user's intent, validates the requested restaurant and menu items, and converts the request into structured cart actions.

---

## Demo

🎥 **Demo Video:** Coming soon

💻 **Live Demo:** Not currently deployed

The application currently uses **Ollama with a local LLM for AI inference during development**. The AI layer is designed to be provider-agnostic so that cloud AI providers can be integrated for production deployment without changing the core application architecture.

---

## Why I Built This

Most AI applications stop at:

> User → Prompt → AI Response

I wanted to explore a more practical frontend AI architecture where the AI is responsible for **understanding user intent**, while the application remains responsible for **validation and execution**.

The goal is to build an interface where users can interact with an application naturally instead of learning how to navigate traditional UI flows.

For example:

Traditional UI:

```text
Open restaurant
      ↓
Search menu
      ↓
Select item
      ↓
Choose quantity
      ↓
Choose modifiers
      ↓
Add to cart