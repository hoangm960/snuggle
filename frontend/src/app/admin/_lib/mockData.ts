export const stats = {
	totalUsers: 12857,
	totalMatches: 200,
	totalDonations: 89000,
	totalPending: 25,
};

export const donationTrend = [
	{ month: "Jan", current: 4200, previous: 3100 },
	{ month: "Feb", current: 5100, previous: 3800 },
	{ month: "Mar", current: 4800, previous: 4200 },
	{ month: "Apr", current: 6300, previous: 4900 },
	{ month: "May", current: 7200, previous: 5400 },
	{ month: "Jun", current: 6800, previous: 5800 },
	{ month: "Jul", current: 8400, previous: 6200 },
	{ month: "Aug", current: 9100, previous: 7000 },
	{ month: "Sep", current: 8700, previous: 7600 },
	{ month: "Oct", current: 9800, previous: 8100 },
	{ month: "Nov", current: 10500, previous: 8500 },
	{ month: "Dec", current: 11200, previous: 9000 },
];

export const adoptionWeek = [
	{ day: "Sun", value: 12 },
	{ day: "Mon", value: 28 },
	{ day: "Tue", value: 22 },
	{ day: "Wed", value: 35 },
	{ day: "Thu", value: 30 },
	{ day: "Fri", value: 42 },
	{ day: "Sat", value: 38 },
];

export const speciesSplit = [
	{ name: "Dogs", value: 65, color: "hsl(170 22% 58%)" },
	{ name: "Cats", value: 22, color: "hsl(24 50% 58%)" },
	{ name: "Others", value: 13, color: "hsl(35 60% 70%)" },
];

export const customerMap = [
	{ region: "North", value: 92 },
	{ region: "South", value: 65 },
	{ region: "East", value: 78 },
	{ region: "West", value: 54 },
	{ region: "Central", value: 88 },
];

export type Pet = {
	id: string;
	name: string;
	species: string;
	breed: string;
	age: number;
	gender: "Male" | "Female";
	status: "Available" | "Pending" | "Adopted" | "Foster";
	image: string;
	arrivalDate: string;
	description: string;
};

export const pets: Pet[] = [
	{
		id: "P-001",
		name: "Cooper",
		species: "Dog",
		breed: "Golden Retriever",
		age: 3,
		gender: "Male",
		status: "Available",
		image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
		arrivalDate: "2025-09-12",
		description: "Friendly, energetic and great with kids.",
	},
	{
		id: "P-002",
		name: "Luna",
		species: "Cat",
		breed: "Maine Coon",
		age: 2,
		gender: "Female",
		status: "Pending",
		image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
		arrivalDate: "2025-10-02",
		description: "Gentle and loves quiet homes.",
	},
	{
		id: "P-003",
		name: "Buster",
		species: "Dog",
		breed: "Beagle",
		age: 5,
		gender: "Male",
		status: "Available",
		image: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400",
		arrivalDate: "2025-08-21",
		description: "Loyal companion, loves walks.",
	},
	{
		id: "P-004",
		name: "Mittens",
		species: "Cat",
		breed: "Tabby",
		age: 1,
		gender: "Female",
		status: "Adopted",
		image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400",
		arrivalDate: "2025-07-04",
		description: "Playful kitten, full of curiosity.",
	},
	{
		id: "P-005",
		name: "Ghost",
		species: "Dog",
		breed: "Husky",
		age: 4,
		gender: "Male",
		status: "Foster",
		image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400",
		arrivalDate: "2025-09-30",
		description: "High energy, needs experienced owner.",
	},
	{
		id: "P-006",
		name: "Nala",
		species: "Cat",
		breed: "Siamese",
		age: 3,
		gender: "Female",
		status: "Available",
		image: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400",
		arrivalDate: "2025-10-15",
		description: "Vocal and affectionate.",
	},
	{
		id: "P-007",
		name: "Rocky",
		species: "Dog",
		breed: "Boxer",
		age: 6,
		gender: "Male",
		status: "Pending",
		image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
		arrivalDate: "2025-08-10",
		description: "Calm senior boy looking for a couch.",
	},
	{
		id: "P-008",
		name: "Daisy",
		species: "Dog",
		breed: "Poodle",
		age: 2,
		gender: "Female",
		status: "Available",
		image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
		arrivalDate: "2025-10-08",
		description: "Hypoallergenic and very smart.",
	},
];

export type Request = {
	id: string;
	petId: string;
	petName: string;
	petImage: string;
	applicantName: string;
	applicantAvatar: string;
	date: string;
	species: string;
	amount: number;
	status: "Pending" | "Reviewing" | "Approved" | "Rejected" | "Delivered";
};

export const requests: Request[] = [
	{
		id: "R-1024",
		petId: "P-001",
		petName: "Cooper",
		petImage: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200",
		applicantName: "Nguyen Van A",
		applicantAvatar: "https://i.pravatar.cc/64?img=11",
		date: "2025-12-09 12:53",
		species: "Golden Retriever",
		amount: 1,
		status: "Delivered",
	},
	{
		id: "R-1025",
		petId: "P-002",
		petName: "Luna",
		petImage: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200",
		applicantName: "Elena Rose",
		applicantAvatar: "https://i.pravatar.cc/64?img=47",
		date: "2025-12-10 09:21",
		species: "Maine Coon",
		amount: 1,
		status: "Reviewing",
	},
	{
		id: "R-1026",
		petId: "P-007",
		petName: "Rocky",
		petImage: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200",
		applicantName: "Marcus Chen",
		applicantAvatar: "https://i.pravatar.cc/64?img=33",
		date: "2025-12-11 14:02",
		species: "Boxer",
		amount: 1,
		status: "Pending",
	},
	{
		id: "R-1027",
		petId: "P-003",
		petName: "Buster",
		petImage: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=200",
		applicantName: "Alice Wood",
		applicantAvatar: "https://i.pravatar.cc/64?img=45",
		date: "2025-12-12 10:18",
		species: "Beagle",
		amount: 1,
		status: "Approved",
	},
	{
		id: "R-1028",
		petId: "P-006",
		petName: "Nala",
		petImage: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=200",
		applicantName: "Jonas Wu",
		applicantAvatar: "https://i.pravatar.cc/64?img=12",
		date: "2025-12-13 16:45",
		species: "Siamese",
		amount: 1,
		status: "Pending",
	},
	{
		id: "R-1029",
		petId: "P-008",
		petName: "Daisy",
		petImage: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200",
		applicantName: "Tasha Rivera",
		applicantAvatar: "https://i.pravatar.cc/64?img=48",
		date: "2025-12-14 08:30",
		species: "Poodle",
		amount: 1,
		status: "Reviewing",
	},
];

export type User = {
	id: string;
	name: string;
	email: string;
	avatar: string;
	role: "Adopter" | "Foster" | "Donor" | "Volunteer";
	joined: string;
	matches: number;
	status: "Active" | "Pending" | "Suspended";
};

export const users: User[] = [
	{
		id: "U-001",
		name: "Samantha Hill",
		email: "samantha@example.com",
		avatar: "https://i.pravatar.cc/80?img=44",
		role: "Adopter",
		joined: "2024-03-12",
		matches: 2,
		status: "Active",
	},
	{
		id: "U-002",
		name: "Elias Thorne",
		email: "elias@example.com",
		avatar: "https://i.pravatar.cc/80?img=15",
		role: "Foster",
		joined: "2024-05-04",
		matches: 5,
		status: "Active",
	},
	{
		id: "U-003",
		name: "Sarah Vance",
		email: "sarah@example.com",
		avatar: "https://i.pravatar.cc/80?img=49",
		role: "Donor",
		joined: "2024-07-20",
		matches: 0,
		status: "Active",
	},
	{
		id: "U-004",
		name: "Marcus Sollo",
		email: "marcus@example.com",
		avatar: "https://i.pravatar.cc/80?img=22",
		role: "Volunteer",
		joined: "2024-08-08",
		matches: 1,
		status: "Pending",
	},
	{
		id: "U-005",
		name: "Elena Rose",
		email: "elena@example.com",
		avatar: "https://i.pravatar.cc/80?img=47",
		role: "Adopter",
		joined: "2024-09-15",
		matches: 1,
		status: "Active",
	},
	{
		id: "U-006",
		name: "David Brooks",
		email: "david@example.com",
		avatar: "https://i.pravatar.cc/80?img=8",
		role: "Foster",
		joined: "2024-10-01",
		matches: 3,
		status: "Suspended",
	},
];

export type Donation = {
	id: string;
	donor: string;
	avatar: string;
	amount: number;
	type: "One-time" | "Monthly" | "Annual";
	category: "General" | "Medical" | "Food & Supplies" | "Shelter";
	date: string;
	status: "Completed" | "Pending" | "Refunded";
};

export const donations: Donation[] = [
	{
		id: "D-2041",
		donor: "Sarah Vance",
		avatar: "https://i.pravatar.cc/64?img=49",
		amount: 250,
		type: "Monthly",
		category: "General",
		date: "2025-12-14",
		status: "Completed",
	},
	{
		id: "D-2040",
		donor: "James Porter",
		avatar: "https://i.pravatar.cc/64?img=61",
		amount: 500,
		type: "One-time",
		category: "Medical",
		date: "2025-12-13",
		status: "Completed",
	},
	{
		id: "D-2039",
		donor: "Lily Chen",
		avatar: "https://i.pravatar.cc/64?img=35",
		amount: 100,
		type: "Monthly",
		category: "Food & Supplies",
		date: "2025-12-13",
		status: "Completed",
	},
	{
		id: "D-2038",
		donor: "Robert Nash",
		avatar: "https://i.pravatar.cc/64?img=68",
		amount: 1200,
		type: "Annual",
		category: "Shelter",
		date: "2025-12-12",
		status: "Completed",
	},
	{
		id: "D-2037",
		donor: "Tasha Rivera",
		avatar: "https://i.pravatar.cc/64?img=48",
		amount: 75,
		type: "One-time",
		category: "General",
		date: "2025-12-11",
		status: "Pending",
	},
	{
		id: "D-2036",
		donor: "Marco Stein",
		avatar: "https://i.pravatar.cc/64?img=57",
		amount: 300,
		type: "Monthly",
		category: "Medical",
		date: "2025-12-10",
		status: "Completed",
	},
	{
		id: "D-2035",
		donor: "Anna Flores",
		avatar: "https://i.pravatar.cc/64?img=25",
		amount: 50,
		type: "One-time",
		category: "Food & Supplies",
		date: "2025-12-09",
		status: "Refunded",
	},
	{
		id: "D-2034",
		donor: "Kevin Park",
		avatar: "https://i.pravatar.cc/64?img=52",
		amount: 800,
		type: "Annual",
		category: "General",
		date: "2025-12-08",
		status: "Completed",
	},
];

export const donationByCategory = [
	{ name: "General", value: 42, color: "hsl(170 22% 58%)" },
	{ name: "Medical", value: 28, color: "hsl(24 50% 58%)" },
	{ name: "Food & Supplies", value: 18, color: "hsl(35 60% 70%)" },
	{ name: "Shelter", value: 12, color: "hsl(145 35% 50%)" },
];

export const donationByType = [
	{ month: "Jan", "One-time": 1800, Monthly: 1600, Annual: 800 },
	{ month: "Feb", "One-time": 2200, Monthly: 1900, Annual: 1000 },
	{ month: "Mar", "One-time": 1700, Monthly: 2100, Annual: 1000 },
	{ month: "Apr", "One-time": 2800, Monthly: 2300, Annual: 1200 },
	{ month: "May", "One-time": 3100, Monthly: 2600, Annual: 1500 },
	{ month: "Jun", "One-time": 2900, Monthly: 2700, Annual: 1200 },
	{ month: "Jul", "One-time": 3600, Monthly: 3100, Annual: 1700 },
	{ month: "Aug", "One-time": 4000, Monthly: 3300, Annual: 1800 },
	{ month: "Sep", "One-time": 3800, Monthly: 3200, Annual: 1700 },
	{ month: "Oct", "One-time": 4300, Monthly: 3700, Annual: 1800 },
	{ month: "Nov", "One-time": 4700, Monthly: 3900, Annual: 1900 },
	{ month: "Dec", "One-time": 5000, Monthly: 4200, Annual: 2000 },
];
