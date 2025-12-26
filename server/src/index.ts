import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router } from "./routes";

// Load environment variables
dotenv.config({ path: '../.env' }); // Look in root for .env

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mount routes
app.use("/api/sources", router);

app.get("/", (req, res) => {
  res.send("Manga Delight Novel Scraper API is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
