const mongoose = require("mongoose");
const Owner = require("../models/owner.js");

mongoose.connect("mongodb://127.0.0.1:27017/PGrental");

async function seedOwners() {
  await Owner.deleteMany({});

  let result=await Owner.insertMany([
    {
      name: "Rohit Sharma",
      email: "rohit.sunrise@gmail.com",
      phone: "9876543210",
      address: "Navrangpura, Ahmedabad",
      credentials: {
        username: "rohit_pg",
        password: "password123",
        pgId: "697609abbd3c121a47c91866"
      },
      isVerified: true
    },
    {
      name: "Anjali Verma",
      email: "anjali.greenleaf@gmail.com",
      phone: "9876543211",
      address: "Hinjewadi Phase 1, Pune",
      credentials: {
        username: "anjali_pg",
        password: "password123",
        pgId: "697609abbd3c121a47c91867"
      },
      isVerified: true
    },
    {
      name: "Suresh Rao",
      email: "suresh.urbanstay@gmail.com",
      phone: "9876543212",
      address: "Whitefield, Bengaluru",
      credentials: {
        username: "suresh_pg",
        password: "password123",
        pgId: "697609abbd3c121a47c91868"
      },
      isVerified: false
    }
  ]);

  console.log("Owners seeded successfully",result);

}

seedOwners();