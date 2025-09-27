import { seed_global_tasks } from "./tasks";

async function main() {
    await seed_global_tasks();
}

main().then(() => {
    console.log(`Seeded Successfully`);
}).catch(e => {
    console.error(`Seeding Unsuccessful`);
})