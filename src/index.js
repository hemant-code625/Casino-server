import dotenv from "dotenv";
import "./db/index.js";
import { app } from "./app.js";

dotenv.config();
app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 8000}`);
});
