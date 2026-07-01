---
Task ID: 1
Agent: Main Orchestrator
Task: Build SMC Pro - Gestor de Campañas Cortas (robust version of MensajesCortos)

Work Log:
- Analyzed reference site https://walterzinho.github.io/MensajesCortos/ to understand features
- Extracted full JavaScript logic including prompts, API calls, card rendering, CSV export, and agent refinement mode
- Designed Prisma schema with Character, Campaign, and CampaignItem models
- Created 6 API routes: characters CRUD, generate, refine, export, history, seed
- Built campaign-service.ts with LLM integration via z-ai-web-dev-sdk
- Created Zustand store for comprehensive state management
- Built complete frontend page (1393 lines) with all features
- Updated layout.tsx for Spanish locale and dark theme
- Updated globals.css with emerald/amber color scheme and custom scrollbars
- Verified: lint passes, build succeeds, all API endpoints work
- Browser-verified: page renders correctly with all interactive elements

Stage Summary:
- Production-ready Next.js 16 app with TypeScript, Prisma, Zustand, shadcn/ui
- 4 pre-seeded characters (Don Evaristo, Mamá Justina, Camilo y Jenny, Ernesto y Juli)
- Full campaign generation with AI (z-ai-web-dev-sdk LLM)
- 6 photo styles, 3 content depth options, 3 copy length options
- Per-card agent refinement mode
- CSV export with pipe delimiter for Notion import
- Persistent storage via SQLite/Prisma (upgrade from localStorage)
- Dark theme with emerald/amber agricultural color scheme
- Responsive mobile-first design