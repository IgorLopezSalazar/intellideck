import pkg from 'bcryptjs';

const {hashSync, compare} = pkg;

import sanitize from 'mongo-sanitize';

import {User} from "../models/user.ts";
import {StatusCodes} from 'http-status-codes';
import {Middleware} from "../middleware.ts";
import mongoose from "mongoose";

const SALT_ROUNDS: number = 10;
const middleware: Middleware = new Middleware();

export class UserController {
    async getFollowedUsers(req: any, res: any) {
        User.findById(sanitize(req.params.id), 'followedUsers')
            .populate("followedUsers").exec()
            .then((data: any) => {
                if (!data || data.length == 0) {
                    res.status(StatusCodes.NO_CONTENT).json();
                } else {
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
        User.findById(req.params.id)
            .then((data: any) => {
                if (!data) {
                    res.status(StatusCodes.NOT_FOUND).json("No result found");
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) =>
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("An error occurred, please try again later."));
    }

    async login(req: any, res: any) {
        User.findOne({username: sanitize(req.body.username)})
            .then((user: any) => {
                if (!user) {
                    res.status(StatusCodes.UNAUTHORIZED).json("Authentication failed");
                } else {
                    compare(req.body.password, user.password)
                        .then((match: boolean) => {
                            if (!match) {
                                res.status(StatusCodes.UNAUTHORIZED).json("Authentication failed");
                            } else {
                                middleware.generateToken(user._id, user.role).then((token: any) => {
                                    res.status(StatusCodes.OK).json(token);
                                });
                            }
                        });
                }
            })
            .catch((e: any) => {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error while processing the login. Please try again later");
                console.log(e);
            });

    }

    async putFollowUser(req: any, res: any, next: any) {
        User.findOneAndUpdate({
                _id: req.decoded._id,
                "followedUsers": {$nin: [sanitize(req.body.id)]}
            },
            {"$push": {"followedUsers": sanitize(req.body.id)}},
            {returnOriginal: false})
            .then((loggedUser: any) => {
                req.followUnfollowData = loggedUser;
                next();
            })
            .catch((e: any) => {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error processing your request. Try again later");
                console.log(e);
            });
    }

    async putUnfollowUser(req: any, res: any, next: any) {
        User.findOneAndUpdate({
                _id: req.decoded._id,
                "followedUsers": {$in: [sanitize(req.body.id)]}
            },
            {"$pull": {"followedUsers": sanitize(req.body.id)}},
            {returnOriginal: false})
            .then((loggedUser: any) => {
                req.followUnfollowData = loggedUser;
                next();
            })
            .catch((e: any) => {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error processing your request. Try again later");
                console.log(e);
            });
    }

    async getFollowers(req: any, res: any) {
        User.find({"followedUsers": {$in: [sanitize(req.params.id)]}})
            .then((data: any[]) => {
                if (data.length == 0) {
                    res.status(StatusCodes.NO_CONTENT).json();
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            });
    }

    async putFollowDeck(req: any, res: any, next: any) {
        User.findOneAndUpdate({
                _id: req.decoded._id,
                "followedDecks": {$nin: [sanitize(req.body.id)]}
            },
            {"$push": {"followedDecks": sanitize(req.body.id)}},
            {returnOriginal: false})
            .then((loggedUser: any) => {
                req.followUnfollowData = loggedUser;
                next();
            })
            .catch((e: any) => {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error processing your request. Try again later");
                console.log(e);
            });
    }

    async putUnfollowDeck(req: any, res: any, next: any) {
        User.findOneAndUpdate({
                _id: req.decoded._id,
                "followedDecks": {$in: [sanitize(req.body.id)]}
            },
            {"$pull": {"followedDecks": sanitize(req.body.id)}},
            {returnOriginal: false})
            .then((loggedUser: any) => {
                req.followUnfollowData = loggedUser;
                next();
            })
            .catch((e: any) => {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error processing your request. Try again later");
                console.log(e);
            });
    }

    async validateFollowUnfollow(req: any, res: any) {
        if (!req.followUnfollowData) {
            res.status(StatusCodes.BAD_REQUEST).json("The requested action could not be done");
        } else {
            res.status(StatusCodes.OK).json(req.followUnfollowData);
        }
    }

    async getDecksFollowed(req: any, res: any) {
        User.findById(sanitize(req.params.id), 'followedDecks')
            .populate("followedDecks").exec()
            .then((data: any) => {
                if (!data || data.length == 0) {
                    res.status(StatusCodes.NO_CONTENT).json();
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            });
    }

    async updateUser(req: any, res: any) {
        User.findByIdAndUpdate(req.decoded._id,
            {name: sanitize(req.body.name),
                    username: sanitize(req.body.username),
                    email: sanitize(req.body.email),
                    profilePicture: sanitize(req.body.profilePicture)
            },
            {returnOriginal: false})
            .then((data: any) =>
                res.status(StatusCodes.OK).json(data))
            .catch((e: any) => {
                res.status(StatusCodes.CONFLICT).json("Email or username already in use");
                console.log(e);
            })
    }
}