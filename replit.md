# replit.md

## Overview

This is a full-stack e-commerce application built with React, Node.js, Express, and PostgreSQL. The application provides a comprehensive online shopping experience with features including user authentication, product management, shopping cart functionality, order processing, and admin capabilities. The frontend uses React with shadcn/ui components and Tailwind CSS for styling, while the backend implements a RESTful API with Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming and dark mode support
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful API with route-based organization
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Firebase Authentication with custom middleware for route protection
- **Middleware**: Role-based access control with admin and customer roles
- **Session Management**: Express sessions with PostgreSQL session store

### Database Schema
- **Users**: Firebase UID integration with local user profiles and role management
- **Products**: Comprehensive product model with categories, variants, images, and specifications
- **E-commerce Features**: Shopping cart, wishlist, orders, reviews, and address management
- **Admin Features**: Product management, order tracking, and user administration

### Authentication & Authorization
- **Provider**: Firebase Authentication for user management
- **Social Login**: Google OAuth integration with email/password fallback
- **Authorization**: JWT token validation with Firebase UID mapping
- **Role-Based Access**: Customer and admin roles with protected routes
- **Session Persistence**: Server-side session management for authentication state

### UI/UX Design System
- **Component Library**: Comprehensive shadcn/ui components with consistent design patterns
- **Theme System**: CSS custom properties with light/dark mode support
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: ARIA compliance through Radix UI primitives
- **Typography**: Custom font integration with fallback system fonts

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL with Neon serverless hosting
- **Authentication**: Firebase Authentication and Admin SDK
- **Payment Processing**: Stripe integration with React Stripe.js components
- **Payment Alternative**: PayPal Server SDK for additional payment options

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Database Management**: Drizzle Kit for migrations and schema management
- **Code Quality**: TypeScript for type safety and ESLint configuration
- **Development Environment**: Replit-specific plugins for development workflow

### UI Dependencies
- **Component Framework**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS for processing
- **Icons**: Lucide React for consistent iconography
- **Form Handling**: React Hook Form with Hookform Resolvers
- **Date Handling**: date-fns for date manipulation and formatting

### Production Dependencies
- **Server State**: TanStack Query for efficient data fetching and caching
- **Validation**: Zod for runtime type validation and schema definition
- **Utility Libraries**: clsx and class-variance-authority for conditional styling
- **Session Management**: connect-pg-simple for PostgreSQL session storage