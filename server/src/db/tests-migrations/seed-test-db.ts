import { seed_global_tasks } from "../seed/tasks";


export async function seed_test() {
  await seed_global_tasks();
}

