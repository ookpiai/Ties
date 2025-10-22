# TIES Together - Project Structure

## Directory Organization

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── booking/         # Booking-related components
│   ├── common/          # Shared components (buttons, cards, etc.)
│   ├── dashboard/       # Dashboard widgets
│   ├── messaging/       # Chat and messaging components
│   ├── profile/         # Profile and portfolio components
│   ├── search/          # Search and discovery components
│   ├── studio/          # TIES Studio components
│   └── payments/        # Payment and subscription components
├── pages/               # Main page components
│   ├── auth/            # Login, signup, role selection
│   ├── dashboard/       # User dashboard by role
│   ├── discover/        # Discovery feed
│   ├── profile/         # User profiles
│   ├── bookings/        # Booking management
│   ├── studio/          # TIES Studio workspace
│   ├── messages/        # Messaging interface
│   └── admin/           # Admin panel
├── contexts/            # React contexts for state management
│   ├── AuthContext.tsx
│   ├── UserContext.tsx
│   └── StudioContext.tsx
├── hooks/               # Custom React hooks
├── services/            # API and external service integrations
│   ├── firebase.ts
│   ├── stripe.ts
│   └── api.ts
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── constants/           # App constants and config

```

## Key Technologies

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** TailwindCSS v4
- **Routing:** React Router v7
- **Auth:** Firebase Authentication
- **Database:** Firestore
- **Payments:** Stripe Connect
- **Storage:** Firebase Storage
- **State:** React Context + Hooks

## Phase 1 Implementation Priority

1. Authentication system with role selection
2. User profiles for each role type
3. Discovery feed with basic search
4. Simple booking request system
5. In-app messaging foundation
