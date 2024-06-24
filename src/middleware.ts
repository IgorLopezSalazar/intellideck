import {StatusCodes} from 'http-status-codes';
import fs from 'fs';
import jwt from 'jsonwebtoken';
export class Middleware {
    readPrivateKey() {
        return fs.readFileSync('./private.key', "utf-8");
    }
    readPublicKey() {
        return fs.readFileSync('./public.key', "utf-8");
    }
    async isAuthenticated(req: any, res:any, next: any) {
        this.tokenProvided(req, res)
            .then(token => {
                if (token) {
                    jwt.verify(token, this.readPublicKey(), (err:any, decoded:any) => {
                        if (!err) {
                            req.decoded = decoded;
                            next();
                        } else
                            res.status(StatusCodes.UNAUTHORIZED).json("You are not logged");
                    });
                }
            })
    }

    async isAdmin(req: any, res:any, next: any) {
        if (req.decoded.role == "ADMIN") {
            next();
        } else
            res.status(StatusCodes.FORBIDDEN).json();
    }

    async generateToken(id: string, role: string) {
        return "Bearer " + jwt.sign({ "_id": id, "role": role }, this.readPrivateKey(), {
            expiresIn: '1h',
            algorithm: 'RS256'
        });
    }

    async tokenProvided(req: any, res: any) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
            return req.headers.authorization.split(' ')[1];
        else res.status(StatusCodes.BAD_REQUEST).json('No token provided');
    }
}