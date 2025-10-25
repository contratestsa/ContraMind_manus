# ContraMind.ai - AI-Powered Contract Analysis Platform

ContraMind.ai is a comprehensive AI-powered contract analysis platform designed specifically for Saudi Arabian SMBs. Built with React, Express, tRPC, and powered by Google Gemini 2.5 Pro AI.

## 🚀 Features

### Customer Application
- **Dashboard**: Overview of contract analysis with key metrics
- **Contract Upload**: Drag-and-drop file upload with automatic analysis
- **AI Analysis**: Powered by Google Gemini 2.5 Pro
  - Risk assessment (Low/Medium/High)
  - Sharia compliance checking
  - KSA regulatory compliance
  - Language detection (English/Arabic/Mixed)
- **AI Chat**: Interactive Q&A about contracts
- **Knowledge Base**: Store reference documents
- **Subscription Management**: Multiple pricing tiers
- **Support System**: Ticket-based customer support
- **Bilingual**: Full English and Arabic support

### Admin Panel
- **Dashboard**: Platform metrics and analytics
- **User Management**: View and manage all users
- **Support Tickets**: Handle customer support requests
- **Audit Logging**: Track admin actions

### Marketing Website
- **Landing Page**: Feature showcase and pricing
- **Responsive Design**: Mobile-first approach
- **Call-to-Actions**: Lead generation optimized

## 🛠 Tech Stack

### Frontend
- **React 19** with TypeScript
- **shadcn/ui** component library
- **Tailwind CSS 4** for styling
- **tRPC** for type-safe API calls
- **Wouter** for routing
- **PostHog** for analytics
- **Sentry** for error monitoring

### Backend
- **Express 4** server
- **tRPC 11** API layer
- **Drizzle ORM** for database
- **PostgreSQL** database
- **Google Gemini 2.5 Pro** AI integration
- **Tap Payment** for subscriptions

### Infrastructure
- **Manus Platform** for hosting
- **Manus S3** for file storage
- **Manus OAuth** for authentication
- **Automatic SSL** certificates

## 📦 Installation

### Prerequisites
- Node.js 22+
- pnpm package manager

### Environment Variables

Required environment variables (automatically injected by Manus):
```
DATABASE_URL=<postgresql-connection-string>
JWT_SECRET=<session-secret>
VITE_APP_ID=<manus-oauth-app-id>
OAUTH_SERVER_URL=<manus-oauth-url>
VITE_OAUTH_PORTAL_URL=<manus-login-url>
OWNER_OPEN_ID=<owner-openid>
OWNER_NAME=<owner-name>
BUILT_IN_FORGE_API_URL=<manus-api-url>
BUILT_IN_FORGE_API_KEY=<manus-api-key>
```

Additional required secrets (add via Manus UI):
```
GOOGLE_GEMINI_API_KEY=<your-gemini-api-key>
TAP_PAYMENT_SECRET_KEY=<your-tap-secret-key>
TAP_PAYMENT_PUBLIC_KEY=<your-tap-public-key>
```

Optional secrets for monitoring:
```
VITE_POSTHOG_KEY=<posthog-project-key>
VITE_POSTHOG_HOST=<posthog-host-url>
VITE_SENTRY_DSN=<sentry-dsn>
```

### Development

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

## 🗄 Database Schema

The platform uses 11 database tables:

1. **users** - User accounts and authentication
2. **contracts** - Uploaded contracts and analysis results
3. **aiMessages** - Chat history with AI
4. **knowledgeBase** - Reference documents
5. **aiFeedback** - User feedback on AI responses
6. **subscriptions** - Subscription management
7. **payments** - Payment transaction history
8. **supportTickets** - Customer support tickets
9. **ticketMessages** - Support conversation threads
10. **adminAuditLog** - Admin action tracking
11. **promptLibrary** - Pre-built AI prompts

## 🔑 Key Integrations

### Google Gemini AI
- Contract text analysis
- Risk assessment
- Compliance checking
- Interactive chat

### Tap Payment
- Subscription payments
- One-time charges
- Webhook handling

### PostHog Analytics
- User behavior tracking
- Event analytics
- Feature usage

### Sentry Error Monitoring
- Error tracking
- Performance monitoring
- Session replay

## 🌐 API Routes

### Authentication
- `auth.me` - Get current user
- `auth.logout` - Sign out
- `auth.updateProfile` - Update user profile

### Contracts
- `contracts.list` - List user contracts
- `contracts.getById` - Get contract details
- `contracts.create` - Upload new contract
- `contracts.update` - Update contract
- `contracts.delete` - Delete contract
- `contracts.search` - Search contracts

### AI
- `ai.getMessages` - Get chat history
- `ai.sendMessage` - Send message and get AI response
- `ai.submitFeedback` - Rate AI responses

### Knowledge Base
- `knowledge.list` - List documents
- `knowledge.create` - Upload document
- `knowledge.delete` - Delete document

### Subscription
- `subscription.getCurrent` - Get user subscription
- `subscription.create` - Create subscription
- `subscription.cancel` - Cancel subscription

### Support
- `support.listTickets` - List user tickets
- `support.getTicket` - Get ticket details
- `support.createTicket` - Create new ticket
- `support.replyToTicket` - Reply to ticket

### Admin (Admin-only)
- `admin.getDashboard` - Platform statistics
- `admin.listUsers` - List all users
- `admin.getUser` - Get user details
- `admin.listTickets` - List all tickets
- `admin.updateTicket` - Update ticket status

## 📱 User Roles

### User (Default)
- Upload and analyze contracts
- Chat with AI
- Manage knowledge base
- Create support tickets
- Manage subscription

### Admin
- All user permissions
- View all users and contracts
- Manage support tickets
- Access platform analytics
- Audit logging

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Danger**: Red (#ef4444)

### Typography
- **Font**: Inter (sans-serif)
- **Arabic Font**: Cairo

### Components
All UI components from shadcn/ui:
- Button, Card, Input, Select
- Dialog, Dropdown, Tooltip
- Table, Badge, Separator
- And more...

## 🔒 Security

- **Authentication**: Manus OAuth with JWT sessions
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: HTTPS only, secure cookies
- **File Storage**: Secure S3 with signed URLs
- **Input Validation**: Zod schema validation
- **SQL Injection**: Protected by Drizzle ORM
- **XSS Protection**: React automatic escaping

## 📊 Monitoring

### PostHog Events
- User sign in/out
- Contract uploaded/analyzed/deleted
- AI messages sent
- Subscription changes
- Support tickets created

### Sentry Tracking
- JavaScript errors
- API failures
- Performance issues
- Session replays

## 🚢 Deployment

The application is deployed on Manus Platform with automatic:
- SSL certificates
- Database backups
- File storage
- OAuth integration
- Environment management

To deploy:
1. Create checkpoint: Click "Save Checkpoint" in Manus UI
2. Publish: Click "Publish" button in Manus UI
3. Your app will be live at: `https://your-domain.manus.space`

## 📝 License

Proprietary - All rights reserved

## 🤝 Support

For support, email support@contramind.ai or create a ticket in the platform.

## 🇸🇦 Made in Saudi Arabia

Built specifically for Saudi Arabian businesses with:
- Arabic language support
- Sharia compliance checking
- KSA regulatory compliance
- Local payment integration (Tap)
- Middle East data centers

---

**ContraMind.ai** - Transforming contract analysis with AI

