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
        User.aggregate([
            {
                "$match":
                    {'_id': new mongoose.Types.ObjectId(sanitize(req.params.id))}
            },
            {
                "$lookup": {
                    "from": "users",
                    "foreignField": "_id",
                    "localField": "followedUsers",
                    "as": "followedUsers"
                }
            }
        ])
            .then((data: any) => {
                if (!data || data[0].followedUsers.length == 0) {
                    res.status(StatusCodes.NO_CONTENT).json();
                } else {
                    res.status(StatusCodes.OK).json(data[0].followedUsers);
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
                res.status(StatusCodes.NOT_FOUND).json("No result found"));
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

    async searchUserByID(req: any, res: any, next: any) {
        User.findById(sanitize(req.body.id))
            .then((toFollow: any) => {
                console.log(toFollow)
                req.foundUser = toFollow;
                next();
            })
            .catch((e: any) =>
                res.status(StatusCodes.NOT_FOUND).json("User not found"));
    }

    async getLoggedUser(req: any, res: any, next: any) {
        User.findById(sanitize(req.decoded.id))
            .then((toFollow: any) => {
                req.loggedUser = toFollow;
                next();
            })
            .catch((e: any) =>
                res.status(StatusCodes.NOT_FOUND).json("User not found"));
    }

    async putFollowUser(req: any, res: any) {
        User.findOneAndUpdate({
                _id: req.decoded.id,
                "followedUsers": {$nin: [req.foundUser._id]}
            },
            {"$push": {"followedUsers": req.foundUser._id}},
            {returnOriginal: false})
            .then((loggedUser: any) => {
                if (!loggedUser) {
                    res.status(StatusCodes.BAD_REQUEST).json("User already followed");
                } else {
                    res.status(StatusCodes.OK).json(loggedUser);
                }
            })
            .catch((e: any) => {
                res.status(StatusCodes.NOT_FOUND).json("User not found");
                console.log(e);
            });
    }

    async putUnfollowUser(req: any, res: any) {
        User.findOneAndUpdate({
                _id: req.decoded.id,
                "followedUsers": {$in: [req.foundUser._id]}
            },
            {"$pull": {"followedUsers": req.foundUser._id}},
            {returnOriginal: false})
            .then((loggedUser: any) => {
                if (!loggedUser) {
                    res.status(StatusCodes.BAD_REQUEST).json("User already not followed");
                } else {
                    res.status(StatusCodes.OK).json(loggedUser);
                }
            })
            .catch((e: any) => {
                res.status(StatusCodes.NOT_FOUND).json("User not found");
                console.log(e);
            });
    }

    getFollowers(req: any, res: any) {
        User.find({"followedUsers": {$in: [sanitize(req.params.id)]}})
            .then((data: any[]) => {
                if (data.length == 0) {
                    res.status(StatusCodes.NO_CONTENT).json();
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            });
    }

    async putFollowDeck(req: any, res: any) {
        User.findOneAndUpdate({
                _id: req.decoded.id,
                "followedDecks._id": {$nin: [req.deck._id]}
            },
            {"$push": {"followedDecks": req.deck._id}},
            {returnOriginal: false})
            .then((loggedUser: any) => {
                if (!loggedUser) {
                    res.status(StatusCodes.BAD_REQUEST).json("User already followed");
                } else {
                    res.status(StatusCodes.OK).json(loggedUser);
                }
            })
            .catch((e: any) => {
                res.status(StatusCodes.NOT_FOUND).json("User not found");
                console.log(e);
            });
    }
}