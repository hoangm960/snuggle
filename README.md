# Snuggles

A full-stack pet adoption platform where users can browse, list, and adopt pets.

## Description

Snuggles is a pet adoption platform built with Next.js and Express.js. Users can browse available pets, create listings for pets they're rehoming, and manage their adoption profiles. The platform uses Firebase for authentication and Firestore for data storage.

For tech stack and folder structure, see [SPEC.md](./SPEC.md).

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
