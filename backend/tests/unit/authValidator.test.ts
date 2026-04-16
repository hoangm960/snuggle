import { registerSchema, loginSchema, updateUserProfileSchema } from '../../src/utils/validators/authValidator';

describe('Auth Validators', () => {
	describe('registerSchema', () => {
		it('should validate valid registration data', () => {
			const validData = {
				email: 'test@example.com',
				password: 'password123',
				displayName: 'Test User',
			};

			const result = registerSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('should reject invalid email', () => {
			const invalidData = {
				email: 'invalid-email',
				password: 'password123',
			};

			const result = registerSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it('should reject short password', () => {
			const invalidData = {
				email: 'test@example.com',
				password: 'short',
			};

			const result = registerSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});
	});

	describe('loginSchema', () => {
		it('should validate valid login data', () => {
			const validData = {
				email: 'test@example.com',
				password: 'password123',
			};

			const result = loginSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('should reject missing email', () => {
			const invalidData = {
				password: 'password123',
			};

			const result = loginSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});
	});

	describe('updateUserProfileSchema', () => {
		it('should validate empty update data', () => {
			const validData = {};

			const result = updateUserProfileSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('should validate partial update data', () => {
			const validData = {
				displayName: 'New Name',
			};

			const result = updateUserProfileSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});
});