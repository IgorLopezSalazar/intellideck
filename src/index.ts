import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import {router as UserRouter} from './routes/user.routes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/api', UserRouter);
const db_connection = `mongodb://${process.env.HOST}:${process.env.MONGO_PORT}`;

mongoose.connect(db_connection)
    .then(() =>
        console.log("connected"))
    .catch((e: any) => {
        console.info('Mongoose connection error');
        console.error(e);
    });

app.get('/', (req: any, res: any) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`)
})