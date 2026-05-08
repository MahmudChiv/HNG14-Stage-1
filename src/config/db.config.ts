import { Sequelize } from "sequelize-typescript";
import { User } from "../models/user.model";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize(process.env.DB_URI!, {
  dialect: "postgres",
  logging: false,
  pool: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});