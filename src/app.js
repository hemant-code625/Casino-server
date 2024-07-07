import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // to parse the data from the url encoded form and extended true is to parse nested objects
app.use(cookieParser()); // to perform crud operations on the browser cookies from server

// Routes imports
import userRoutes from "./routes/user.routes.js";
import gameRoutes from "./routes/game.route.js";

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/game", gameRoutes);

app.get("/", (req, res) => {
  res.send("API is running....");
});

export { app };
