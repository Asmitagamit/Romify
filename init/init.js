const express=require("express");
const mongoose=require("mongoose");
const pg=require("../models/pg.js");
const pginfo = [
  {
    name: "Sunrise Boys PG",
    description: "Comfortable boys PG with all basic amenities, close to metro and market.",
    address: {
      city: "Ahmedabad",
      state: "Gujarat",
      location: "Navrangpura"
    },
    amenities: ["WiFi", "Food", "AC", "Laundry", "Parking"],
    price: 7500,
    availableRooms: 5,
    totalRooms: 20,
    images: [
      "https://www.horizonheights.in/images/location/horizon-heights-living-room.webp",
      "https://www.tradeindia.com/products/2200-sq-ft-fully-furnished-office-space-on-rent-and-lease-services-7983900.html"
    ],
    rules: [
      "No smoking",
      "No alcohol",
      "Entry after 10 PM not allowed"
    ],
    isAvailable: true
  },
  {
    name: "Green Leaf Girls PG",
    description: "Safe and secure girls PG with homely food and 24x7 security.",
    address: {
      city: "Pune",
      state: "Maharashtra",
      location: "Hinjewadi Phase 1"
    },
    amenities: ["WiFi", "Food", "Security", "Power Backup"],
    price: 9000,
    availableRooms: 2,
    totalRooms: 15,
    images: [
      "https://i0.wp.com/totalrental.in/wp-content/uploads/2025/06/catering-equipment-on-rent-in-Pune.png",
      "https://example.com/images/pg2-2.jpg"
    ],
    rules: [
      "No outside guests",
      "Silence after 11 PM"
    ],
    isAvailable: true
  },
  {
    name: "Urban Stay PG",
    description: "Premium PG for working professionals with modern facilities.",
    address: {
      city: "Bengaluru",
      state: "Karnataka",
      location: "Whitefield"
    },
    amenities: ["WiFi", "AC", "Housekeeping", "Gym"],
    price: 12000,
    availableRooms: 0,
    totalRooms: 10,
    images: [
      "https://example.com/images/pg3-1.jpg"
    ],
    rules: [
      "Couples not allowed",
      "No loud music"
    ],
    isAvailable: false
  }
];
main().then(()=>{
    console.log("connected sucessfully")
}).catch((err)=>{
    console.log("you catch an error")
});
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/PGrental");
}
async function addData(){
    const del=await pg.deleteMany({});//previous data get deleted
    const inpg=await pg.insertMany(pginfo);
    console.log(inpg);

}
addData();