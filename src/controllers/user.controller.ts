import pkg from 'bcryptjs';

const {hashSync, compare} = pkg;

import sanitize from 'mongo-sanitize';

import {User} from "../models/user.ts";
import {StatusCodes} from 'http-status-codes';
import {Middleware} from "../middleware.ts";
import mongoose from 'mongoose';
import {Helper} from "../helper.ts";

const SALT_ROUNDS: number = 10;
const USER_TIMELINE_SIZE: number = 5;
const middleware: Middleware = new Middleware();

export class UserController {
    async getFollowedUsers(req: any, res: any, next: any) {
        User.findById(sanitize(req.params.id), 'followedUsers')
            .populate("followedUsers").exec()
            .then((data: any) => {
                if (!data || data.length == 0) {
                    res.status(StatusCodes.NO_CONTENT).json();
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) => {
                next(e);
            });
    }

    async getPaginatedUsers(req: any, res: any, next: any) {
        User.find({}, null,
            {limit: USER_TIMELINE_SIZE, sort: {username: 'asc'}})
            .then((data: any) =>{
                if(!data || data.length == 0) {
                    res.status(StatusCodes.NO_CONTENT).json();
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) => {
                next(e);
            })
    }

    async postUser(req: any, res: any, next: any) {
        if (!req.body.password) {
            res.status(StatusCodes.BAD_REQUEST).json("Password missing");
        } else {
            let user = new User({
                name: sanitize(req.body.name),
                surname: sanitize(req.body.surname),
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
                    next(e);
                })
        }
    }

    async getUser(req: any, res: any, next: any) {
        User.findById(req.params.id)
            .then((data: any) => {
                if (!data) {
                    res.status(StatusCodes.NOT_FOUND).json();
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) => next(e));
    }

    async login(req: any, res: any, next: any) {
        User.findOne({username: sanitize(req.body.username)})
            .then((user: any) => {
                if (!user) {
                    res.status(StatusCodes.UNAUTHORIZED).json();
                } else {
                    compare(req.body.password, user.password)
                        .then((match: boolean) => {
                            if (!match) {
                                res.status(StatusCodes.UNAUTHORIZED).json();
                            } else {
                                middleware.generateToken(user._id, user.role).then((token: any) => {
                                    res.status(StatusCodes.OK).json(token);
                                });
                            }
                        });
                }
            })
            .catch((e: any) => {
                next(e);
            });

    }

    async putFollowUser(req: any, res: any, next: any) {
        this.genericFollow(req, "followedUsers")
            .then((loggedUser: any) => {
                console.log(loggedUser)
                req.followUnfollowData = loggedUser;
                next();
            })
            .catch((e: any) => {
                next(e);
            });
    }

    async genericFollow(req: any, collection: string) {
        return User.findOneAndUpdate({
                _id: req.decoded._id,
                [collection]: {$nin: [sanitize(req.body.id)]}
            },
            {"$push": {[collection]: sanitize(req.body.id)}},
            {returnOriginal: false, runValidators: true});
    }

    async genericUnfollow(req: any, collection: string) {
        return User.findOneAndUpdate({
                _id: req.decoded._id,
                [collection]: {$in: [sanitize(req.body.id)]}
            },
            {"$pull": {[collection]: sanitize(req.body.id)}},
            {returnOriginal: false, runValidators: true});
    }

    async putUnfollowUser(req: any, res: any, next: any) {
        this.genericUnfollow(req, "followedUsers")
            .then((loggedUser: any) => {
                req.followUnfollowData = loggedUser;
                next();
            })
            .catch((e: any) => {
                next(e);
            });
    }

    async getFollowers(req: any, res: any, next: any) {
        User.find({"followedUsers": {$in: [sanitize(req.params.id)]}})
            .then((data: any) => {
                if (data.length == 0) {
                    res.status(StatusCodes.NO_CONTENT).json();
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) => {
                next(e);
            });
    }

    async filterUsersFollowers(req: any, res: any, next: any) {
        User.find({
            $and: [
                {username: {$regex: (req.query.username) ? sanitize(req.query.username) : ""}},
                (req.query.follower == "true") ?
                    {followedUsers: {$in: [mongoose.Types.ObjectId.createFromHexString(sanitize(req.decoded._id))]}} : {}
            ]
        })
            .then((data: any) => {
                if (!data || data.length == 0) {
                    res.status(StatusCodes.NO_CONTENT).json();
                } else {
                    req.followers = data;
                    next();
                }
            })
            .catch((e: any) => {
                next(e);
            });
    }

    async filterUsersFollowed(req: any, res: any, next: any) {
        if (req.query.followed == "true") {
            User.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId.createFromHexString(sanitize(req.decoded._id))
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        let: {"followedUsersLogged": "$followedUsers"},
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {$expr: {$in: ["$_id", "$$followedUsersLogged"]}},
                                        {username: {$regex: (req.query.username) ? sanitize(req.query.username) : ""}}
                                    ]
                                }
                            }
                        ],
                        as: "followedUsers"
                    }
                }
            ])
                .then((data: any) => {
                    if (!data || data.length == 0 || data[0].followedUsers.length == 0) {
                        res.status(StatusCodes.NO_CONTENT).json();
                    } else {
                        req.followed = data[0].followedUsers;
                        next();
                    }
                })
                .catch((e: any) => {
                    next(e);
                });
        } else {
            next();
        }
    }

    async validateFilter(req: any, res: any) {
        if (req.query.followed == "true" && req.query.follower == "true") {
            let users = Helper.intersect(req.followed, req.followers);
            if (users.length == 0) {
                res.status(StatusCodes.NO_CONTENT).json();
            } else {
                res.status(StatusCodes.OK).json(users);
            }
        } else if (req.query.followed == "true") {
            res.status(StatusCodes.OK).json(req.followed);
        } else {
            res.status(StatusCodes.OK).json(req.followers);
        }
    }

    async putFollowDeck(req: any, res: any, next: any) {
        this.genericFollow(req, "followedDecks")
            .then((loggedUser: any) => {
                req.followUnfollowData = loggedUser;
                next();
            })
            .catch((e: any) => {
                next(e);
            });
    }

    async putUnfollowDeck(req: any, res: any, next: any) {
        this.genericUnfollow(req, "followedDecks")
            .then((loggedUser: any) => {
                req.followUnfollowData = loggedUser;
                next();
            })
            .catch((e: any) => {
                next(e);
            });
    }

    async validateFollowUnfollow(req: any, res: any) {
        if (!req.followUnfollowData) {
            res.status(StatusCodes.BAD_REQUEST).json();
        } else {
            res.status(StatusCodes.OK).json(req.followUnfollowData);
        }
    }

    async getDecksFollowed(req: any, res: any, next: any) {
        User.findById((req.params.id) ? sanitize(req.params.id) : req.decoded._id, 'followedDecks')
            .populate("followedDecks").exec()
            .then((data: any) => {
                req.userDecksFollowed = data;
                next();
            })
            .catch((e: any) => {
                next(e);
            });
    }

    async validateDecksFollowed(req: any, res: any) {
        if (!req.userDecksFollowed || req.userDecksFollowed.length == 0) {
            res.status(StatusCodes.NO_CONTENT).json();
        } else {
            res.status(StatusCodes.OK).json(req.userDecksFollowed);
        }
    }

    async updateUser(req: any, res: any, next: any) {
        User.findByIdAndUpdate(req.decoded._id,
            {
                name: sanitize(req.body.name),
                surname: sanitize(req.body.surname),
                username: sanitize(req.body.username),
                email: sanitize(req.body.email),
                profilePicture: sanitize(req.body.profilePicture)
            },
            {returnOriginal: false, runValidators: true})
            .then((data: any) =>{
                if(!data) {
                    res.status(StatusCodes.NOT_FOUND).json();
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) => {
                next(e);
            })
    }

    async verifyNewPassword(req: any, res: any, next: any) {
        if (!req.body.passwords) {
            next();
        } else if (!req.body.passwords.old || !req.body.passwords.new) {
            res.status(StatusCodes.BAD_REQUEST).json("Old or new password missing");
        } else {
            User.findById(req.decoded._id)
                .then((user: any) => {
                    compare(req.body.passwords.old, user.password).then((match: boolean) => {
                        if (!match) {
                            res.status(StatusCodes.BAD_REQUEST).json("Incorrect password");
                        } else {
                            User.findByIdAndUpdate(req.decoded._id,
                                {password: hashSync(req.body.passwords.new, SALT_ROUNDS)}).then(next());
                        }
                    });
                })
                .catch((e: any) => {
                    next(e);
                });
        }
    }
}