/**
 * Deletes restaurants whose dishes have no images (old/placeholder test data),
 * plus any restaurant with an empty menu. Keeps only restaurants where every
 * dish carries an image.
 *
 * Run with:  npm run clean:noimg
 */
import "dotenv/config";
import mongoose from "mongoose";
import Restaurant from "../models/restaurant";

async function run() {
  const conn = process.env.MONGODB_CONECTION_STRING;
  if (!conn) throw new Error("MONGODB_CONECTION_STRING is not set");
  await mongoose.connect(conn);
  console.log("connected to mongodb");

  const result = await Restaurant.deleteMany({
    $or: [
      { menuItems: { $size: 0 } },
      {
        menuItems: {
          $elemMatch: {
            $or: [
              { imageUrl: { $exists: false } },
              { imageUrl: "" },
              { imageUrl: null },
            ],
          },
        },
      },
    ],
  });

  console.log(`🗑️  deleted ${result.deletedCount} restaurant(s) with missing dish images`);
  const remaining = await Restaurant.countDocuments();
  console.log(`${remaining} restaurants remain (all with dish images)`);

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
