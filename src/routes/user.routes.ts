import express from 'express';
import {UserController} from "../controllers/user.controller.ts";
import {Middleware} from "../middleware.ts";

const router = express.Router();
const userController = new UserController();
const middleware: Middleware = new Middleware();

router.get('/users/followed/:id',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any) => {
    return userController.getFollowedUsers(req, res);
})

router.get('/users/followers/:id',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any) => {
    return userController.getFollowers(req, res);
})

router.put('/users/follow',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return userController.putFollowUser(req, res, next);
}, (req: any, res: any) => {
    return userController.validateFollowUnfollow(req, res);
})

router.put('/users/unfollow',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next:any) => {
    return userController.putUnfollowUser(req, res, next);
}, (req: any, res: any) => {
    return userController.validateFollowUnfollow(req, res);
})

router.post('/users', (req: any, res: any) => {
    return userController.postUser(req, res);
})

router.put('/users', (req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return userController.verifyNewPassword(req, res, next);
}, (req: any, res: any) => {
    return userController.updateUser(req, res);
})

router.get('/users/:id',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any) => {
    return userController.getUser(req, res);
})

router.post('/login', (req: any, res: any) => {
    return userController.login(req, res);
})

export{ router };