import dotenv from "dotenv";

dotenv.config({ path: ".env.test", quiet: true });

// Optional: prevent process.exit from killing Jest
jest
  .spyOn(process, "exit")
  .mockImplementation(
    (code?: string | number | null | undefined) => undefined as never
  );
