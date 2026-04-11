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

## API Endpoints

### Health Check

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Server health status | No |

### Pets

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/pets` | List all pets | No |
| GET | `/api/pets/:id` | Get single pet | No |
| POST | `/api/pets` | Create pet | Required |
| PUT | `/api/pets/:id` | Update pet | Required |
| DELETE | `/api/pets/:id` | Delete pet | Required |

#### Health Records

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/pets/:petId/health-records` | List pet health records | No |
| POST | `/api/pets/:petId/health-records` | Create health record | Required |
| DELETE | `/api/pets/:petId/health-records/:id` | Delete health record | Required |

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/google` | Google sign-in | No |
| POST | `/api/auth/facebook` | Facebook sign-in | No |
| POST | `/api/auth/resend-verification` | Resend verification email | No |
| POST | `/api/auth/verify-email` | Verify email | No |
| GET | `/api/auth/me` | Verify JWT token | Required |
| POST | `/api/auth/profile` | Create user profile | Required |
| GET | `/api/auth/profile` | Get user profile | Required |
| PUT | `/api/auth/profile` | Update user profile | Required |
| DELETE | `/api/auth/account` | Delete user account | Required |

### Shelters

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/shelters` | List all shelters | No |
| GET | `/api/shelters/:id` | Get single shelter | No |
| POST | `/api/shelters` | Create shelter | Required |
| PUT | `/api/shelters/:id` | Update shelter | Required |
| DELETE | `/api/shelters/:id` | Delete shelter | Required |

### Adoption Applications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/applications` | List all applications | Required |
| GET | `/api/applications/:id` | Get single application | Required |
| POST | `/api/applications` | Create application | Required |
| PUT | `/api/applications/:id/status` | Update application status | Required |
| DELETE | `/api/applications/:id` | Delete application | Required |

### Adoption Contracts

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/contracts` | List all contracts | Required |
| GET | `/api/contracts/:id` | Get single contract | No |
| POST | `/api/contracts` | Create contract | Required |
| PUT | `/api/contracts/:id/sign` | Sign contract | Required |
| PUT | `/api/contracts/:id/archive` | Archive contract | Required |

### Reviews

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/reviews/:shelterId` | Get shelter reviews | No |
| POST | `/api/reviews/:shelterId` | Create review | Required |
| PUT | `/api/reviews/:shelterId/:id/status` | Update review status | Required |

### Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/users` | List all users (search/filter/paginate) | Admin |
| GET | `/api/admin/users/:id` | Get user + activity history | Admin |
| PUT | `/api/admin/users/:id` | Update user role or status | Admin |

### User Endpoints

#### Adopter Profile

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/me/adopter-profile` | Get adopter profile | Required |
| POST | `/api/users/me/adopter-profile` | Create adopter profile | Required |
| PUT | `/api/users/me/adopter-profile` | Update adopter profile | Required |

#### Saved Searches

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/me/saved-searches` | List saved searches | Required |
| POST | `/api/users/me/saved-searches` | Create saved search | Required |
| DELETE | `/api/users/me/saved-searches/:id` | Delete saved search | Required |

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
