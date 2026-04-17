import express, { Express } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

export interface TestApp {
	app: Express;
	agent: request.SuperAgentTest;
}

export const createTestApp = async (): Promise<TestApp> => {
	const app = express();
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	app.get('/health', (_req, res) => {
		res.json({ status: 'ok', timestamp: new Date().toISOString() });
	});

	app.use('/api/auth', (await import('../src/routes/auth')).default);
	app.use('/api/pets', (await import('../src/routes/pets')).default);
	app.use('/api/shelters', (await import('../src/routes/shelters')).default);
	app.use('/api/applications', (await import('../src/routes/adoptionApplications')).default);
	app.use('/api/contracts', (await import('../src/routes/adoptionContracts')).default);
	app.use('/api/users/me/saved-searches', (await import('../src/routes/savedSearches')).default);
	app.use('/api/users/me/adopter-profile', (await import('../src/routes/adopterProfile')).default);
	app.use('/api/reviews', (await import('../src/routes/reviews')).default);

	const agent = request.agent(app);
	return { app, agent };
};

export const createTestToken = (payload: object): string => {
	return jwt.sign(payload, 'test-secret', { expiresIn: '1h' });
};

export const createUserToken = (uid: string = 'test-user-uid', email?: string) => {
	return createTestToken({ uid, email: email || 'test@example.com' });
};

export const createAdminToken = () => {
	return createTestToken({ uid: 'admin-uid', email: 'admin@example.com', role: 'admin' });
};

export const createAuthHeader = (token: string) => {
	return { Authorization: `Bearer ${token}` };
};