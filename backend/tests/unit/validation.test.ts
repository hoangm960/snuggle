import { validate, validateQuery } from '../../src/middleware/validate';
import { Request, Response, NextFunction } from 'express';

describe('Validation Middleware', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let mockNext: NextFunction;

	beforeEach(() => {
		mockRequest = {
			body: {},
			query: {},
		};
		mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
		mockNext = jest.fn();
	});

	describe('validate', () => {
		it('should call next for valid body', () => {
			const schema = {
				parse: jest.fn().mockReturnValue({ name: 'Test' }),
			};

			mockRequest.body = { name: 'Test' };

			validate(schema as any)(mockRequest as Request, mockResponse as Response, mockNext);

			expect(mockNext).toHaveBeenCalled();
		});

		it('should call next for invalid body (error passed to next)', () => {
			const schema = {
				parse: jest.fn().mockImplementation(() => {
					throw new Error('Invalid');
				}),
			};

			mockRequest.body = { invalid: 'data' };

			validate(schema as any)(mockRequest as Request, mockResponse as Response, mockNext);

			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});

	describe('validateQuery', () => {
		it('should call next for valid query', () => {
			const schema = {
				parse: jest.fn().mockReturnValue({ status: 'active' }),
			};

			mockRequest.query = { status: 'active' };

			validateQuery(schema as any)(mockRequest as Request, mockResponse as Response, mockNext);

			expect(mockNext).toHaveBeenCalled();
		});

		it('should pass error to next for invalid query', () => {
			const schema = {
				parse: jest.fn().mockImplementation(() => {
					throw new Error('Invalid query');
				}),
			};

			mockRequest.query = { invalid: 'query' };

			validateQuery(schema as any)(mockRequest as Request, mockResponse as Response, mockNext);

			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
		});
	});
});