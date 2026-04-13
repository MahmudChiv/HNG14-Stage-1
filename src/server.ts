import express from "express";
import dotenv from "dotenv";
import { Country, RequestBody } from "./app.types";
import axios from "axios";
import cors from "cors";
import { AppError } from "./App.error";
import { User } from "./db.model";
import appRoutes from "./app.routes";
import { sequelize } from "./db.config";
dotenv.config();

const app = express();
const port = process.env.PORT! || 4000;

app.use(express.json());
app.use(cors());
app.use("/api", appRoutes);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected...");
    await sequelize.sync();
    console.log("Database synced...");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};
connectDB();

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`),
);
