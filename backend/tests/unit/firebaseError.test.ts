import { translateFirebaseError } from "../../src/utils/firebaseError";
import { AppError, ErrorCode } from "../../src/middleware/errorHandler";

const makeError = (code: string): Error => {
	const error = new Error("Firebase error");
	(error as any).code = code;
	return error;
};

describe("translateFirebaseError", () => {
	it("should map permission-denied to 403", () => {
		const result = translateFirebaseError(makeError("permission-denied"));

		expect(result).toBeInstanceOf(AppError);
		expect(result.statusCode).toBe(403);
		expect(result.errorCode).toBe(ErrorCode.FIREBASE_ERROR);
	});

	it("should map not-found to 404", () => {
		const result = translateFirebaseError(makeError("not-found"));

		expect(result.statusCode).toBe(404);
		expect(result.errorCode).toBe(ErrorCode.NOT_FOUND);
	});

	it("should map no such document to 404", () => {
		const result = translateFirebaseError(makeError("no such document"));

		expect(result.statusCode).toBe(404);
	});

	it("should map already-exists to 409", () => {
		const result = translateFirebaseError(makeError("already-exists"));

		expect(result.statusCode).toBe(409);
		expect(result.errorCode).toBe(ErrorCode.CONFLICT);
	});

	it("should map already in use to 409", () => {
		const result = translateFirebaseError(makeError("already in use"));

		expect(result.statusCode).toBe(409);
	});

	it("should map invalid-argument to 400", () => {
		const result = translateFirebaseError(makeError("invalid-argument"));

		expect(result.statusCode).toBe(400);
		expect(result.errorCode).toBe(ErrorCode.BAD_REQUEST);
	});

	it("should map invalid argument to 400", () => {
		const result = translateFirebaseError(makeError("invalid argument"));

		expect(result.statusCode).toBe(400);
	});

	it("should map cancelled to 500", () => {
		const result = translateFirebaseError(makeError("cancelled"));

		expect(result.statusCode).toBe(500);
	});

	it("should map deadline-exceeded to 504", () => {
		const result = translateFirebaseError(makeError("deadline-exceeded"));

		expect(result.statusCode).toBe(504);
		expect(result.errorCode).toBe(ErrorCode.EXTERNAL_SERVICE_ERROR);
	});

	it("should map unauthenticated to 401", () => {
		const result = translateFirebaseError(makeError("unauthenticated"));

		expect(result.statusCode).toBe(401);
		expect(result.errorCode).toBe(ErrorCode.UNAUTHORIZED);
	});

	it("should map auth/ prefix to 401", () => {
		const result = translateFirebaseError(makeError("auth/operation-not-allowed"));

		expect(result.statusCode).toBe(401);
	});

	it("should map resource-exhausted to 429", () => {
		const result = translateFirebaseError(makeError("resource-exhausted"));

		expect(result.statusCode).toBe(429);
	});

	it("should return default 500 for unknown errors", () => {
		const result = translateFirebaseError(makeError("some-unknown-error"));

		expect(result.statusCode).toBe(500);
		expect(result.errorCode).toBe(ErrorCode.FIREBASE_ERROR);
	});

	it("should extract code from errorInfo.code when code field missing", () => {
		const error = new Error("db error");
		(error as any).errorInfo = { code: "not-found" };

		const result = translateFirebaseError(error);

		expect(result.statusCode).toBe(404);
	});

	it("should prefer code over errorInfo.code", () => {
		const error = new Error("db error");
		(error as any).code = "already-exists";
		(error as any).errorInfo = { code: "not-found" };

		const result = translateFirebaseError(error);

		expect(result.statusCode).toBe(409);
	});
});
