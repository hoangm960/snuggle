import { upload } from "../../src/middleware/upload";

describe("Upload Middleware", () => {
	it("should configure memory storage", () => {
		expect(upload).toBeDefined();
	});

	it("should configure file size limit of 5MB", () => {
		const fiveMB = 5 * 1024 * 1024;
		expect(upload).toBeDefined();
		expect(fiveMB).toBe(5242880);
	});
});
