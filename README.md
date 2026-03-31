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
│   │   ├── app/           # Next.js App Router pages
│   │   │   ├── login/     # Login page
│   │   │   ├── register/  # Registration page
│   │   │   ├── pets/      # Pet listings page
│   │   │   ├── pets/[id]/ # Individual pet page
│   │   │   └── admin/     # Admin dashboard
│   │   ├── hooks/         # Custom React hooks
│   │   │   ├── useAuth.ts # Authentication hook
│   │   │   └── usePets.ts # Pets data hook
│   │   ├── lib/           # Utilities
│   │   │   ├── firebase.ts
│   │   │   └── api.ts
│   │   └── types/         # TypeScript type definitions
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── routes/        # API routes
    │   │   ├── pets.ts
    │   │   └── auth.ts
    │   ├── controllers/   # Route handlers
    │   │   ├── petController.ts
    │   │   └── authController.ts
    │   ├── middleware/    # Express middleware
    │   │   ├── auth.ts
    │   │   └── errorHandler.ts
    │   ├── config/        # Configuration
    │   │   └── firebase.ts
    │   ├── types/         # TypeScript type definitions
    │   ├── utils/         # Utility functions
    │   └── index.ts       # Server entry point
    └── package.json
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
PORT=3001
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

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

## API Endpoints

### Pets

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/pets` | List all pets | No |
| GET | `/pets/:id` | Get single pet | No |
| POST | `/pets` | Create pet | Required |
| PUT | `/pets/:id` | Update pet | Required |
| DELETE | `/pets/:id` | Delete pet | Required |

#### Query Parameters

- `?species=` - Filter by species (e.g., "dog", "cat")
- `?status=` - Filter by status (e.g., "available", "adopted")
- `?shelterId=` - Filter by shelter ID

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/auth/me` | Verify JWT token | Required |
| POST | `/auth/profile` | Create user profile | Required |
| GET | `/auth/profile` | Get user profile | Required |
| PUT | `/auth/profile` | Update user profile | Required |

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
