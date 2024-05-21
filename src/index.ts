import mongoose from "mongoose";
import {app} from "./app.ts";

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