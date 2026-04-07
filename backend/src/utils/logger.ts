import morgan from "morgan";

const stream = {
	write: (message: string) => {
		console.log(message.trim());
		return message;
	},
};

const skip = () => {
	const env = process.env.NODE_ENV || "development";
	return env !== "development";
};

export const logger = morgan(":method :url :status :res[content-length] - :response-time ms", {
	stream,
	skip,
});

interface LogData {
	message: string;
	stack?: string;
	statusCode?: number;
	errorCode?: string;
	path?: string;
	method?: string;
	[key: string]: unknown;
}

const formatLog = (level: string, data: LogData): string => {
	const timestamp = new Date().toISOString();
	const base = `[${level}] ${timestamp}`;

	const fields = Object.entries(data)
		.filter(([_, value]) => value !== undefined)
		.map(([key, value]) => `${key}=${JSON.stringify(value)}`)
		.join(" ");

	return `${base} ${fields}`;
};

export const errorLogger = {
	error: (data: LogData): void => {
		console.error(formatLog("ERROR", data));
	},
	warn: (data: LogData): void => {
		console.warn(formatLog("WARN", data));
	},
	info: (data: LogData): void => {
		console.log(formatLog("INFO", data));
	},
};
