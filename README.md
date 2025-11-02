# TIES Together - Creative Collaboration Platform

A comprehensive platform for booking, collaboration, and project management in the creative industry. Connect freelancers, organisers, vendors, and venues for seamless creative projects.

## ✅ Platform Status: FULLY OPERATIONAL

**Frontend:** http://localhost:5173 (Running)  
**Backend:** http://localhost:5001 (Running)

## 🎯 Overview

TIES Together is a full-featured MVP platform that enables:
- **Multi-role user system** - Freelancers, Organisers, Vendors, Venues, and Collectives
- **Smart discovery** - Find and connect with creative professionals
- **Booking system** - Request and manage jobs with escrow payments
- **TIES Studio** - Project management with tasks, budgets, and file sharing
- **In-app messaging** - Real-time communication
- **Pro subscriptions** - Enhanced features for power users

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Firebase account (for authentication and database)
- Stripe account (for payments)

### Installation

1. **Clone and install dependencies:**
```bash
cd creative-hub
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and add your Firebase and Stripe credentials.

3. **Start development server:**
```bash
npm run dev
```

Visit `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, User, Studio)
├── pages/              # Page components
│   ├── auth/          # Login, Signup
│   ├── dashboard/     # User dashboard
│   ├── discover/      # Discovery feed
│   ├── profile/       # User profiles
│   ├── bookings/      # Booking management
│   ├── studio/        # TIES Studio workspace
│   └── messages/      # Messaging
├── services/          # Firebase, Stripe, API
├── types/             # TypeScript definitions
└── utils/             # Helper functions

docs/
├── windsurf-mvp-build-spec.md  # Complete MVP specification
├── PROJECT_STRUCTURE.md         # Architecture details
└── PROGRESS.md                  # Development progress
```

## 🔑 Key Features

### User Roles
- **Creative Freelancer** - Offer services, manage bookings
- **Organiser/Client** - Find talent, manage projects
- **Vendor** - List equipment and services
- **Venue** - Offer spaces for events
- **Collective** - Manage creative groups

### Core Features (Phase 1) ✅
- [x] Firebase authentication
- [x] Multi-role user system
- [x] Role-based navigation
- [x] Protected routes
- [x] Dark mode
- [x] Responsive design

### Coming Soon (Phase 2-4)
- [ ] Profile/portfolio builders
- [ ] Discovery feed with search
- [ ] Booking request system
- [ ] Escrow payments (Stripe Connect)
- [ ] TIES Studio project workspace
- [ ] Task management
- [ ] Budget tracking
- [ ] File uploads
- [ ] In-app messaging
- [ ] Reviews & ratings
- [ ] Pro subscriptions

## 💻 Tech Stack

- **Frontend:** React 19, TypeScript, Vite 7
- **Styling:** TailwindCSS v4
- **Routing:** React Router v7
- **Auth:** Firebase Authentication
- **Database:** Firestore
- **Payments:** Stripe Connect
- **Storage:** Firebase Storage
- **State:** React Context + Hooks

## 📖 Documentation

- **[MVP Build Spec](docs/windsurf-mvp-build-spec.md)** - Complete feature specification
- **[Progress Tracker](docs/PROGRESS.md)** - Development status
- **[Project Structure](docs/PROJECT_STRUCTURE.md)** - Architecture overview

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Environment Variables

Required environment variables (see `.env.example`):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_STRIPE_PUBLISHABLE_KEY=
```

## 🎨 Design System

- **Primary Color:** Blue (#3B82F6)
- **Secondary Color:** Purple (#9333EA)
- **Success:** Green (#10B981)
- **Warning:** Yellow (#F59E0B)
- **Error:** Red (#EF4444)

## 📝 Current Status

**Phase 1 Complete** - Foundation is ready:
- Authentication system working
- All routes configured
- Basic UI components created
- TypeScript types defined

**Next Steps:**
1. Set up Firestore collections
2. Build profile pages for each role
3. Implement discovery feed
4. Add booking system

## 🤝 Contributing

This is an MVP project. See `docs/windsurf-mvp-build-spec.md` for the complete feature roadmap.

## 📄 License

MIT License - See LICENSE file for details

## 👤 Maintainer

Charlie White - TIES Together Platform

---

**Built with ❤️ for the creative community**
