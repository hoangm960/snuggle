# Snuggles

A full-stack pet adoption platform where users can browse, list, and adopt pets.

## Description

Snuggles is a pet adoption platform built with Next.js and Express.js. Users can browse available pets, create listings for pets they're rehoming, and manage their adoption profiles. The platform uses Firebase for authentication and Firestore for data storage.

## Tech Stack

### Frontend

- **Framework**: Next.js 14
- **Language**: TypeScript
- **UI**: React 18, Tailwind CSS
- **Animation**: Framer Motion
- **Auth**: Firebase Authentication
- **HTTP Client**: Axios

### Backend

- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Auth**: Firebase Admin SDK
- **Scraping**: Puppeteer

## Folder Structure

```
snuggles/
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   │   ├── login/           # Login page
│   │   │   ├── register/         # Registration page
│   │   │   ├── pets/            # Pet listings page
│   │   │   ├── pets/[id]/       # Individual pet page
│   │   │   ├── admin/           # Admin dashboard
│   │   │   ├── layout.tsx       # Root layout
│   │   │   ├── page.tsx         # Landing page
│   │   │   └── globals.css      # Global styles
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useAuth.ts       # Authentication hook
│   │   │   └── usePets.ts       # Pets data hook
│   │   ├── lib/                 # Utilities
│   │   │   ├── firebase.ts      # Firebase client config
│   │   │   └── api.ts           # API client
│   │   └── types/               # TypeScript type definitions
│   │       └── index.ts
│   ├── public/                  # Static assets
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── tsconfig.json
│
└── backend/
    ├── src/
    │   ├── config/              # Configuration
    │   │   └── firebase.ts      # Firebase Admin SDK config
    │   ├── controllers/         # Route handlers
    │   │   ├── adminController.ts
    │   │   ├── adoptionApplicationController.ts
    │   │   ├── adoptionContractController.ts
    │   │   ├── adopterProfileController.ts
    │   │   ├── authController.ts
    │   │   ├── healthRecordController.ts
    │   │   ├── petController.ts
    │   │   ├── reviewController.ts
    │   │   ├── savedSearchController.ts
    │   │   └── shelterController.ts
    │   ├── middleware/          # Express middleware
    │   │   ├── admin.ts         # Admin role check
    │   │   ├── asyncHandler.ts   # Async wrapper
    │   │   ├── auth.ts          # JWT authentication
    │   │   ├── errorHandler.ts  # Error handling
    │   │   └── validate.ts      # Request validation
    │   ├── routes/              # API routes
    │   │   ├── admin.ts
    │   │   ├── adoptionApplications.ts
    │   │   ├── adoptionContracts.ts
    │   │   ├── adopterProfile.ts
    │   │   ├── auth.ts
    │   │   ├── pets.ts
    │   │   ├── reviews.ts
    │   │   ├── savedSearches.ts
    │   │   └── shelters.ts
    │   ├── scripts/             # Utility scripts
    │   │   └── createAdmin.ts
    │   ├── types/               # TypeScript type definitions
    │   │   └── index.ts
    │   ├── utils/               # Utility functions
    │   │   ├── firebaseError.ts  # Firebase error mapping
    │   │   ├── logger.ts        # Logging utility
    │   │   └── validators/      # Zod validation schemas
    │   │       ├── authValidator.ts
    │   │       ├── otherValidator.ts
    │   │       └── petValidator.ts
    │   └── index.ts             # Server entry point
    ├── tests/                   # Test files
    │   ├── integration/         # Integration tests
    │   │   ├── admin.test.ts
    │   │   ├── applications.test.ts
    │   │   ├── auth.test.ts
    │   │   ├── pets.test.ts
    │   │   ├── repositories.test.ts
    │   │   ├── reviews.test.ts
    │   │   └── shelters.test.ts
    │   ├── unit/                # Unit tests
    │   │   ├── authValidator.test.ts
    │   │   ├── petValidator.test.ts
    │   │   └── validation.test.ts
    │   ├── app.ts               # Test app setup
    │   ├── setup.ts             # Test setup
    │   └── utils.ts             # Test utilities
    ├── package.json
    ├── tsconfig.json
    ├── jest.config.js
    └── .env                     # Environment variables
```

## Setup

### Prerequisites

- Node.js 18+
- Yarn
- Firebase project

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
cd frontend
yarn install

# Install backend dependencies
cd ../backend
yarn install
```

### 2. Configure Firebase

Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com):

1. Enable **Authentication** (Email/Password provider)
2. Enable **Firestore Database**
3. Create a service account and download the private key

### 3. Environment Variables

#### Frontend (`.env.local`)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Backend (`.env`)

```env
FIREBASE_API_KEY=your-firebase-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_FILE=./service-account.json
PORT=3001
NODE_ENV=development
```

> **Note:** Create a service account in Firebase Console and download the JSON key. Place it in the `backend/` directory and rename it to `service-account.json` (or update the path in `FIREBASE_SERVICE_ACCOUNT_FILE`).

### Specification

See [SPEC.md](./SPEC.md) for detailed system specifications, database schema, and feature documentation.

### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
yarn dev

# Terminal 2 - Frontend
cd frontend
yarn dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Testing

### Test Commands

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

## API Reference

See [SPEC.md](./SPEC.md#3-api-reference) for full API documentation including request/response examples and error codes.

## Building for Production

```bash
# Build frontend
cd frontend
yarn build

# Build backend
cd ../backend
yarn build
yarn start
```

## License

MIT
