import mongoose from "mongoose";
import {app} from "./app.ts";

const db_connection = `${process.env.DB_CONNECTION}`;

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