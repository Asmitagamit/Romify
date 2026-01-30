const mongoose = require("mongoose");
const Review = require("../models/review.js"); // Make sure path is correct

// Sample reviews
const reviews = [
  {
    clientId: "6974a98e886efb3b3d8eeadd",
    pgId: "6974a98e886efb3b3d8eeadd",
    ownerId: "6974a98e886efb3b3d8eeaaa",
    requestId: "6974a98e886efb3b3d8eea11",
    rating: 5,
    comment: "Great PG, very clean and well-maintained!"
  },
  {
    clientId: "6974a98e886efb3b3d8eeadd",
    pgId: "6974a98e886efb3b3d8eeadd",
    ownerId: "6974a98e886efb3b3d8eeaaa",
    requestId: "6974a98e886efb3b3d8eea12",
    rating: 4,
    comment: "Good facilities, but slightly expensive."
  },
  {
    clientId: "6974a98e886efb3b3d8eeadc",
    pgId: "6974a98e886efb3b3d8eeadc",
    ownerId: "6974a98e886efb3b3d8eeaab",
    requestId: "6974a98e886efb3b3d8eea13",
    rating: 3,
    comment: "Average experience, room needs maintenance."
  },
  {
    clientId: "6974a98e886efb3b3d8eeadc",
    pgId: "6974a98e886efb3b3d8eeadc",
    ownerId: "6974a98e886efb3b3d8eeaab",
    requestId: "6974a98e886efb3b3d8eea14",
    rating: 5,
    comment: "Excellent location and friendly staff!"
  }
];

// Connect to MongoDB and insert reviews
main().then(() => {
  console.log("Connected successfully to MongoDB");
  addReviews();
}).catch(err => {
  console.log("Connection error:", err);
});

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/PGrental");
}

async function addReviews() {
  try {
    // Delete existing reviews
    await Review.deleteMany({});
    // Insert sample reviews
    const inserted = await Review.insertMany(reviews);
    console.log("Inserted reviews:", inserted);
    process.exit(); // Exit after completion
  } catch (err) {
    console.error("Error inserting reviews:", err);
    process.exit(1);
  }
}
