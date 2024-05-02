import express from 'express';
import {UserController} from "../controllers/user.controller.ts";
import {Middleware} from "../middleware.ts";

const router = express.Router();
const controller = new UserController();
const middleware: Middleware = new Middleware();

router.get('/users',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any) => {
    return controller.getAllUsers(req, res);
})

router.post('/users', (req: any, res: any) => {
    return controller.postUser(req, res);
})

router.get('/users/:id',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any) => {
    return controller.getUser(req, res);
})

router.post('/login', (req: any, res: any) => {
    return controller.login(req, res);
})

export{ router };