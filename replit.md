# Leaderboard Points System

## Overview

This is a full-stack web application built with React (frontend) and Node.js/Express (backend) that implements a points-based leaderboard system. Users can select from a list of participants, claim random points for them, and view real-time rankings. The system includes user management, point claiming functionality, and historical tracking of all point awards.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API endpoints
- **Session Management**: PostgreSQL session store
- **Development**: Hot reload with tsx

### Project Structure
```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and API client
├── server/               # Express backend
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Data layer abstraction
│   └── index.ts          # Server entry point
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema and validation
└── migrations/           # Database migrations
```

## Key Components

### Database Schema
- **Users Table**: Stores user information (id, name, points, avatar, created_at)
- **Claim History Table**: Tracks every point claim (id, user_id, points_awarded, claimed_at)
- **Relationships**: One-to-many between users and claim history

### API Endpoints
- `GET /api/users` - Retrieve all users with current points
- `POST /api/users` - Create a new user
- `POST /api/users/:id/claim` - Claim random points (1-10) for a user
- `GET /api/claim-history` - Get recent claim history with user details

### Frontend Components
- **Leaderboard Page**: Main interface with user selection, claim button, and rankings
- **User Management**: Add new users with name and avatar
- **Real-time Updates**: Automatic refresh of rankings after point claims
- **Claim History**: Display of recent point award activities

### Storage Layer
- **Memory Storage**: In-memory fallback for development (server/storage.ts)
- **Database Integration**: Drizzle ORM with PostgreSQL for production
- **Data Abstraction**: IStorage interface for easy storage provider switching

## Data Flow

1. **User Selection**: Frontend displays dropdown of available users
2. **Point Claiming**: User clicks claim button → API generates random points (1-10) → Updates user's total points → Creates history record
3. **Real-time Updates**: TanStack Query invalidates cache → Refetches updated user data → Updates leaderboard rankings
4. **Ranking Calculation**: Users automatically sorted by total points in descending order
5. **History Tracking**: Every claim creates a timestamped record linking user and points awarded

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: TanStack Query for server state synchronization
- **Form Validation**: Zod for type-safe schema validation
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: Neon Database (serverless PostgreSQL)
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Storage**: connect-pg-simple for PostgreSQL session management
- **Development**: tsx for TypeScript execution in development

### Build Tools
- **Vite**: Frontend build tool and development server
- **ESBuild**: Server-side bundling for production
- **TypeScript**: Type checking and compilation
- **Drizzle Kit**: Database migration and schema management

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with hot reload
- **Backend**: tsx with file watching for auto-restart
- **Database**: Migrations run via `drizzle-kit push`

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: PostgreSQL connection via DATABASE_URL environment variable
- **Deployment**: Single node.js process serving both API and static files

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **Session Management**: PostgreSQL-backed sessions for scalability

The application uses a modern full-stack TypeScript architecture with strong type safety throughout the data flow, real-time updates, and a clean separation between frontend and backend concerns.