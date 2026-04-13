import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import { User } from "./db.model";
dotenv.config();

export const sequelize = new Sequelize(process.env.DB_URI!, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});


