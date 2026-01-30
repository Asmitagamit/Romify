const express=require("express");
const mongoose=require("mongoose");
const client=require("../models/client.js");
const clients = [
  {
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    pgId:"697609abbd3c121a47c91866",
    phone: 9876543210,
    password: "password123" // you should hash this before saving
  },
  {
    name: "Priya Singh",
    email: "priya.singh@example.com",
      pgId:"697609abbd3c121a47c91867",
    phone: 9123456780,
    password: "mypassword"
  },
  {
    name: "Rohan Mehta",
    email: "rohan.mehta@example.com",
      pgId:"697609abbd3c121a47c91868",
    phone: 9988776655,
    password: "secret123"
  },
  {
    name: "Ananya Verma",
    email: "ananya.verma@example.com",
      pgId:"697609abbd3c121a47c91869",
    phone: 9012345678,
    password: "ananya@2026"
  },
  {
    name: "Karan Patel",
    email: "karan.patel@example.com",
    phone: 9876012345,
     pgId:"697609abbd3c121a47c9186a",
    password: "karanpass"
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
    const del=await client.deleteMany({});
    const inclient=await client.insertMany(clients);
    console.log(inclient);

}
addData();