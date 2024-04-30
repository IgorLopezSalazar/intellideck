import express from "express";
import {router as UserRouter} from "./routes/user.routes.ts";

export const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/api', UserRouter);