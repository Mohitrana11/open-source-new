import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;
dotenv.config({ path: "./config/.env" });
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
