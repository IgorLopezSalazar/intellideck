import pkg from 'bcryptjs';
const { hashSync, compare } = pkg;

import {User} from "../models/user.ts";
import StatusCodes from "http-status-codes";
import {Middleware} from "../middleware.ts";


const SALT_ROUNDS : number = 10;
const middleware: Middleware = new Middleware();

export class UserController {
    async getAllUsers(req: any, res: any) {
        User.find({})
            .then((data: any) =>
                res.status(StatusCodes.OK).json(data))
            .catch((e: any) =>
                res.status(StatusCodes.NOT_FOUND).json("No result found"));
    }

    async postUser(req: any, res: any) {
        let user = new User({
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            password: hashSync(req.body.password, SALT_ROUNDS),
            profilePicture: req.body.profilePicture,
            role: req.body.role
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
            .then((data: any) =>
                res.status(StatusCodes.OK).json(data))
            .catch((e: any) =>
                res.status(StatusCodes.NOT_FOUND).json("No result found"));
    }

    async login(req: any, res: any) {
        User.findOne({username: req.body.username})
            .then((user: any) => {
                if(!user) {
                    res.status(StatusCodes.UNAUTHORIZED).json("Authentication failed");
                }
                compare(req.body.password, user.password)
                    .then((match: boolean) => {
                        if(!match) {
                            res.status(StatusCodes.UNAUTHORIZED).json("Authentication failed");
                        }
                        middleware.generateToken(user.username, user.role, res);
                    })
            })
            .catch((e: any) => {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error while processing the login. Please try again later");
                console.log(e);
            });

    }
}