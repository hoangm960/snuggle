import morgan from 'morgan';
import { Request, Response } from 'express';

const stream = {
  write: (message: string) => {
    console.log(message.trim());
    return message;
  },
};

const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env !== 'development';
};

export const logger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);
