// src/db/seed.ts
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { tasks } from "../schema";
import { TasksCategoryEnum, TasksTimeGateEnum } from "../../utils/dtos/enums";

export const tasksSeed = [
  {
    id: "hydration-0.5l",
    title: "Drink 0.5L water",
    category: "hydration" as TasksCategoryEnum,
    impactWeight: 4,
    effortMin: 5,
    timegate: "anytime" as TasksTimeGateEnum,
    isMain: true,
    microTask: "hydration-3-sips",
    alternativeTask: "hydration-fruit",
    reward: 500,
  },
  {
    id: "hydration-3-sips",
    title: "Take 3 sips now",
    category: "hydration" as TasksCategoryEnum,
    impactWeight: 2,
    effortMin: 1,
    timegate: "anytime" as TasksTimeGateEnum,
    isMain: false,
    reward: 50,
  },
  {
    id: "hydration-fruit",
    title: "Eat a water-rich fruit",
    category: "hydration" as TasksCategoryEnum,
    impactWeight: 3,
    effortMin: 3,
    timegate: "anytime" as TasksTimeGateEnum,
    isMain: false,
    reward: 200,
  },
  {
    id: "movement-2k",
    title: "Walk 2,000 steps",
    category: "movement" as TasksCategoryEnum,
    impactWeight: 5,
    effortMin: 20,
    timegate: "anytime" as TasksTimeGateEnum,
    isMain: true,
    microTask: "movement-stretch-2min",
    alternativeTask: "movement-stairs",
    reward: 2000,
  },
  {
    id: "movement-stretch-2min",
    title: "Stand and stretch for 2 mins",
    category: "movement" as TasksCategoryEnum,
    impactWeight: 2,
    effortMin: 2,
    timegate: "anytime" as TasksTimeGateEnum,
    isMain: false,
    reward: 120,
  },
  {
    id: "movement-stairs",
    title: "Take stairs once today",
    category: "movement" as TasksCategoryEnum,
    impactWeight: 3,
    effortMin: 3,
    timegate: "anytime" as TasksTimeGateEnum,
    isMain: false,
    reward: 20,
  },

  {
    id: "screen-break-10",
    title: "Take a 10-min screen break",
    category: "screen" as TasksCategoryEnum,
    impactWeight: 4,
    effortMin: 10,
    timegate: "anytime" as TasksTimeGateEnum,
    isMain: true,
    microTask: "screen-look-away",
    alternativeTask: "screen-fresh-air",
    reward: 600,
  },
  {
    id: "screen-look-away",
    title: "Look away for 20 seconds (20-20-20 rule)",
    category: "screen" as TasksCategoryEnum,
    impactWeight: 2,
    effortMin: 1,
    timegate: "anytime" as TasksTimeGateEnum,
    isMain: false,
    reward: 20,
  },
  {
    id: "screen-fresh-air",
    title: "Step outside for 2 minutes of fresh air",
    category: "screen" as TasksCategoryEnum,
    impactWeight: 3,
    effortMin: 2,
    timegate: "anytime" as TasksTimeGateEnum,
    isMain: false,
    reward: 120,
  },

  {
    id: "sleep-winddown-15",
    title: "15-min wind-down routine",
    category: "sleep" as TasksCategoryEnum,
    impactWeight: 5,
    effortMin: 15,
    timegate: "evening" as TasksTimeGateEnum,
    isMain: true,
    microTask: "sleep-screens-off",
    alternativeTask: "sleep-read",
    reward: 15,
  },
  {
    id: "sleep-screens-off",
    title: "Turn off screens 15 minutes earlier",
    category: "sleep" as TasksCategoryEnum,
    impactWeight: 3,
    effortMin: 2,
    timegate: "evening" as TasksTimeGateEnum,
    isMain: false,
    reward: 15,
  },
  {
    id: "sleep-read",
    title: "Read a short chapter of a book",
    category: "sleep" as TasksCategoryEnum,
    impactWeight: 3,
    effortMin: 5,
    timegate: "evening" as TasksTimeGateEnum,
    isMain: false,
    reward: 5,
  },

  {
    id: "mood-journal-5",
    title: "Journal for 5 minutes",
    category: "mood" as TasksCategoryEnum,
    impactWeight: 4,
    effortMin: 5,
    timegate: "anytime" as TasksTimeGateEnum,
    isMain: true,
    microTask: "mood-emoji",
    alternativeTask: "mood-gratitude",
    reward: 4,
  },
  {
    id: "mood-emoji",
    title: "Pick an emoji for your mood",
    category: "mood" as TasksCategoryEnum,
    impactWeight: 1,
    effortMin: 1,
    timegate: "anytime" as TasksTimeGateEnum,
    isMain: false,
    reward: 1,
  },
  {
    id: "mood-gratitude",
    title: "Say one thing you’re grateful for",
    category: "mood" as TasksCategoryEnum,
    impactWeight: 3,
    effortMin: 2,
    timegate: "anytime" as TasksTimeGateEnum,
    isMain: false,
    reward: 2,
  },
];

export async function seed_global_tasks() {
  console.log("🌱 Seeding global tasks...");

  for (const task of tasksSeed) {
    const existing = await db.select().from(tasks).where(eq(tasks.id, task.id));

    if (existing.length === 0) {
      await db.insert(tasks).values({
        ...task,
      });
    } else {
      console.log(`↔️ Skipped (already exists): ${task.id}`);
    }
  }

  console.log("🎉 Tasks Seeding complete!");
  // process.exit(0);
}
