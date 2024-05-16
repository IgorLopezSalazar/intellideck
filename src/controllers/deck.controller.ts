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

    async getUserDecks(req: any, res: any) {
        Deck.find({
            creator: sanitize(req.params.id),
            isPublished: true
        }).then((data: any[]) => {
            if (data.length == 0) {
                res.status(StatusCodes.NO_CONTENT).json();
            } else {
                res.status(StatusCodes.OK).json(data);
            }
        });
    }

    async findById(req: any, res: any, next: any) {
        Deck.findOne({
            _id: sanitize(req.body.id),
            isPublished: true
        }).then((data: any) => {
            if (!data) {
                res.status(StatusCodes.NOT_FOUND).json("The specified deck was not found");
            } else {
                next();
            }
        });
    }

    async updateDeck(req: any, res: any) {
        Deck.findByIdAndUpdate(sanitize(req.params.id), {
            title: sanitize(req.body.title),
            description: sanitize(req.body.description),
            image: sanitize(req.body.image),
            topic: sanitize(req.body.topic),
            tags: sanitize(req.body.tags)
        }, {returnOriginal: false})
            .populate("topic")
            .populate("tags")
            .exec()
            .then((data: any) => {
                res.status(StatusCodes.OK).json(data);
            })
            .catch((e: any) => {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error while retrieving the data");
                console.log(e);
            })
    }

    async verifyCreator(req: any, res: any, next: any) {
        Deck.findOne({
            _id: sanitize(req.params.id),
            creator: req.decoded._id
        }).then((data: any) => {
            if (!data) {
                res.status(StatusCodes.BAD_REQUEST).json("Deck not yours");
            } else {
                next();
            }
        }).catch((e: any) => {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error while retrieving the data");
            console.log(e);
        })
    }

    async verifyUnpublished(req: any, res: any, next: any) {
        Deck.findOne({
            _id: sanitize(req.params.id),
            isPublished: false
        }).then((data: any) => {
            if (!data) {
                res.status(StatusCodes.BAD_REQUEST).json("Deck is already published");
            } else {
                next();
            }
        }).catch((e: any) => {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error while retrieving the data");
            console.log(e);
        })
    }
}