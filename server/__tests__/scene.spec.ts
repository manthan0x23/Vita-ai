import request from "supertest";
import { Express } from "express";
import app from "../src/app";
import { migrate_db, close_db } from "../src/db/migrate";
import { seed_main } from "../src/db/seed";

interface TaskBase {
  id: string;
  title: string;
  category: string;
  impactWeight: number;
  effortMin: number;
  timeGate: string;
}

interface Task {
  id: string;
  score: number;
  base: TaskBase;
}

interface UpdateTaskStatusRequest {
  taskId: string;
  action: "completed" | "dismiss" | "ignore";
}

const setupTestUser = async (prefix: string) => {
  const agent = request.agent(app as Express); // use agent to persist cookies
  const randomNumber = Math.floor(Math.random() * 90000) + 10000;

  await agent
    .post("/api/user/login")
    .send({
      name: `${prefix} User ${randomNumber}`,
      email: `${prefix.toLowerCase()}user${randomNumber}@example.com`,
    })
    .expect(201);

  return agent;
};

beforeAll(async () => {
  await migrate_db();
  await seed_main();
});

afterAll(async () => {
  await close_db();
});

describe("Mood Task Recommendation", () => {
  test("should recommend mood-gratitude task after ignoring mood-journal 3 times", async () => {
    const agent = await setupTestUser("Mood");

    const initialResponse = await agent.get("/api/task/recommend").expect(201);
    const initialTasks: Task[] = initialResponse.body.tasks;

    const moodJournalTask = initialTasks.find(
      (task) => task.id === "mood-journal-5"
    );
    expect(moodJournalTask).toBeDefined();

    for (let i = 0; i < 3; i++) {
      await agent
        .put("/api/task/update-status")
        .send({ taskId: "mood-journal-5", action: "ignore" })
        .expect(200);
    }

    const finalResponse = await agent.get("/api/task/recommend").expect(201);
    const finalTasks: Task[] = finalResponse.body.tasks;

    expect(finalTasks.find((t) => t.id === "mood-gratitude")).toBeDefined();
    expect(finalTasks.find((t) => t.id === "mood-journal-5")).toBeUndefined();
  });
});

describe("Hydration Task Recommendation", () => {
  test("hydration task appears once and disappears after completion", async () => {
    const agent = await setupTestUser("Hydration");

    const firstResponse = await agent.get("/api/task/recommend").expect(201);
    const firstTasks: Task[] = firstResponse.body.tasks;

    const hydrationTask = firstTasks.find(
      (task) => task.id === "hydration-0.5l"
    );
    expect(hydrationTask).toBeDefined();

    await agent
      .put("/api/task/update-status")
      .send({ taskId: "hydration-0.5l", action: "completed" })
      .expect(200);

    const secondResponse = await agent.get("/api/task/recommend").expect(201);
    const secondTasks: Task[] = secondResponse.body.tasks;

    expect(
      secondTasks.find((t) => t.base.category === "hydration")
    ).toBeUndefined();
  });
});
