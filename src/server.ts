import express from "express";
import cors from "cors";
import appRoutes from "./app.routes";
import { sequelize } from "./db.config";
import dotenv from "dotenv";
dotenv.config();

const app = express();

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

app.listen(process.env.PORT!, () =>
  console.log(`Server running on http://localhost:${process.env.PORT!}`),
);
