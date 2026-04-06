import { AppError, ErrorCode } from '../middleware/errorHandler';

interface FirebaseError extends Error {
	code?: string;
	errorInfo?: {
		code: string;
	};
}

export const translateFirebaseError = (error: Error): AppError => {
	const firebaseError = error as FirebaseError;
	const code = firebaseError.code || firebaseError.errorInfo?.code || '';

	if (code.includes('permission-denied')) {
		return new AppError('Permission denied', 403, ErrorCode.FIREBASE_ERROR);
	}
	if (code.includes('not-found') || code.includes('no such document')) {
		return new AppError('Resource not found', 404, ErrorCode.NOT_FOUND);
	}
	if (code.includes('already-exists') || code.includes('already in use')) {
		return new AppError('Resource already exists', 409, ErrorCode.CONFLICT);
	}
	if (code.includes('invalid-argument') || code.includes('invalid argument')) {
		return new AppError('Invalid request parameters', 400, ErrorCode.BAD_REQUEST);
	}
	if (code.includes('cancelled')) {
		return new AppError('Operation cancelled', 500, ErrorCode.FIREBASE_ERROR);
	}
	if (code.includes('deadline-exceeded')) {
		return new AppError('Operation timed out', 504, ErrorCode.EXTERNAL_SERVICE_ERROR);
	}
	if (code.includes('unauthenticated') || code.includes('auth')) {
		return new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);
	}
	if (code.includes('resource-exhausted')) {
		return new AppError('Resource limit exceeded', 429, ErrorCode.EXTERNAL_SERVICE_ERROR);
	}

	return new AppError('Database operation failed', 500, ErrorCode.FIREBASE_ERROR);
};
