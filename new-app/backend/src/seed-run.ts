import { seed } from "./seed";

async function main(): Promise<void> {
  try {
    await seed();
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

main();
