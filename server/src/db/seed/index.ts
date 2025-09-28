import { seed_global_tasks } from "./tasks";

export async function seed_main() {
    await seed_global_tasks();
}

seed_main().then(() => {
    console.log(`Seeded Successfully`);
}).catch(e => {
    console.error(`Seeding Unsuccessful`);
})