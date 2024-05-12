import express from 'express';
import {Middleware} from "../middleware.ts";
import {TopicController} from "../controllers/topic.controller.ts";

const router = express.Router();
const topicController = new TopicController();
const middleware: Middleware = new Middleware();

router.post('/topics',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return middleware.isAdmin(req, res, next);
}, (req: any, res: any) => {
    return topicController.postTopic(req, res);
})

router.get('/topics',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any) => {
    return topicController.getTopics(req, res);
})

router.delete('/topics',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return middleware.isAdmin(req, res, next);
}, (req: any, res: any) => {
    return topicController.deleteTopic(req, res);
})

export{ router };