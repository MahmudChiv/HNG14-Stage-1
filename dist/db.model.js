"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const db_config_1 = require("./db.config");
const uuid_1 = require("uuid");
/**
 * 3. Define Model
 */
class User extends sequelize_1.Model {
    id;
    name;
    gender;
    gender_probability;
    sample_size;
    age;
    age_group;
    country_id;
    country_probability;
    created_at;
}
exports.User = User;
/**
 * 4. Initialize Model
 */
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => (0, uuid_1.v7)(),
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    gender: {
        type: sequelize_1.DataTypes.STRING,
    },
    gender_probability: {
        type: sequelize_1.DataTypes.FLOAT,
    },
    sample_size: {
        type: sequelize_1.DataTypes.INTEGER,
    },
    age: {
        type: sequelize_1.DataTypes.INTEGER,
    },
    age_group: {
        type: sequelize_1.DataTypes.STRING,
    },
    country_id: {
        type: sequelize_1.DataTypes.STRING,
    },
    country_probability: {
        type: sequelize_1.DataTypes.FLOAT,
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: db_config_1.sequelize,
    tableName: "users",
    timestamps: false,
});
//# sourceMappingURL=db.model.js.map