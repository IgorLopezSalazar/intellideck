import sanitize from 'mongo-sanitize';

import {Deck} from "../models/deck.ts";
import {StatusCodes} from 'http-status-codes';

export class DeckController {
    async postDeck(req: any, res: any) {
        let deck = new Deck({
            title: sanitize(req.body.title),
            description: sanitize(req.body.description),
            image: sanitize(req.body.image),
            isPublished: false,
            creator: req.decoded._id
        })
        Deck.create(deck)
            .then((data: any) =>
                res.status(StatusCodes.CREATED).json(data))
            .catch((e: any) => {
                res.status(StatusCodes.BAD_REQUEST).json("The deck could not be created");
                console.log(e);
            })
    }

    getUserDecks(req: any, res: any) {
        Deck.find({"creator": sanitize(req.params.id)})
            .then((data: any[]) => {
                if (data.length == 0) {
                    res.status(StatusCodes.NO_CONTENT).json();
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            });
    }

    findById(req: any, res: any, next: any) {
        Deck.findById(sanitize(req.body.id))
            .then((data: any) => {
                if (!data) {
                    res.status(StatusCodes.NOT_FOUND).json("The specified deck was not found");
                } else {
                    next();
                }
            });
    }

    async updateDeck(req: any, res: any) {
        Deck.findOneAndUpdate({
                _id: sanitize(req.params.id),
                isPublished: false,
                creator: req.decoded._id
            }, {
                title: sanitize(req.body.title),
                description: sanitize(req.body.description),
                image: sanitize(req.body.image)
            },
            {returnOriginal: false})
            .then((data: any) => {
                if(!data) {
                    res.status(StatusCodes.BAD_REQUEST).json("Deck already published or not yours");
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) => {
                res.status(StatusCodes.BAD_REQUEST).json("Data sent was not correct");
                console.log(e);
            })
    }
}