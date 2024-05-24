import express from "express";
import cors from "cors";
import {router as UserRouter} from "./routes/user.routes.ts";
import {router as DeckRouter} from "./routes/deck.routes.ts";
import {router as TopicRouter} from "./routes/topic.routes.ts";
import {router as TagRouter} from "./routes/tag.routes.ts";
import {router as CardRouter} from "./routes/card.routes.ts";
import {router as RatingRouter} from "./routes/rating.routes.ts";
import {router as DeckTrainingRouter} from "./routes/deck.training.routes.ts";
import {router as CardTrainingRouter} from "./routes/card.training.routes.ts";
import dotenv from "dotenv";
import {StatusCodes} from 'http-status-codes';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({origin: `http://${process.env.LOCAL_HOST}:${process.env.FRONTEND_PORT}`}));
app.disable("x-powered-by");
app.use(express.urlencoded({extended: false}));
app.use('/api', UserRouter);
app.use('/api', DeckRouter);
app.use('/api', TopicRouter);
app.use('/api', TagRouter);
app.use('/api', CardRouter);
app.use('/api', RatingRouter);
app.use('/api', DeckTrainingRouter);
app.use('/api', CardTrainingRouter);

app.use((err: any, req: any, res: any, next: any) => {
    console.log(err);
    console.log();

    if(err.code == 11000) {
        res.status(StatusCodes.CONFLICT);
    } else if(err.errors && Object.values(err.errors).some((error: any) => error.kind == 'required' ||
        error.kind == 'min' || error.kind == 'max' || error.kind == 'user defined')) {
        res.status(StatusCodes.BAD_REQUEST);
    } else if(err.kind == 'ObjectId') {
        res.status(StatusCodes.BAD_REQUEST);
    }
    next(err);
})

export{ app };