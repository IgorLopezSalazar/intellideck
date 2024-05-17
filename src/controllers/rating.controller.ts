import sanitize from 'mongo-sanitize';

import {Rating} from "../models/rating.ts";
import {StatusCodes} from 'http-status-codes';

export class RatingController {
    async postRating(req: any, res: any) {
        let rating = new Rating({
            rate: sanitize(req.body.rate),
            user: sanitize(req.decoded._id),
            deck: sanitize(req.params.id)
        })
        Rating.create(rating)
            .then((data: any) =>
                res.status(StatusCodes.CREATED).json(data))
            .catch((e: any) => {
                res.status(StatusCodes.BAD_REQUEST).json("The rating could not be created");
                console.log(e);
            })
    }

    async getAvgRatingOfDeck(req: any, res: any) {
        Rating.find({
            deck: sanitize(req.params.id)
        }).then((data: any[]) => {
            if (data.length == 0) {
                res.status(StatusCodes.OK).json({rate: 0});
            } else {
                res.status(StatusCodes.OK).json({rate: this.calculateAvgRating(data)});
            }
        }).catch((e: any) => {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error while retrieving the data");
            console.log(e);
        });
    }

    calculateAvgRating(data: any) {
        let avg: number = 0;
        data.forEach((rating: any) => avg = avg + rating.rate);
        return Math.round(avg / data.length);
    }

    async putRating(req: any, res: any) {
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
                    res.status(StatusCodes.BAD_REQUEST).json("Rating could not be updated");
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) => {
                res.status(StatusCodes.BAD_REQUEST).json("The rating could not be created");
                console.log(e);
            })
    }

    async deleteRating(req: any, res: any) {
        Rating.findOneAndDelete({
            user: sanitize(req.decoded._id),
            deck: sanitize(req.params.id)
        })
            .then((data: any) =>
                res.status(StatusCodes.NO_CONTENT).json())
            .catch((e: any) => {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error while retrieving the data");
                console.log(e);
            })
    }
}