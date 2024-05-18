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
            deck: req.params.id
        })
        DeckTraining.create(deckTraining)
            .then((data: any) => {
                req.deckTraining = data._id;
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
                req.deckTraining = data._id;
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
                req.deckTraining = data._id;
                next();
            })
            .catch((e: any) => {
                res.status(StatusCodes.NO_CONTENT).json();
            })
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
                    if(!req.body.cards) {
                        res.status(StatusCodes.OK).json();
                    } else {
                        req.deckTraining = data._id;
                        req.boxAmount = data.boxAmount;
                        next();
                    }
                }
            })
            .catch((e: any) => {
                res.status(StatusCodes.BAD_REQUEST).json("The deck training could not be updated");
                console.log(e);
            })
    }
}