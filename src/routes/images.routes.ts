import multer from "multer";
import express from 'express';
import {Middleware} from "../middleware.ts";
import crypto from "crypto";
import dotenv from "dotenv";
import {StatusCodes} from 'http-status-codes';

dotenv.config();

const router = express.Router();
const storage = multer.diskStorage({
    destination: './public/images/',
    filename: function (req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        cb(null, crypto.randomUUID() + '.' + extension);
    }
});
const upload = multer({ storage: storage,
    limits: { fileSize: 8000000 /* bytes */ }});
const middleware: Middleware = new Middleware();

router.post('/images',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, upload.single('file'), function (req : any, res: any) {
    if(!req.file) {
        res.status(StatusCodes.BAD_REQUEST).json();
    } else {
        res.status(StatusCodes.OK).json(`${process.env.IMAGE_ROUTE}/images/${req.file.filename}`);
    }
});

export{ router };