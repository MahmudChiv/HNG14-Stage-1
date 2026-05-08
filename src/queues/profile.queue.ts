import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { Profile } from "../models/profile.model";
import { cache } from "../lib/cache";
import {
  ageData,
  genderData,
  nationalityData,
} from "../services/profile.service";
import dotenv from "dotenv";
dotenv.config();

// Reuse the same Redis connection
const connection = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null, // Required by BullMQ
  },
);

// The Queue is the "todo list" — the API adds jobs here
export const profileQueue = new Queue("profile-enrichment", { connection });

export const profileWorker = new Worker(
  "profile-enrichment",
  async (job: Job) => {
    const { name } = job.data;
    console.log(`Processing profile creation for: ${name}`);
    try {
      const [genderResult, ageResult, nationalityResult] = await Promise.all([
        genderData(name),
        ageData(name),
        nationalityData(name),
      ]);

      await Profile.create({
        name,
        ...genderResult,
        ...ageResult,
        ...nationalityResult,
        created_at: new Date(),
      });

      await cache.invalidate("profiles:list:*");

      console.log(`Profile created successfully for: ${name}`);
    } catch (error) {
      console.error(`Failed to create profile for ${name}:`, error);
      throw error; // BullMQ will retry the job automatically
    }
  },
  { connection },
);

// Log worker events for observability
profileWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

profileWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});
