"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const app_routes_1 = __importDefault(require("./app.routes"));
const db_config_1 = require("./db.config");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api", app_routes_1.default);
const connectDB = async () => {
    try {
        await db_config_1.sequelize.authenticate();
        console.log("Database connected...");
        await db_config_1.sequelize.sync();
        console.log("Database synced...");
    }
    catch (error) {
        console.error("Error connecting to the database:", error);
    }
};
connectDB();
app.get("/", (req, res) => {
    res.send("API is running 🚀");
});
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
//# sourceMappingURL=server.js.map