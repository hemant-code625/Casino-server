import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config();

connectDB();

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 8000}`);
});
