# AGENTS.md — Piura Electoral Platform

## Project context

Piura Electoral Platform is a fullstack web application for exploring electoral participation and socioeconomic indicators in the Piura region of Peru.

The platform covers:
- 8 provinces and 65 districts of Piura.
- The first and second rounds of the 2021 Peruvian presidential election.
- Electoral participation and absenteeism.
- Poverty, Human Development Index (HDI), and income indicators.

The application must not expand its geographical scope beyond Piura.

## Technology stack

Frontend:
- React
- TypeScript (strict mode)
- Vite
- Bun
- Tailwind CSS v4
- React Leaflet (when geographic features are implemented)
- TanStack Query (when API integration is implemented)
- Recharts (when charts are implemented)

Backend:
- Node.js
- Fastify
- TypeScript
- PostgreSQL 16
- Docker Compose for local infrastructure

Frontend code is located in `apps/web`.
Backend code is located in `apps/api`.

## Development principles

1. Implement exactly one component or narrowly scoped task per request.
2. Never implement additional features without explicit authorization.
3. Preserve existing functionality and project architecture.
4. Prefer simple, readable, maintainable code over unnecessary abstractions.
5. Use TypeScript strict typing. Avoid `any`.
6. Follow the existing ESLint configuration.
7. Keep components small and focused on a single responsibility.
8. Separate presentation, data access, and business logic.
9. Avoid premature optimization and unnecessary dependencies.
10. Do not modify backend code unless explicitly requested.
11. Do not modify database schemas or migrations unless explicitly requested.
12. Do not modify the existing Power BI project or its repository.

## React conventions

- Use functional components.
- Follow React Hooks rules.
- Use semantic HTML.
- Ensure accessibility and keyboard usability.
- Prefer explicit, meaningful naming.
- Avoid unnecessary state and effects.
- Do not introduce global state unless justified.
- Keep reusable UI components separate from feature-specific components.

## Quality gates

After every implementation:

1. Run `bun run lint` from `apps/web`.
2. Run `bun run build` from `apps/web`.
3. Fix errors introduced by the implementation.
4. Report what files changed.
5. Explain important technical decisions.
6. Report validation results accurately.

Never claim that tests or commands passed unless they were actually executed.

## Change control

Before editing, inspect the relevant files and existing configuration.

Only modify files necessary for the requested task.

Do not:
- Perform unrelated refactoring.
- Install dependencies without explaining why.
- Delete existing files without authorization.
- Suppress ESLint or TypeScript errors to bypass validation.
- Commit or push changes without explicit permission.

After completing the requested task, stop and wait for review.

## Communication

Explain implementation decisions in Spanish.

Keep explanations concise and technically meaningful.

When multiple solutions are possible, prefer the simplest approach consistent with the project's architecture.

The developer reviews and approves each component before further work begins.