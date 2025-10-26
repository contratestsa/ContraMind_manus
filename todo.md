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

## RTL/LTR Support (Arabic Language)
- [x] Implement <html dir> attribute that flips with locale
- [x] Convert all CSS to use logical properties (margin-inline, padding-inline)
- [x] Create RTL icon mirroring utility (useRTL hook)
- [x] Add RTL-aware CSS utilities (text-start, text-end, rtl-mirror)
- [x] Add three RTL snapshot tests for key components
- [x] Test layout direction flips correctly (all tests passing)

### i18next Migration (Enhanced RTL)
- [x] Install i18next, react-i18next, i18next-browser-languagedetector
- [x] Create i18n configuration with language detector
- [x] Import i18n in main.tsx
- [x] Create useDocumentDirection hook
- [x] Create LanguageToggle component
- [x] Add rtl-logical.css with logical properties
- [x] Create DirChevron component for directional icons
- [x] Test i18next integration (10 tests passing)
- [x] Both LanguageContext and i18next working together
- [x] Add Header RTL/LTR rendering test
- [x] Add button logical alignment test
- [x] Add breadcrumb chevron mirroring test
- [x] All 17 tests passing (10 i18next + 4 RTL snapshot + 3 additional RTL)

## PROMPT 1: Web Vitals RUM (Real User Monitoring)
- [x] Install web-vitals package
- [x] Create client/src/lib/webVitals.ts with onLCP/onCLS/onINP
- [x] Add sender that posts to /api/rum and PostHog
- [x] Import in main.tsx with VITE_RUM_ENABLED feature flag
- [x] Create POST /api/rum endpoint with Zod validation
- [x] Insert metrics into rumMetrics table using Drizzle
- [x] Add rate limiting per IP for anti-spam (100 requests per 15 min)
- [x] Add VITE_RUM_ENABLED env variable
- [x] Create admin page at /admin/web-vitals to view metrics
- [x] Feature flag controlled (VITE_RUM_ENABLED=1)
- [x] Metrics include URL, metric name, value, rating, timestamp, IP, user agent

## Known Issues
- [ ] Fix any remaining nested anchor tag errors
- [ ] Improve error handling for AI timeouts
- [ ] Add rate limiting for API endpoints
- [ ] Implement proper logging system

