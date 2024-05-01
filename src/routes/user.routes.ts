import express from 'express';
import {UserController} from "../controllers/user.controller.ts";
import {Middleware} from "../middleware.ts";

const router = express.Router();
const controller = new UserController();
const middleware: Middleware = new Middleware();

router.get('/users', (req: any, res: any) => {
    return controller.getAllUsers(req, res);
})

router.post('/users', controller.postUser)

router.get('/users/:id', (req: any, res: any) => {
    return controller.getUser(req, res);
})

router.post('/login', controller.login)

export{ router };