const express = require("express");
const app = express();
const mongoose =require("mongoose");
const path = require("path");//path is used to link one file to another file(in os) 
const PG =require("./models/pg.js")
 app.set("view engine" , "ejs");
 app.set("views", path.join(__dirname,"views"));
app.listen(3000,() => {
    console.log("server started")
});
  app.get("/listing" , (req,res) => {
      res.render("home");
 });

main().then(()=>{
    console.log("db connected successfully");
}).catch(()=>{
    console.log("error founded ")
;});
async function main(){
 await mongoose.connect("mongodb://127.0.0.1:27017/PGrental");
}