import sanitize from 'mongo-sanitize';

import {Rating} from "../models/rating.ts";
import {StatusCodes} from 'http-status-codes';

export class RatingController {
    async postRating(req: any, res: any, next: any) {
        let rating = new Rating({
            rate: sanitize(req.body.rate),
            user: sanitize(req.decoded._id),
            deck: sanitize(req.params.id)
        })
        Rating.create(rating)
            .then((data: any) => {
                req.rating = data;
                next();
            })
            .catch((e: any) => {
                next(e);
            })
    }

    async responsePostRating(req: any, res: any) {
        res.status(StatusCodes.CREATED).json(req.rating);
    }

    async responsePutRating(req: any, res: any) {
        res.status(StatusCodes.OK).json(req.rating);
    }

    async responseDeleteRating(req: any, res: any) {
        res.status(StatusCodes.NO_CONTENT).json();
    }

    async getAvgRatingOfDeck(req: any, res: any, next: any) {
        Rating.find({
            deck: sanitize(req.params.id)
        }).then((data: any[]) => {
            if (data.length == 0) {
                req.avg = 0;
            } else {
                req.avg = this.calculateAvgRating(data);
            }
            next();
        }).catch((e: any) => {
            next(e);
        });
    }

    calculateAvgRating(data: any) {
        let avg: number = 0;
        data.forEach((rating: any) => avg = avg + rating.rate);
        return Math.round(avg / data.length);
    }

    async putRating(req: any, res: any, next: any) {
        Rating.findOneAndUpdate({
            user: sanitize(req.decoded._id),
            deck: sanitize(req.params.id)
        }, {
            rate: sanitize(req.body.rate)
        }, {
            returnOriginal: false,
            runValidators: true
        })
            .then((data: any) => {
                if (!data) {
                    res.status(StatusCodes.BAD_REQUEST).json();
                } else {
                    req.rating = data;
                    next();
                }
            })
            .catch((e: any) => {
                next(e);
            })
    }

    async deleteRating(req: any, res: any, next: any) {
        Rating.findOneAndDelete({
            user: sanitize(req.decoded._id),
            deck: sanitize(req.params.id)
        })
            .then((data: any) => next())
            .catch((e: any) => {
                next(e);
            })
    }

    async getRating(req: any, res: any, next: any) {
        Rating.findOne({
            user: sanitize(req.decoded._id),
            deck: sanitize(req.params.id)
        })
            .then((data: any) => {
                if (!data) {
                    res.status(StatusCodes.NO_CONTENT).json();
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) => {
                next(e);
            })
    }
}