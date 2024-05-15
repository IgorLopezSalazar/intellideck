import express from 'express';
import {Middleware} from "../middleware.ts";
import {TagController} from "../controllers/tag.controller.ts";

const router = express.Router();
const tagController = new TagController();
const middleware: Middleware = new Middleware();

router.get('/tags/:name',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return tagController.getTag(req, res, next);
}, (req: any, res: any) => {
    return tagController.postTag(req, res);
})

router.get('/tags/like/:pattern',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any) => {
    return tagController.getTagsByPattern(req, res);
})

export{ router };