import mongoose from "mongoose";
import dotenv from 'dotenv';
import {app} from "./app.ts";

dotenv.config();

const db_connection = `mongodb://${process.env.HOST}:${process.env.MONGO_PORT}/${process.env.DATABASE_NAME}`;

mongoose.connect(db_connection)
    .then(() => {
        console.log("connected");
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`)
        });
    })
    .catch((e: any) => {
        console.info('Mongoose connection error');
        console.error(e);
    });