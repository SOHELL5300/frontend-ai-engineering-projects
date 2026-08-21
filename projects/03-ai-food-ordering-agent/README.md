I built Project 3 of my Frontend AI Engineering series: AI Food Ordering Agent.

This is not just another AI text generator.

The app allows users to type or speak commands like:

“Order two paneer burgers from Burger House with extra cheese.”

The AI converts the natural language command into structured cart actions and updates the UI.

Tech stack:
- Next.js
- JavaScript
- CSS Modules
- OpenAI API
- Web Speech API
- React Context API

Key features:
- Voice commands
- AI command parsing
- Add/remove cart actions
- Order confirmation
- Loading/error/empty states
- Secure API route for AI key protection

The biggest learning from this project:
AI should not directly perform risky actions blindly. The better architecture is:

User command → AI intent extraction → frontend validation → user confirmation → final action

This project helped me understand how AI agents can be used inside real frontend product experiences.
