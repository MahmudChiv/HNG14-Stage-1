import { Request, Response, Router } from "express";
import axios from "axios";
import { User } from "./db.model";
import { AppError } from "./App.error";
import { Country, RequestBody, userProfileQuery } from "./app.types";

const router = Router();

const genderData = async (
  name: string,
): Promise<{
  gender: string;
  gender_probability: number;
  sample_size: number;
}> => {
  try {
    const res = await axios.get("https://api.genderize.io/", {
      params: { name },
    });

    const { data } = res;
    const {gender, count} = data;
    if (gender === null || count === 0)
      throw new AppError("Genderize returned an invalid response", 502);

    return {
      gender,
      gender_probability: data.probability,
      sample_size: count,
    };
  } catch (error) {
    throw new AppError("Failed to fetch data from Genderize API", 500);
  }
};

const ageData = async (
  name: string,
): Promise<{ age: number; age_group: string }> => {
  try {
    const res = await axios.get("https://api.agify.io/", {
      params: { name },
    });
    const age = res.data.age;
    if (age === null)
      throw new AppError("Agify returned an invalid response", 502);

    let age_group: string = "unknown";
    if (age <= 12) {
      age_group = "child";
    } else if (age > 12 && age <= 19) {
      age_group = "teenager";
    } else if (age > 19 && age <= 59) {
      age_group = "adult";
    } else if (age >= 60) {
      age_group = "senior";
    }
    return { age, age_group };
  } catch (error) {
    throw new Error("Failed to fetch data from Agify API");
  }
};

const nationalityData = async (
  name: string,
): Promise<{ country_id: string; country_probability: number }> => {
  try {
    const res = await axios.get("https://api.nationalize.io/", {
      params: { name },
    });

    const countries: Country[] = res.data.country;
    if (!countries || countries.length === 0)
      throw new AppError("Nationalize returned an invalid response", 502);

    const country = countries.reduce((prev, current) =>
      prev.probability > current.probability ? prev : current,
    );

    return {
      country_id: country.country_id,
      country_probability: +country.probability.toFixed(2),
    };
  } catch (error) {
    console.error("Nationalize API error:", error);
    throw new Error("Failed to fetch data from Nationalize API");
  }
};

router.post(
  "/profiles",
  async (req: Request<{}, {}, RequestBody, {}>, res: Response) => {
    try {
      const { name } = req.body;
      if (!name)
        return res.status(400).json({
          status: "error",
          message: "Missing or empty name",
        });

      if (typeof name !== "string")
        return res
          .status(422)
          .json({ status: "error", message: "Name is not a string" });

      const userExist = await User.findOne({ where: { name } });
      if (userExist)
        return res.status(200).json({
          status: "success",
          message: "Profile already exists",
          data: userExist,
        });

      const { gender, gender_probability, sample_size } =
        await genderData(name);
      const { age, age_group } = await ageData(name);
      const { country_id, country_probability } = await nationalityData(name);

      const storeData = await User.create({
        name,
        gender,
        gender_probability,
        sample_size,
        age,
        age_group,
        country_id,
        country_probability,
      });

      return res.status(201).json({
        status: "success",
        data: storeData,
      });
    } catch (error) {
      console.error("Error processing request:", error);
      return res
        .status(500)
        .json({ status: "error", message: "Error processing request" });
    }
  },
);

router.get(
  "/profiles/:id",
  async (req: Request<{ id: string }, {}, {}, {}>, res: Response) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user)
        return res.status(404).json({
          status: "error",
          message: "User profile not found",
        });

      return res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {}
  },
);

router.get(
  "/profiles",
  async (req: Request<{}, {}, {}, userProfileQuery>, res: Response) => {
    try {
      const gender =
        req.query.gender?.trim().toLocaleLowerCase()! in ["male", "female"]
          ? req.query.gender?.toLowerCase()
          : undefined;
      const country_id = req.query.country_id?.toUpperCase();
      const age_group = req.query.age_group?.toLowerCase();

      const query = {} as any;
      if (gender) query.gender = gender;
      if (country_id) query.country_id = country_id;
      if (age_group) query.age_group = age_group;

      const users: User[] = await User.findAll({ where: query });
      return res.status(200).json({
        status: "success",
        count: users.length,
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Error fetching user profiles",
      });
    }
  },
);

router.delete(
  "/profiles/:id",
  async (req: Request<{ id: string }, {}, {}, {}>, res: Response) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user)
        return res.status(404).json({
          status: "error",
          message: "User profile not found",
        });

      await user.destroy();
      return res.sendStatus(204);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Error deleting user profile",
      });
    }
  },
);

export default router;
