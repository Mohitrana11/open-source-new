import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
dotenv.config({ path: "./config/.env" });

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
