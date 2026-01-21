# Zak AI Chat Application

## Overview

Zak AI is a conversational AI chat application featuring a sarcastic, roast-style AI personality named "Zak." The application provides real-time streaming chat responses, image generation capabilities, and conversation management. It's built with a React frontend and Express backend, using Replit's AI Integrations for Gemini model access.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight React router)
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (dark mode default)
- **Animations**: Framer Motion for smooth transitions and chat bubble animations
- **Markdown Rendering**: react-markdown with remark-gfm for formatted AI responses

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints under `/api/` prefix
- **Streaming**: Server-Sent Events (SSE) pattern for real-time AI response streaming via POST requests
- **Authentication**: Replit Auth integration using OpenID Connect with Passport.js
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` exports all models
- **Models**:
  - `users` and `sessions` tables for authentication (required by Replit Auth)
  - `conversations` table linking to users
  - `messages` table with role (user/assistant) and content
- **Migrations**: Drizzle Kit with `db:push` command for schema sync

### AI Integration
- **Provider**: Replit AI Integrations (Gemini-compatible API)
- **Models Used**:
  - `gemini-2.5-flash` for chat responses
  - `gemini-2.5-flash-image` for image generation
- **Configuration**: Uses environment variables `AI_INTEGRATIONS_GEMINI_API_KEY` and `AI_INTEGRATIONS_GEMINI_BASE_URL`
- **Safety Settings**: All harm filters disabled to allow unrestricted roast-style responses

### Project Structure
```
├── client/src/           # React frontend
│   ├── components/       # UI components including chat bubbles, sidebar
│   ├── hooks/            # Custom React hooks for auth, chat, images
│   ├── pages/            # Route components (Landing, Chat, NotFound)
│   └── lib/              # Utilities and query client
├── server/               # Express backend
│   ├── replit_integrations/  # Modular integrations
│   │   ├── auth/         # Replit Auth setup
│   │   ├── chat/         # Chat routes and storage
│   │   └── image/        # Image generation routes
│   └── db.ts             # Database connection
├── shared/               # Shared between client and server
│   ├── models/           # Drizzle schema definitions
│   ├── routes.ts         # API route type definitions with Zod
│   └── schema.ts         # Schema re-exports
```

### Build System
- **Development**: `tsx` for running TypeScript directly
- **Production Build**: Custom build script using esbuild for server and Vite for client
- **Output**: Server bundles to `dist/index.cjs`, client to `dist/public/`

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database access with PostgreSQL dialect

### Authentication
- **Replit Auth**: OAuth/OIDC authentication via `ISSUER_URL` (defaults to `https://replit.com/oidc`)
- **Session Secret**: Required `SESSION_SECRET` environment variable

### AI Services
- **Replit AI Integrations**: Gemini API access without requiring personal API keys
  - `AI_INTEGRATIONS_GEMINI_API_KEY`: API key for Gemini access
  - `AI_INTEGRATIONS_GEMINI_BASE_URL`: Custom base URL for Replit's proxy

### Key NPM Packages
- `@google/genai`: Google Generative AI SDK for Gemini
- `drizzle-orm` + `drizzle-zod`: Database ORM with Zod schema generation
- `@tanstack/react-query`: Async state management
- `framer-motion`: Animation library
- `react-markdown` + `remark-gfm`: Markdown rendering
- `passport` + `openid-client`: Authentication handling