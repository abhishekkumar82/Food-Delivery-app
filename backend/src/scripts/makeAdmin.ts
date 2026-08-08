/**
 * Promote an existing user to admin (the account must have logged in at least
 * once so its User record exists).
 *
 * Usage:  npm run make-admin -- your-email@example.com
 */
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/user";

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npm run make-admin -- <email>");
    process.exit(1);
  }
  const conn = process.env.MONGODB_CONECTION_STRING;
  if (!conn) throw new Error("MONGODB_CONECTION_STRING is not set");

  await mongoose.connect(conn);
  const user = await User.findOneAndUpdate(
    { email },
    { role: "admin" },
    { new: true }
  );
  if (!user) {
    console.error(
      `No user found with email "${email}". Log into the app once with that account, then re-run.`
    );
  } else {
    console.log(`✅ ${email} is now an admin`);
  }
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
