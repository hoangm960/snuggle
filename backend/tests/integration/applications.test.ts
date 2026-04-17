import express, { Express } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const TEST_SECRET = 'test-secret-key-for-testing';

const mockApplications = [
	{
		id: 'app-1',
		petId: 'pet-1',
		petName: 'Buddy',
		adopterId: 'user-1',
		adopterName: 'John Doe',
		shelterId: 'shelter-1',
		status: 'pending',
		message: 'I would love to adopt this pet',
		appliedAt: new Date(),
	},
	{
		id: 'app-2',
		petId: 'pet-2',
		petName: 'Whiskers',
		adopterId: 'user-2',
		adopterName: 'Jane Smith',
		shelterId: 'shelter-1',
		status: 'approved',
		message: 'Looking for a furry friend',
		appliedAt: new Date(),
	},
];

const createTestApp = (): Express => {
	const app = express();
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	app.get('/api/applications', (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			res.status(401).json({ success: false, error: 'Unauthorized' });
			return;
		}
		res.json({ success: true, data: mockApplications });
	});

	app.get('/api/applications/:id', (req, res) => {
		const application = mockApplications.find(a => a.id === req.params.id);
		if (!application) {
			res.status(404).json({ success: false, error: 'Application not found' });
			return;
		}
		res.json({ success: true, data: application });
	});

	app.post('/api/applications', (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			res.status(401).json({ success: false, error: 'Unauthorized' });
			return;
		}

		const { petId, petName, message } = req.body;
		if (!petId || !petName) {
			res.status(400).json({ success: false, error: 'Missing required fields' });
			return;
		}

		res.status(201).json({ success: true, data: { id: 'app-new', ...req.body, status: 'pending' } });
	});

	app.put('/api/applications/:id/status', (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			res.status(401).json({ success: false, error: 'Unauthorized' });
			return;
		}

		const { status, adminNote } = req.body;
		if (!status || !['approved', 'rejected'].includes(status)) {
			res.status(400).json({ success: false, error: 'Invalid status' });
			return;
		}

		res.json({ success: true, data: { status, adminNote } });
	});

	app.delete('/api/applications/:id', (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			res.status(401).json({ success: false, error: 'Unauthorized' });
			return;
		}

		res.json({ success: true, message: 'Application deleted' });
	});

	return app;
};

describe('Applications Routes', () => {
	let app: Express;
	let authToken: string;

	beforeEach(() => {
		app = createTestApp();
		authToken = jwt.sign({ uid: 'user-123', email: 'test@example.com' }, TEST_SECRET);
	});

	describe('GET /api/applications', () => {
		it('should return all applications with auth', async () => {
			const response = await request(app)
				.get('/api/applications')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveLength(2);
		});

		it('should return 401 without auth', async () => {
			const response = await request(app).get('/api/applications');

			expect(response.status).toBe(401);
		});
	});

	describe('GET /api/applications/:id', () => {
		it('should return application by id', async () => {
			const response = await request(app).get('/api/applications/app-1');

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.petName).toBe('Buddy');
		});

		it('should return 404 for non-existent application', async () => {
			const response = await request(app).get('/api/applications/non-existent');

			expect(response.status).toBe(404);
		});
	});

	describe('POST /api/applications', () => {
		it('should create a new application with auth', async () => {
			const response = await request(app)
				.post('/api/applications')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					petId: 'pet-1',
					petName: 'Buddy',
					message: 'I want to adopt',
				});

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
		});

		it('should return 400 for missing fields', async () => {
			const response = await request(app)
				.post('/api/applications')
				.set('Authorization', `Bearer ${authToken}`)
				.send({ message: 'Missing petId' });

			expect(response.status).toBe(400);
		});
	});

	describe('PUT /api/applications/:id/status', () => {
		it('should update application status', async () => {
			const response = await request(app)
				.put('/api/applications/app-1/status')
				.set('Authorization', `Bearer ${authToken}`)
				.send({ status: 'approved', adminNote: 'Great applicant' });

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it('should return 400 for invalid status', async () => {
			const response = await request(app)
				.put('/api/applications/app-1/status')
				.set('Authorization', `Bearer ${authToken}`)
				.send({ status: 'invalid' });

			expect(response.status).toBe(400);
		});
	});

	describe('DELETE /api/applications/:id', () => {
		it('should delete an application', async () => {
			const response = await request(app)
				.delete('/api/applications/app-1')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});
	});
});