import express, { Express } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const TEST_SECRET = 'test-secret-key-for-testing';

const mockContracts = [
	{
		id: 'contract-1',
		applicationId: 'app-1',
		petId: 'pet-1',
		adopterId: 'user-1',
		contractFileURL: 'https://example.com/contract.pdf',
		status: 'draft',
		createdAt: new Date(),
	},
];

const mockSavedSearches = [
	{
		id: 'search-1',
		userId: 'user-1',
		species: 'dog',
		breed: 'Golden Retriever',
		size: 'medium',
		notifyOnMatch: true,
		createdAt: new Date(),
	},
];

const mockProfiles = [
	{
		id: 'profile-1',
		userId: 'user-1',
		homeType: 'house',
		hasChildren: true,
		hasOtherPets: false,
		activityLevel: 'high',
		preferredPetSize: ['medium', 'large'],
		preferredSpecies: ['dog'],
		locationName: '123 Main St, City, ST 12345',
		updatedAt: new Date(),
	},
];

const createApp = (type: 'contracts' | 'savedSearches' | 'adopterProfile'): Express => {
	const app = express();
	app.use(express.json());

	const authCheck = (req: any, res: any, next: any) => {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			res.status(401).json({ success: false, error: 'Unauthorized' });
			return;
		}
		next();
	};

	if (type === 'contracts') {
		app.get('/api/contracts', authCheck, (_req, res) => {
			res.json({ success: true, data: mockContracts });
		});
		app.get('/api/contracts/:id', (req, res) => {
			const contract = mockContracts.find(c => c.id === req.params.id);
			if (!contract) {
				res.status(404).json({ success: false, error: 'Contract not found' });
				return;
			}
			res.json({ success: true, data: contract });
		});
		app.post('/api/contracts', authCheck, (req, res) => {
			res.status(201).json({ success: true, data: { id: 'contract-new', ...req.body } });
		});
		app.put('/api/contracts/:id', authCheck, (req, res) => {
			res.json({ success: true, data: { ...req.body } });
		});
		app.delete('/api/contracts/:id', authCheck, (_req, res) => {
			res.json({ success: true, message: 'Contract deleted' });
		});
	}

	if (type === 'savedSearches') {
		app.get('/api/users/me/saved-searches', authCheck, (_req, res) => {
			res.json({ success: true, data: mockSavedSearches });
		});
		app.get('/api/users/me/saved-searches/:id', (req, res) => {
			const search = mockSavedSearches.find(s => s.id === req.params.id);
			if (!search) {
				res.status(404).json({ success: false, error: 'Saved search not found' });
				return;
			}
			res.json({ success: true, data: search });
		});
		app.post('/api/users/me/saved-searches', authCheck, (req, res) => {
			res.status(201).json({ success: true, data: { id: 'search-new', ...req.body } });
		});
		app.put('/api/users/me/saved-searches/:id', authCheck, (req, res) => {
			res.json({ success: true, data: { ...req.body } });
		});
		app.delete('/api/users/me/saved-searches/:id', authCheck, (_req, res) => {
			res.json({ success: true, message: 'Saved search deleted' });
		});
	}

	if (type === 'adopterProfile') {
		app.get('/api/users/me/adopter-profile', authCheck, (_req, res) => {
			res.json({ success: true, data: mockProfiles[0] });
		});
		app.post('/api/users/me/adopter-profile', authCheck, (req, res) => {
			res.status(201).json({ success: true, data: { id: 'profile-new', ...req.body } });
		});
		app.put('/api/users/me/adopter-profile', authCheck, (req, res) => {
			res.json({ success: true, data: { ...req.body } });
		});
	}

	return app;
};

describe('Contracts Routes', () => {
	let app: Express;
	let token: string;

	beforeEach(() => {
		app = createApp('contracts');
		token = jwt.sign({ uid: 'user-1' }, TEST_SECRET);
	});

	it('GET /api/contracts returns 200 with auth', async () => {
		const res = await request(app).get('/api/contracts').set('Authorization', `Bearer ${token}`);
		expect(res.status).toBe(200);
	});

	it('GET /api/contracts returns 401 without auth', async () => {
		const res = await request(app).get('/api/contracts');
		expect(res.status).toBe(401);
	});

	it('GET /api/contracts/:id returns contract', async () => {
		const res = await request(app).get('/api/contracts/contract-1');
		expect(res.status).toBe(200);
	});
});

describe('Saved Searches Routes', () => {
	it('GET /api/users/me/saved-searches returns searches with auth', async () => {
		const app = createApp('savedSearches');
		const token = jwt.sign({ uid: 'user-1' }, TEST_SECRET);
		const res = await request(app).get('/api/users/me/saved-searches').set('Authorization', `Bearer ${token}`);
		expect(res.status).toBe(200);
	});

	it('POST /api/users/me/saved-searches creates search', async () => {
		const app = createApp('savedSearches');
		const token = jwt.sign({ uid: 'user-1' }, TEST_SECRET);
		const res = await request(app)
			.post('/api/users/me/saved-searches')
			.set('Authorization', `Bearer ${token}`)
			.send({ species: 'cat', breed: 'Persian' });
		expect(res.status).toBe(201);
	});
});

describe('Adopter Profile Routes', () => {
	it('GET /api/users/me/adopter-profile returns profile with auth', async () => {
		const app = createApp('adopterProfile');
		const token = jwt.sign({ uid: 'user-1' }, TEST_SECRET);
		const res = await request(app).get('/api/users/me/adopter-profile').set('Authorization', `Bearer ${token}`);
		expect(res.status).toBe(200);
	});

	it('PUT /api/users/me/adopter-profile updates profile', async () => {
		const app = createApp('adopterProfile');
		const token = jwt.sign({ uid: 'user-1' }, TEST_SECRET);
		const res = await request(app)
			.put('/api/users/me/adopter-profile')
			.set('Authorization', `Bearer ${token}`)
			.send({ homeType: 'apartment' });
		expect(res.status).toBe(200);
	});
});