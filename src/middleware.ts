import {StatusCodes} from "http-status-codes/build/es/index.js";

export class Middleware {
    // async isAuthenticated(req: any, res:any, next: any) {
    //     let token = this.tokenProvided(req, res);
    //     if (token) {
    //         jwt.verify(token, readKey(), (err, decoded) => {
    //             if (!err) {
    //                 req.decoded = decoded;
    //                 next();
    //             } else
    //                 res.status(httpCode.codes.UNAUTHORIZED).json('You are not logged');
    //         });
    //     }
    // }

    async tokenProvided(req: any, res: any) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
            return req.headers.authorization.split(' ')[1];
        else
            res.status(StatusCodes.BAD_REQUEST).json('No token provided');
    }
}