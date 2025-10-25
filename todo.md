# ContraMind.ai TODO

## Completed Features (MVP - 95%)
- [x] Database schema with 11 tables (MySQL/TiDB)
- [x] Google Gemini 2.5 Pro AI integration
- [x] File upload with drag-and-drop
- [x] AI chat interface with markdown rendering
- [x] Dashboard, contracts management, knowledge base
- [x] Support ticket system
- [x] Admin panel (users, tickets, audit logs)
- [x] Marketing landing page
- [x] Resend email service with HTML templates
- [x] Tap Payment integration with webhooks
- [x] PostHog analytics and Sentry monitoring
- [x] Core Web Vitals RUM monitoring
- [x] OpenTelemetry distributed tracing
- [x] GitHub repository and CI workflow

## Layer 1: Foundation (Proper Separation & Core Infrastructure)

### F1: Database Schema Extensions
- [x] Add brandingSettings table for centralized branding management
- [x] Add webhookEvents table for webhook event logging
- [x] Add promptTemplates table for AI prompt management
- [x] Add reconciliationLogs table (from payment reconciliation)
- [x] Add rumMetrics table (from RUM monitoring)
- [x] Sync schema file with database

### F2: File Structure Reorganization
- [ ] Create /app/* directory structure for customer application
- [ ] Create /admin/* directory structure for admin panel
- [ ] Move customer pages to /app/* routes
- [ ] Move admin pages to /admin/* routes
- [ ] Update all imports and references

### F3: Route Separation
- [ ] Implement proper route prefixes (/app/* for customer, /admin/* for admin)
- [ ] Update App.tsx with separate route groups
- [ ] Add route guards for admin-only routes
- [ ] Update navigation components

### F4: Layout Components
- [ ] Create CustomerLayout component for app pages
- [ ] Create AdminLayout component for admin pages
- [ ] Implement separate navigation for each layout
- [ ] Add breadcrumbs and context-aware navigation

### F5: Admin Access Control
- [ ] Implement adminProcedure in tRPC for backend protection
- [ ] Add role-based middleware for admin routes
- [ ] Create admin guard hook for frontend
- [ ] Add proper error pages for unauthorized access

## Layer 2: Authentication & Branding

### A1: Custom Email/Password Authentication
- [ ] Add email/password fields to users table
- [ ] Implement password hashing with bcrypt
- [ ] Create registration endpoint
- [ ] Create login endpoint
- [ ] Add password reset flow
- [ ] Integrate with existing Manus OAuth

### B1: Centralized Branding System
- [ ] Create branding management UI in admin panel
- [ ] Implement logo upload functionality
- [ ] Add color scheme customization
- [ ] Add company name and tagline settings
- [ ] Create branding API endpoints
- [ ] Update all pages to use centralized branding

## Layer 3: Prompt Management

### P1: Prompt Management System
- [ ] Create prompt library UI in admin panel
- [ ] Implement prompt CRUD operations
- [ ] Add prompt versioning
- [ ] Add prompt testing interface
- [ ] Migrate hardcoded prompts to database
- [ ] Update AI service to use dynamic prompts

## Known Issues
- [ ] Fix any remaining nested anchor tag errors
- [ ] Improve error handling for AI timeouts
- [ ] Add rate limiting for API endpoints
- [ ] Implement proper logging system

