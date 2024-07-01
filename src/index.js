// require("dotenv").config({ path: "./.env" });
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectDB from "./db/index.js";
connectDB()
  .then(
    app.on("error", (error) => {
      console.error(error);
      throw error;
    }),

    app.listen(process.env.PORT || 8080, () => {
      console.log(
        `%c Server is running on port ${process.env.PORT}`,
        "color: #bada55",
        "background: yellow"
      );
    })
  )
  .catch((err) => {
    console.error("Database connection failed.", err);
  });






  
/* // IIFE
import express from "express";
import mongoose from "mongoose";
const app = express();
;(
    async () => {
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

            app.on("error", (error) => {
                console.error(error);
                throw error;
            })

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
