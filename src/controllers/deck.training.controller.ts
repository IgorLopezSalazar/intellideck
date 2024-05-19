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
                res.status(StatusCodes.BAD_REQUEST).json("The deck training could not be created");
                console.log(e);
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

    async getDeckTraining(req: any, res: any, next: any) {
        DeckTraining.findOne({
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

    async validateDeckTraining(req: any, res: any) {
        if (!req.deckTraining) {
            res.status(StatusCodes.NO_CONTENT).json();
        } else {
            res.status(StatusCodes.OK).json(req.deckTraining);
        }
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
                    res.status(StatusCodes.NOT_FOUND).json("Deck training not found");
                } else {
                    if (!req.body.cards) {
                        res.status(StatusCodes.OK).json();
                    } else {
                        req.deckTraining = data;
                        next();
                    }
                }
            })
            .catch((e: any) => {
                res.status(StatusCodes.BAD_REQUEST).json("The deck training could not be updated");
                console.log(e);
            })
    }

    async putStatisticsAverageTime(req: any, res: any, next: any) {
        if(!req.body.completionTimeSeconds) {
            res.status(StatusCodes.BAD_REQUEST).json("Time taken to study the deck missing");
        } else {
            const avgCompletionTimeSeconds = Math.round(((req.deckTraining.statistics.avgCompletionTimeSeconds *
                    (req.deckTraining.statistics.attempts))
                + req.body.completionTimeSeconds) / (req.deckTraining.statistics.attempts + 1));
            DeckTraining.findOneAndUpdate({
                    user: req.decoded._id,
                    deck: req.params.id
                }, {
                    "$set": {"statistics.avgCompletionTimeSeconds": avgCompletionTimeSeconds},
                    $inc: {"statistics.attempts": 1}
                },
                {returnOriginal: false, runValidators: true, omitUndefined: true})
                .then((data: any) => {
                    if (!data) {
                        res.status(StatusCodes.BAD_REQUEST).json("Deck training could not be updated");
                    } else {
                        req.deckTraining = data;
                        next();
                    }
                })
                .catch((e: any) => {
                    res.status(StatusCodes.BAD_REQUEST).json("The deck training could not be updated");
                    console.log(e);
                })
        }
    }
}