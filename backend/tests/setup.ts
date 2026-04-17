jest.setTimeout(30000);

jest.mock('../src/config/firebase', () => ({
	auth: {
		getUser: jest.fn(),
		getUserByEmail: jest.fn(),
		createCustomToken: jest.fn().mockResolvedValue('mock-custom-token'),
		createUser: jest.fn(),
		updateUser: jest.fn(),
		deleteUser: jest.fn(),
		verifyIdToken: jest.fn(),
		listUsers: jest.fn().mockResolvedValue({ users: [] }),
	},
	db: {
		collection: jest.fn().mockReturnValue({
			doc: jest.fn().mockReturnValue({
				get: jest.fn().mockResolvedValue({ exists: false, id: 'mock-id', data: () => ({}) }),
				set: jest.fn().mockResolvedValue(undefined),
				update: jest.fn().mockResolvedValue(undefined),
				delete: jest.fn().mockResolvedValue(undefined),
			}),
			where: jest.fn().mockReturnValue({
				get: jest.fn().mockResolvedValue({ docs: [] }),
			}),
			orderBy: jest.fn().mockReturnValue({
				get: jest.fn().mockResolvedValue({ docs: [] }),
			}),
			limit: jest.fn().mockReturnValue({
				get: jest.fn().mockResolvedValue({ docs: [] }),
			}),
			get: jest.fn().mockResolvedValue({ docs: [] }),
			add: jest.fn().mockResolvedValue({ id: 'mock-id' }),
		}),
	},
	storage: {
		bucket: jest.fn().mockReturnValue({
			file: jest.fn().mockReturnValue({
				save: jest.fn().mockResolvedValue(undefined),
				delete: jest.fn().mockResolvedValue(undefined),
				getSignedUrl: jest.fn().mockResolvedValue('https://mock.url/file'),
			}),
		}),
	},
	default: {
		apps: [],
		initializeApp: jest.fn(),
		auth: jest.fn(),
		firestore: jest.fn(),
		storage: jest.fn(),
	},
}));

global.beforeEach(() => {
	jest.clearAllMocks();
});