import sanitize from 'mongo-sanitize';

import {Deck} from "../models/deck.ts";
import StatusCodes from "http-status-codes";
import {Middleware} from "../middleware.ts";


const SALT_ROUNDS: number = 10;
const middleware: Middleware = new Middleware();

export class DeckController {
    async postDeck(req: any, res: any) {
        let deck = new Deck({
            title: sanitize(req.body.title),
            description: sanitize(req.body.description),
            image: sanitize(req.body.image),
            isPublished: sanitize(req.body.isPublished),
            creator: req.loggedUser
        })
        Deck.create(deck)
            .then((data: any) =>
                res.status(StatusCodes.CREATED).json(data))
            .catch((e: any) => {
                res.status(StatusCodes.CONFLICT).json("A deck with the same title already exists");
                console.log(e);
            })
    }
}