import { Model, Optional } from "sequelize";
/**
 * 1. Define Attributes (what exists in DB)
 */
interface UserAttributes {
    id: string;
    name: string;
    gender: string;
    gender_probability: number;
    sample_size: number;
    age: number;
    age_group: string;
    country_id: string;
    country_probability: number;
    created_at: Date;
}
/**
 * 2. Define Creation Attributes (what can be optional when creating)
 */
interface UserCreationAttributes extends Optional<UserAttributes, "id" | "created_at"> {
}
/**
 * 3. Define Model
 */
export declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: string;
    name: string;
    gender: string;
    gender_probability: number;
    sample_size: number;
    age: number;
    age_group: string;
    country_id: string;
    country_probability: number;
    created_at: Date;
}
export {};
//# sourceMappingURL=db.model.d.ts.map