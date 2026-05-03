# Project Instructions & Conventions

## Security First
- **Secrets & API Keys**: NEVER hardcode API keys, secrets, or sensitive configuration in source code. Always use environment variables (`import.meta.env` for Vite client-side, `process.env` for server-side).
- **Environment Variables**: When adding new configuration, always update `.env.example` with placeholders.
- **Data Validation**: Always validate user input on both the client and via Firestore Security Rules.
- **AI Safety**: Use delimiters and strict system instructions in AI service calls to prevent prompt injection.

## Firebase Guidelines
- **Security Rules**: Every Firestore collection must have a corresponding security rule that enforces identity (ownership) and schema validation.
- **Initialization**: Use the pattern established in `src/lib/firebase.ts` which checks for required environment variables at runtime.

## Coding Conventions
- **TypeScript**: Use strict TypeScript. Define interfaces for all data structures and API responses.
- **Components**: Prefer functional components with React hooks.
- **Icons**: Use `lucide-react` for all iconography.
- **Animations**: Use `motion` (from `motion/react`) for layout transitions and micro-interactions.
- **Styling**: Use Tailwind CSS utility classes exclusively. Avoid creating separate `.css` files.
- **Service Pattern**: Use a singleton pattern with lazy initialization for services (e.g., Gemini API) to ensure safety and performance.
- **Asset-less Assets**: Prefer programmatic generation (e.g., Web Audio API, SVG) over external binary assets where possible to reduce load times and deployment complexity.

## Print & Layout Conventions
- **Print Optimization**: Use the `print:` modifier in Tailwind and the `no-print` class to control visibility and layout during printing.
- **State Recovery**: Use URL fragments/hashes (e.g., `#print=`, `#popout=`) to communicate state between windows or for deep-linking printable content.
- **Sheet System**: Core sheet layouts (8.5x11 inches) and multi-column systems are defined as custom utilities in `src/index.css`. Maintain these for visual consistency between preview and print.

## UI/UX Design Guidelines
- **Typography**: Use clear, readable hierarchies. Default to sans-serif (Inter) for UI elements.
- **Responsive Design**: Follow mobile-first design patterns but ensure polished desktop layouts using max-width containers.
- **Feedback**: Provide immediate visual feedback for user actions (hover states, loading spinners, success toast notifications).
- **Accessibility**: Ensure high color contrast and proper ARIA labels where necessary.

## Development Environment
- **Port 3000**: The dev server MUST run on port 3000.
- **iFrame Awareness**: The app runs in an iFrame. Avoid `window.alert` or `window.open` where possible; use custom modals or in-app notifications.
- **Dependencies**: Use `npm` for package management. Always install new packages using the provided tools rather than manual `package.json` edits.
