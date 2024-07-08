// require("dotenv").config({ path: "./.env" });
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { app } from "./app.js";
import connectDB from "./db/index.js";

connectDB()
  .then(
    app.listen(process.env.PORT || 8080, () => {
      console.log(`⚙️ Server is running on port ${process.env.PORT}`);
    })
  )
  .catch((err) => {
    console.error("Database connection failed.", err);
  });

/* // IIFE
import express from "express";
import mongoose from "mongoose";
;(
    async () => {
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
            app.listen(process.env.PORT, () => {
              console.log(`Server is running on port ${process.env.PORT}`);
            })
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
)()
*/
