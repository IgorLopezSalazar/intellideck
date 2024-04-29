import express from 'express';
import {User} from "../models/user.ts";
import {UserController} from "../controllers/user.controller.js";

const router = express.Router();
const controller = new UserController();

router.get('/users', (req: any, res: any) => {
    return controller.getAllUsers(req, res);
})

router.post('/users', (req: any, res: any) => {
    return controller.postUser(req, res);
})

export{ router };