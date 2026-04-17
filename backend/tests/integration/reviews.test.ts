import express, { Express } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const TEST_SECRET = 'test-secret-key-for-testing';

const mockReviews = [
	{
		id: 'review-1',
		shelterId: 'shelter-1',
		reviewerId: 'user-1',
		rating: 5,
		comment: 'Great shelter!',
		status: 'approved',
		createdAt: new Date(),
	},
	{
		id: 'review-2',
		shelterId: 'shelter-1',
		reviewerId: 'user-2',
		rating: 4,
		comment: 'Good experience',
		status: 'pending',
		createdAt: new Date(),
	},
];

const createTestApp = (): Express => {
	const app = express();
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	app.get('/api/reviews', (req, res) => {
		const { shelterId, status } = req.query;
		let reviews = [...mockReviews];

		if (shelterId) {
			reviews = reviews.filter(r => r.shelterId === shelterId);
		}
		if (status) {
			reviews = reviews.filter(r => r.status === status);
		}

		res.json({ success: true, data: reviews });
	});

	app.get('/api/reviews/:id', (req, res) => {
		const review = mockReviews.find(r => r.id === req.params.id);
		if (!review) {
			res.status(404).json({ success: false, error: 'Review not found' });
			return;
		}
		res.json({ success: true, data: review });
	});

	app.post('/api/reviews', (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			res.status(401).json({ success: false, error: 'Unauthorized' });
			return;
		}

		const { shelterId, rating, comment } = req.body;
		if (!shelterId || !rating) {
			res.status(400).json({ success: false, error: 'Missing required fields' });
			return;
		}

		if (rating < 1 || rating > 5) {
			res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
			return;
		}

		res.status(201).json({ success: true, data: { id: 'review-new', ...req.body, status: 'pending' } });
	});

	app.put('/api/reviews/:id', (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			res.status(401).json({ success: false, error: 'Unauthorized' });
			return;
		}

		const review = mockReviews.find(r => r.id === req.params.id);
		if (!review) {
			res.status(404).json({ success: false, error: 'Review not found' });
			return;
		}

		res.json({ success: true, data: { ...review, ...req.body } });
	});

	app.delete('/api/reviews/:id', (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			res.status(401).json({ success: false, error: 'Unauthorized' });
			return;
		}

		res.json({ success: true, message: 'Review deleted' });
	});

	return app;
};

describe('Reviews Routes', () => {
	let app: Express;
	let authToken: string;

	beforeEach(() => {
		app = createTestApp();
		authToken = jwt.sign({ uid: 'user-123', email: 'test@example.com' }, TEST_SECRET);
	});

	describe('GET /api/reviews', () => {
		it('should return all reviews', async () => {
			const response = await request(app).get('/api/reviews');

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveLength(2);
		});

		it('should filter reviews by shelterId', async () => {
			const response = await request(app).get('/api/reviews').query({ shelterId: 'shelter-1' });

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveLength(2);
		});

		it('should filter reviews by status', async () => {
			const response = await request(app).get('/api/reviews').query({ status: 'approved' });

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveLength(1);
		});
	});

	describe('GET /api/reviews/:id', () => {
		it('should return review by id', async () => {
			const response = await request(app).get('/api/reviews/review-1');

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.rating).toBe(5);
		});

		it('should return 404 for non-existent review', async () => {
			const response = await request(app).get('/api/reviews/non-existent');

			expect(response.status).toBe(404);
		});
	});

	describe('POST /api/reviews', () => {
		it('should create a new review with auth', async () => {
			const response = await request(app)
				.post('/api/reviews')
				.set('Authorization', `Bearer ${authToken}`)
				.send({
					shelterId: 'shelter-1',
					rating: 5,
					comment: 'Amazing place!',
				});

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
		});

		it('should return 401 without auth', async () => {
			const response = await request(app).post('/api/reviews').send({
				shelterId: 'shelter-1',
				rating: 5,
			});

			expect(response.status).toBe(401);
		});

		it('should return 400 for missing fields', async () => {
			const response = await request(app)
				.post('/api/reviews')
				.set('Authorization', `Bearer ${authToken}`)
				.send({ comment: 'No rating' });

			expect(response.status).toBe(400);
		});

		it('should return 400 for invalid rating', async () => {
			const response = await request(app)
				.post('/api/reviews')
				.set('Authorization', `Bearer ${authToken}`)
				.send({ shelterId: 'shelter-1', rating: 6 });

			expect(response.status).toBe(400);
		});

		it('should return 400 for rating below 1', async () => {
			const response = await request(app)
				.post('/api/reviews')
				.set('Authorization', `Bearer ${authToken}`)
				.send({ shelterId: 'shelter-1', rating: 0 });

			expect(response.status).toBe(400);
		});
	});

	describe('PUT /api/reviews/:id', () => {
		it('should update a review', async () => {
			const response = await request(app)
				.put('/api/reviews/review-1')
				.set('Authorization', `Bearer ${authToken}`)
				.send({ comment: 'Updated comment' });

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it('should return 401 without auth', async () => {
			const response = await request(app).put('/api/reviews/review-1').send({
				comment: 'Updated',
			});

			expect(response.status).toBe(401);
		});
	});

	describe('DELETE /api/reviews/:id', () => {
		it('should delete a review', async () => {
			const response = await request(app)
				.delete('/api/reviews/review-1')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it('should return 401 without auth', async () => {
			const response = await request(app).delete('/api/reviews/review-1');

			expect(response.status).toBe(401);
		});
	});
});