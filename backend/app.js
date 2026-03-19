import express from "express";
import cors from "cors";

// middlewares
import errorMiddleware from "./middlewares/error.js";
import userRoute from "./routers/userRoute.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/users", userRoute);

app.use(errorMiddleware);

export default app;
