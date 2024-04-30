import express from 'express';
import {UserController} from "../controllers/user.controller.ts";

const router = express.Router();
const controller = new UserController();

router.get('/users', (req: any, res: any) => {
    return controller.getAllUsers(req, res);
})

router.post('/users', (req: any, res: any) => {
    return controller.postUser(req, res);
})

router.get('/users/:id', (req: any, res: any) => {
    return controller.getUser(req, res);
})

export{ router };