import {DeckTraining} from "../models/deck.training.ts";
import sanitize from "mongo-sanitize";
import {StatusCodes} from "http-status-codes";

export class DeckTrainingController {
    async postDeckTraining(req: any, res: any, next: any) {
        let deckTraining = new DeckTraining({
            startDate: new Date(),
            boxAmount: sanitize(req.body.boxAmount),
            backtrack: sanitize(req.body.backtrack),
            user: req.decoded._id,
            deck: req.params.id,
            statistics: {
                attempts: 0,
                avgCompletionTimeSeconds: 0
            }
        })
        DeckTraining.create(deckTraining)
            .then((data: any) => {
                req.deckTraining = data;
                next();
            })
            .catch((e: any) => {
                next(e);
            })
    }

    async deleteDeckTraining(req: any, res: any, next: any) {
        DeckTraining.findOneAndDelete({
            user: req.decoded._id,
            deck: req.params.id
        })
            .then((data: any) => {
                req.deckTraining = data;
                next();
            })
            .catch((e: any) => {
                res.status(StatusCodes.NO_CONTENT).json();
            })
    }

    async deleteDeckTrainings(req: any, res: any, next: any) {
        DeckTraining.find({deck: req.deck._id})
            .then((data: any) => {
                req.deckTrainings = data;
                DeckTraining.deleteMany({
                    deck: req.deck._id
                })
                    .then((data: any) => {
                        next();
                    })
                    .catch((e: any) => {
                        next(e);
                    })
            })
            .catch((e: any) => {
                next(e);
            });
    }

    async getDeckTraining(req: any, res: any, next: any) {
        DeckTraining.findOne({
            user: req.decoded._id,
            deck: req.params.id
        })
            .then((data: any) => {
                if (!data) {
                    res.status(StatusCodes.NOT_FOUND).json();
                } else {
                    req.deckTraining = data;
                    next();
                }
            })
            .catch((e: any) => {
                next(e);
            })
    }

    async getDeckTrainingsOfUser(req: any, res: any, next: any) {
        DeckTraining.find({user: req.decoded._id})
            .then((data: any) => {
                req.deckTrainings = data;
                next();
            })
            .catch((e: any) => {
                next(e);
            })
    }

    async validateDeckTraining(req: any, res: any) {
        res.status(StatusCodes.OK).json(req.deckTraining);
    }

    async putDeckTraining(req: any, res: any, next: any) {
        const date = req.body.resetDate ? new Date() : undefined;
        DeckTraining.findOneAndUpdate({
                user: req.decoded._id,
                deck: req.params.id
            }, {
                startDate: date,
                boxAmount: sanitize(req.body.boxAmount),
                backtrack: sanitize(req.body.backtrack)
            },
            {returnOriginal: false, runValidators: true, omitUndefined: true})
            .then((data: any) => {
                if (!data) {
                    res.status(StatusCodes.NOT_FOUND).json();
                } else if (!req.body.cards) {
                    res.status(StatusCodes.OK).json(data);
                } else {
                    req.deckTraining = data;
                    next();
                }
            })
            .catch((e: any) => {
                next(e);
            })
    }

    async putStatisticsAverageTime(req: any, res: any, next: any) {
        if (!req.body.completionTimeSeconds || req.body.completionTimeSeconds < 0) {
            res.status(StatusCodes.BAD_REQUEST).json("Missing or invalid completion time of attempt");
        } else {
            const avgCompletionTimeSeconds = ((req.deckTraining.statistics.avgCompletionTimeSeconds *
                    (req.deckTraining.statistics.attempts))
                + req.body.completionTimeSeconds) / (req.deckTraining.statistics.attempts + 1);
            DeckTraining.findOneAndUpdate({
                    user: req.decoded._id,
                    deck: req.params.id
                }, {
                    "$set": {"statistics.avgCompletionTimeSeconds": avgCompletionTimeSeconds},
                    $inc: {"statistics.attempts": 1}
                },
                {returnOriginal: false, runValidators: true, omitUndefined: true})
                .then((data: any) => {
                    req.deckTraining = data;
                    next();
                })
                .catch((e: any) => {
                    next(e);
                })
        }
    }
}