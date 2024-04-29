import pkg from 'bcryptjs';
const { hashSync } = pkg;

import {User} from "../models/user.js";


const SALT_ROUNDS : number = 10;

export class UserController {
    async getAllUsers(req: any, res: any) {
        User.find({})
            .then((data: any) =>
                res.status(200).json(data))
            .catch((e: any) =>
                res.status(404).json("No result found"));
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
                res.status(201).json(data))
            .catch((e: any) =>
                res.status(409).json("A user with the same email or username already exists"));
    }
}