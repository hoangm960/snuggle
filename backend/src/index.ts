import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { logger } from "./utils/logger";
import { errorHandler, notFound } from "./middleware/errorHandler";
import petRoutes from "./routes/pets";
import authRoutes from "./routes/auth";
import shelterRoutes from "./routes/shelters";
import applicationRoutes from "./routes/adoptionApplications";
import contractRoutes from "./routes/adoptionContracts";
import savedSearchRoutes from "./routes/savedSearches";
import adopterProfileRoutes from "./routes/adopterProfile";
import reviewRoutes from "./routes/reviews";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use("/api/pets", petRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/shelters", shelterRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/users/me/saved-searches", savedSearchRoutes);
app.use("/api/users/me/adopter-profile", adopterProfileRoutes);
app.use("/api/reviews", reviewRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

export default app;
