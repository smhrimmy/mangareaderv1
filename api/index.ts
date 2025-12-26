import express from "express";
import cors from "cors";
import { router } from "../../server/src/routes";

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount the router
app.use("/api", router);

// Fallback for debugging
app.use("*", (req, res) => {
  res.status(404).json({ 
    error: "Not Found", 
    path: req.originalUrl,
    message: "The requested API endpoint does not exist." 
  });
});

export const config = {
  runtime: 'nodejs', // Force Node.js runtime
};

export default app;
