import sanitize from 'mongo-sanitize';

import {Card} from "../models/card.ts";
import {StatusCodes} from 'http-status-codes';

export class CardController {
    async postCard(req: any, res: any) {
        let card = new Card({
            question: sanitize(req.body.question),
            answer: sanitize(req.body.answer),
            image: sanitize(req.body.image),
            deck: sanitize(req.params.id)
        })
        Card.create(card)
            .then((data: any) =>
                res.status(StatusCodes.CREATED).json(data))
            .catch((e: any) => {
                res.status(StatusCodes.BAD_REQUEST).json("The card could not be created");
                console.log(e);
            })
    }

    async getCardsOfDeck(req: any, res: any, next: any) {
        Card.find({
            deck: sanitize(req.params.id)
        }).then((data: any) => {
            req.cards = data;
            next();
        }).catch((e: any) => {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error while retrieving the data");
            console.log(e);
        });
    }

    async validateCardsOfDeck(req: any, res: any) {
        if (req.cards.length == 0) {
            res.status(StatusCodes.NO_CONTENT).json();
        } else {
            res.status(StatusCodes.OK).json(req.cards);
        }
    }

    async putCard(req: any, res: any) {
        Card.findByIdAndUpdate(sanitize(req.params.cardId), {
            question: sanitize(req.body.question),
            answer: sanitize(req.body.answer),
            image: sanitize(req.body.image)
        }, {returnOriginal: false, runValidators: true})
            .then((data: any) => {
                if (!data) {
                    res.status(StatusCodes.BAD_REQUEST).json("Card could not be updated");
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) => {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error while retrieving the data");
                console.log(e);
            })
    }

    async deleteCard(req: any, res: any) {
        Card.findByIdAndDelete(sanitize(req.params.cardId))
            .then((data: any) =>
                res.status(StatusCodes.NO_CONTENT).json())
            .catch((e: any) => {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error while retrieving the data");
                console.log(e);
            })
    }
}