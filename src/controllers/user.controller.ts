import pkg from 'bcryptjs';
const {hashSync, compare} = pkg;

import sanitize from 'mongo-sanitize';

import {User} from "../models/user.ts";
import StatusCodes from "http-status-codes";
import {Middleware} from "../middleware.ts";


const SALT_ROUNDS: number = 10;
const middleware: Middleware = new Middleware();

export class UserController {
    async getFollowedUsers(req: any, res: any) {
        User.find({ username: req.decoded.username }, 'followedUsers')
            .then((data: any[]) => {
                if(data.length == 0) {
                    res.status(StatusCodes.NO_CONTENT).json();
                }
                else {
                    res.status(StatusCodes.OK).json(data);
                }
            });
    }

    async postUser(req: any, res: any) {
        let user = new User({
            name: sanitize(req.body.name),
            username: sanitize(req.body.username),
            email: sanitize(req.body.email),
            password: hashSync(req.body.password, SALT_ROUNDS),
            profilePicture: sanitize(req.body.profilePicture),
            role: sanitize(req.body.role)
        })
        User.create(user)
            .then((data: any) =>
                res.status(StatusCodes.CREATED).json(data))
            .catch((e: any) => {
                res.status(StatusCodes.CONFLICT).json("A user with the same email or username already exists");
                console.log(e);
            })
    }

    async getUser(req: any, res: any) {
        User.findOne({username: sanitize(req.params.username)})
            .then((data: any) => {
                if(!data) {
                    res.status(StatusCodes.NOT_FOUND).json("No result found");
                }
                else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) =>
                res.status(StatusCodes.NOT_FOUND).json("No result found"));
    }

    async login(req: any, res: any) {
        User.findOne({username: sanitize(req.body.username)})
            .then((user: any) => {
                if (!user) {
                    res.status(StatusCodes.UNAUTHORIZED).json("Authentication failed");
                }
                compare(req.body.password, user.password)
                    .then((match: boolean) => {
                        if (!match) {
                            res.status(StatusCodes.UNAUTHORIZED).json("Authentication failed");
                        }
                        else {
                            middleware.generateToken(user.username, user.role).then((token: any) => {
                                res.status(StatusCodes.OK).json(token);
                            });
                        }
                    })
            })
            .catch((e: any) => {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error while processing the login. Please try again later");
                console.log(e);
            });

    }

    async searchUserByUsername(req: any, res: any, next: any) {
        User.findOne({ username: sanitize(req.body.username) }, "-followedUsers")
            .then((toFollow: any) => {
                req.foundUser = toFollow;
                next();
            })
            .catch((e: any) =>
                res.status(StatusCodes.NOT_FOUND).json("User not found"));
    }

    async getLoggedUser(req: any, res: any, next: any) {
        User.findOne({ username: sanitize(req.decoded.username) }, "-followedUsers")
            .then((toFollow: any) => {
                req.loggedUser = toFollow;
                next();
            })
            .catch((e: any) =>
                res.status(StatusCodes.NOT_FOUND).json("User not found"));
    }

    async putFollowUser(req: any, res: any) {
        User.findOneAndUpdate({ username: req.decoded.username,
                "followedUsers._id": { $nin: [req.foundUser._id] }},
            {"$push": { "followedUsers": req.foundUser }},
            {returnOriginal: false})
            .then((loggedUser: any) => {
                if(!loggedUser) {
                    res.status(StatusCodes.BAD_REQUEST).json("User already followed");
                }
                else {
                    res.status(StatusCodes.OK).json(loggedUser);
                }
            })
            .catch((e: any) => {
                res.status(StatusCodes.NOT_FOUND).json("User not found");
                console.log(e);
            });
    }

    async putUnfollowUser(req: any, res: any) {
        User.findOneAndUpdate({ username: req.decoded.username,
                "followedUsers._id": { $in: [req.foundUser._id] }},
            {"$pull": { "followedUsers": req.foundUser }},
            {returnOriginal: false})
            .then((loggedUser: any) => {
                if(!loggedUser) {
                    res.status(StatusCodes.BAD_REQUEST).json("User already not followed");
                }
                else {
                    res.status(StatusCodes.OK).json(loggedUser);
                }
            })
            .catch((e: any) => {
                res.status(StatusCodes.NOT_FOUND).json("User not found");
                console.log(e);
            });
    }

    getFollowers(req: any, res: any) {
        User.find({"followedUsers.username": { $in: [sanitize(req.params.username)] }}, "-followedUsers")
            .then((data: any[]) => {
                if(data.length == 0) {
                    res.status(StatusCodes.NO_CONTENT).json();
                }
                else {
                    res.status(StatusCodes.OK).json(data);
                }
            });
    }
}