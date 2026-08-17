import readline from "readline";
import { connectDatabase, disconnectDatabase } from "../config/database";
import { User } from "../models/User.model";
import { env } from "../config/env";
import bcrypt from "bcryptjs";

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function run() {
  await connectDatabase();

  const existing = await User.findOne({ email: env.SUPER_ADMIN_EMAIL });
  if (existing) {
    console.log(`[seed] Super admin already exists: ${env.SUPER_ADMIN_EMAIL}`);
    await disconnectDatabase();
    process.exit(0);
  }

  const password = await prompt(
    `Set a password for founder account (${env.SUPER_ADMIN_EMAIL}): `
  );

  if (!password || password.length < 8) {
    console.error("[seed] Password must be at least 8 characters. Aborting.");
    await disconnectDatabase();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  const [firstName, ...rest] = env.SUPER_ADMIN_NAME.split(" ");

  await User.create({
    firstName: firstName || "Founder",
    lastName: rest.join(" ") || "Admin",
    email: env.SUPER_ADMIN_EMAIL,
    passwordHash,
    isSuperAdmin: true,
    isEmailVerified: true,
  });

  console.log(`[seed] Super admin account created: ${env.SUPER_ADMIN_EMAIL}`);
  await disconnectDatabase();
  process.exit(0);
}

run().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
