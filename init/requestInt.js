const mongoose = require("mongoose");
const Request = require("../models/request.js"); // Make sure path is correct


const requests = [
  {
    clientId: "6974a98e886efb3b3d8eeadd",
    pgId: "6974a98e886efb3b3d8eeadd",
    ownerId: "6974a98e886efb3b3d8eeaaa",
    status: "pending",
    message: "I am interested in renting a room from next month."
  },
  {
    clientId: "6974a98e886efb3b3d8eeadc",
    pgId: "6974a98e886efb3b3d8eeadc",
    ownerId: "6974a98e886efb3b3d8eeaab",
    status: "accepted",
    message: "Please reserve a single room for me."
  },
  {
    clientId: "6974a98e886efb3b3d8eeadd",
    pgId: "6974a98e886efb3b3d8eeadd'",
    ownerId: "6974a98e886efb3b3d8eeaaa",
    status: "rejected",
    message: "Looking for a room with private washroom."
  },
  {
    clientId: "6974a98e886efb3b3d8eeadc",
    pgId: "6974a98e886efb3b3d8eeadc",
    ownerId: "6974a98e886efb3b3d8eeadc",
    status: "pending",
    message: "Is the room available for immediate move-in?"
  }
];

// Connect to MongoDB and insert requests
main().then(() => {
  console.log("Connected successfully to MongoDB");
  addRequests();
}).catch(err => {
  console.log("Connection error:", err);
});

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/PGrental");
}

async function addRequests() {
  try {
    // Delete existing requests
    await Request.deleteMany({});
    // Insert sample requests
    const inserted = await Request.insertMany(requests);
    console.log("Inserted requests:", inserted);
    process.exit(); // Exit after completion
  } catch (err) {
    console.error("Error inserting requests:", err);
    process.exit(1);
  }
}
