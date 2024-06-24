import express from 'express';
import {UserController} from "../controllers/user.controller.ts";
import {Middleware} from "../middleware.ts";

const router = express.Router();
const userController = new UserController();
const middleware: Middleware = new Middleware();

router.get('/users/logged',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return userController.getUser(req, res, next, true);
})

router.get('/users/followed/:id',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return userController.getFollowedUsers(req, res, next);
})

router.get('/users/timeline',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return userController.getPaginatedUsers(req, res, next);
})

router.get('/users/filter',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return userController.filterUsersFollowers(req, res, next);
}, (req: any, res: any, next: any) => {
    return userController.filterUsersFollowed(req, res, next);
}, (req: any, res: any) => {
    return userController.validateFilter(req, res);
})

router.get('/users/followers/:id',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return userController.getFollowers(req, res, next);
})

router.put('/users/:id/follow',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return userController.putFollowUser(req, res, next);
}, (req: any, res: any) => {
    return userController.validateFollowUnfollow(req, res);
})

router.put('/users/:id/unfollow',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next:any) => {
    return userController.putUnfollowUser(req, res, next);
}, (req: any, res: any) => {
    return userController.validateFollowUnfollow(req, res);
})

router.post('/users', (req: any, res: any, next: any) => {
    return userController.postUser(req, res, next);
})

router.put('/users', (req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return userController.verifyNewPassword(req, res, next);
}, (req: any, res: any, next: any) => {
    return userController.updateUser(req, res, next);
})

router.get('/users/:id',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return userController.getUser(req, res, next, false);
})

router.post('/login', (req: any, res: any, next: any) => {
    return userController.login(req, res, next);
})

export{ router };