import {DeckTraining} from "../models/deck.training.ts";
import sanitize from "mongo-sanitize";
import {StatusCodes} from "http-status-codes";

export class DeckTrainingController {
    async postDeckTraining(req: any, res: any) {
        let deckTraining = new DeckTraining({
            startDate: new Date(),
            boxAmount: sanitize(req.body.boxAmount),
            backtrack: sanitize(req.body.backtrack),
            user: req.decoded._id,
            deck: req.params.id
        })
        DeckTraining.create(deckTraining)
            .then((data: any) =>
                res.status(StatusCodes.CREATED).json(data))
            .catch((e: any) => {
                res.status(StatusCodes.BAD_REQUEST).json("The deck training could not be created");
                console.log(e);
            })
    }

    async deleteDeckTraining(req: any, res: any) {
        DeckTraining.findOneAndDelete({
            user: req.decoded._id,
            deck: req.params.id
        })
            .then((data: any) =>
                res.status(StatusCodes.NO_CONTENT).json())
            .catch((e: any) => {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error while retrieving the data");
                console.log(e);
            })
    }

    async putDeckTraining(req: any, res: any) {
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
                if(!data) {
                    res.status(StatusCodes.NOT_FOUND).json("Deck training not found");
                }
                else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) => {
                res.status(StatusCodes.BAD_REQUEST).json("The deck training could not be updated");
                console.log(e);
            })
    }
}