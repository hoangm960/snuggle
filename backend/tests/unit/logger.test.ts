import { errorLogger } from "../../src/utils/logger";

describe("errorLogger", () => {
	let consoleErrorSpy: jest.SpyInstance;
	let consoleWarnSpy: jest.SpyInstance;
	let consoleLogSpy: jest.SpyInstance;

	beforeEach(() => {
		consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
		consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
		consoleWarnSpy.mockRestore();
		consoleLogSpy.mockRestore();
	});

	it("should log error level with correct format", () => {
		errorLogger.error({ message: "Something went wrong" });

		expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
		const calledWith = consoleErrorSpy.mock.calls[0][0] as string;
		expect(calledWith).toContain("[ERROR]");
		expect(calledWith).toContain('message="Something went wrong"');
	});

	it("should log warn level with correct format", () => {
		errorLogger.warn({ message: "Warning" });

		expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
		const calledWith = consoleWarnSpy.mock.calls[0][0] as string;
		expect(calledWith).toContain("[WARN]");
		expect(calledWith).toContain('message="Warning"');
	});

	it("should log info level with correct format", () => {
		errorLogger.info({ message: "Info message" });

		expect(consoleLogSpy).toHaveBeenCalledTimes(1);
		const calledWith = consoleLogSpy.mock.calls[0][0] as string;
		expect(calledWith).toContain("[INFO]");
		expect(calledWith).toContain('message="Info message"');
	});

	it("should include timestamp in ISO format", () => {
		errorLogger.error({ message: "test" });

		const calledWith = consoleErrorSpy.mock.calls[0][0] as string;
		expect(calledWith).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
	});

	it("should include all provided fields", () => {
		errorLogger.error({
			message: "error",
			stack: "Error: test\n    at line 1",
			statusCode: 500,
			errorCode: "INTERNAL_ERROR",
			path: "/api/test",
			method: "GET",
		});

		const calledWith = consoleErrorSpy.mock.calls[0][0] as string;
		expect(calledWith).toContain('stack="Error: test\\n    at line 1"');
		expect(calledWith).toContain("statusCode=500");
		expect(calledWith).toContain('errorCode="INTERNAL_ERROR"');
		expect(calledWith).toContain('path="/api/test"');
		expect(calledWith).toContain('method="GET"');
	});

	it("should filter out undefined fields", () => {
		errorLogger.error({
			message: "test",
			stack: undefined,
			statusCode: undefined,
		});

		const calledWith = consoleErrorSpy.mock.calls[0][0] as string;
		expect(calledWith).toContain('message="test"');
		expect(calledWith).not.toContain("stack=");
		expect(calledWith).not.toContain("statusCode=");
	});
});
