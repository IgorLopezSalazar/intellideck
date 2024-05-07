import express from 'express';
import {UserController} from "../controllers/user.controller.ts";
import {Middleware} from "../middleware.ts";

const router = express.Router();
const controller = new UserController();
const middleware: Middleware = new Middleware();

router.get('/users/followed',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any) => {
    return controller.getFollowedUsers(req, res);
})

router.get('/users/followers/:username',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any) => {
    return controller.getFollowers(req, res);
})

router.put('/users/follow',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
},(req: any, res: any, next: any) => {
    return controller.followUnfollowSearchUser(req, res, next);
}, (req: any, res: any) => {
    return controller.putFollowUser(req, res);
})

router.put('/users/unfollow',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
},(req: any, res: any, next: any) => {
    return controller.followUnfollowSearchUser(req, res, next);
}, (req: any, res: any) => {
    return controller.putUnfollowUser(req, res);
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