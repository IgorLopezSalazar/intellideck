import sanitize from 'mongo-sanitize';

import {Deck} from "../models/deck.ts";
import {StatusCodes} from 'http-status-codes';
import {Helper} from "../helper.ts";

const PAGINATION_SIZE: number = 20;
export class DeckController {
    async getPaginatedDecks(req: any, res: any, next: any) {
        Deck.find({}, null,
            {skip: PAGINATION_SIZE * req.query.page, limit: PAGINATION_SIZE, sort: {avgDeckRating: 'desc'}})
            .then((data: any) =>{
                if(!data || data.length == 0) {
                    res.status(StatusCodes.NO_CONTENT).json();
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) => {
                next(e);
            })
    }

    async postDeck(req: any, res: any, next: any) {
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
                next(e);
            })
    }

    async copyDeck(req: any, res: any, next: any) {
        Deck.findById(req.params.id)
            .then((data: any) => {
            if (!data) {
                res.status(StatusCodes.NOT_FOUND).json();
            } else {
                let deck = data.toObject();
                delete deck._id;
                delete deck.publishDate;
                delete deck.avgDeckRating;
                deck.isPublished = false;
                deck.creator = req.decoded._id;

                Deck.create(deck)
                    .then((data2: any) =>{
                        req.deck = data2;
                        next();
                    })
                    .catch((e: any) => {
                        next(e);
                    })
            }
        }).catch((e: any) => {
            next(e);
        });
    }

    async getUserDecks(req: any, res: any, next: any) {
        Deck.find({
            creator: sanitize(req.params.id),
            isPublished: true
        }).then((data: any[]) => {
            if (data.length == 0) {
                res.status(StatusCodes.NO_CONTENT).json();
            } else {
                res.status(StatusCodes.OK).json(data);
            }
        }).catch((e: any) => {
            next(e);
        });
    }

    async verifyPublished(req: any, res: any, next: any) {
        Deck.findOne({
            $or: [
                {_id: sanitize(req.body.id)},
                {_id: sanitize(req.params.id)}
            ],
            isPublished: true
        }).then((data: any) => {
            if (!data) {
                res.status(StatusCodes.NOT_FOUND).json();
            } else {
                next();
            }
        }).catch((e: any) => {
            next(e);
        });
    }

    async updateDeck(req: any, res: any, next: any) {
        Deck.findByIdAndUpdate(sanitize(req.params.id), {
            title: sanitize(req.body.title),
            description: sanitize(req.body.description),
            image: sanitize(req.body.image),
            topic: sanitize(req.body.topic),
            tags: sanitize(req.body.tags)
        }, {returnOriginal: false, runValidators: true})
            .populate("topic")
            .populate("tags")
            .exec()
            .then((data: any) => {
                res.status(StatusCodes.OK).json(data);
            })
            .catch((e: any) => {
                next(e);
            })
    }

    async updateDeckRating(req: any, res: any, next: any) {
        Deck.findByIdAndUpdate(sanitize(req.params.id), {
            avgDeckRating: req.avg
        }, {returnOriginal: false, runValidators: true})
            .then((data: any) => {
                next();
            })
            .catch((e: any) => {
                next(e);
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
            next(e);
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
            next(e);
        })
    }

    async publishDeck(req: any, res: any, next: any) {
        if (req.cards.length == 0) {
            res.status(StatusCodes.BAD_REQUEST).json("Cannot publish a deck without cards");
        } else {
            Deck.findByIdAndUpdate(sanitize(req.params.id), {
                isPublished: true,
                publishDate: new Date()
            }, {returnOriginal: false, runValidators: true})
                .then((data: any) => {
                    res.status(StatusCodes.OK).json(data);
                })
                .catch((e: any) => {
                    next(e);
                })
        }
    }

    async getDecksForToday(req: any, res: any, next: any) {
        if (req.cards.length == 0) {
            res.status(StatusCodes.NO_CONTENT).json();
        } else {
            let deckTrainingIds = req.cards.map((card: any) => card.deckTraining.toString());
            console.log(deckTrainingIds);
            let decks = req.deckTrainings.filter((dt: any) => deckTrainingIds.indexOf(dt._id.toString()) != -1).map((dt: any) => dt.deck);
            console.log(decks);
            Deck.find({_id: {$in: decks}})
                .then((data: any) => {
                    res.status(StatusCodes.OK).json(data);
                })
                .catch((e: any) => {
                    next(e);
                })
        }
    }

    async filterDecks(req: any, res: any, next: any) {
        let date = new Date(sanitize(req.query.date));
        Deck.aggregate([
            {
                $match: {
                    $and: [
                        {title: {$regex: (req.query.title) ? sanitize(req.query.title) : ""}},
                        {isPublished: true},
                        {publishDate: {$gte: (Number.isNaN(date.valueOf()))? new Date(0) : date}},
                        {avgDeckRating: {$gte: (req.query.avgDeckRating)? sanitize(Number.parseInt(req.query.avgDeckRating)): 0}}
                    ]
                }
            },
            {
                $lookup: {
                    from: "topics",
                    let: {"topic": "$topic"},
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    {$expr: {$eq: ["$_id", "$$topic"]}},
                                    {name: {$regex: (req.query.topic) ? sanitize(req.query.topic) : ""}}
                                ]
                            }
                        }
                    ],
                    as: "topic"
                }
            },
            {
                $lookup: {
                    from: "tags",
                    let: {"tags": "$tags"},
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    {$expr: {$in: ["$_id", "$$tags"]}},
                                    {name: {$regex: (req.query.tag) ? sanitize(req.query.tag) : ""}}
                                ]
                            }
                        }
                    ],
                    as: "tags"
                }
            },
            {
                $lookup: {
                    from: "users",
                    let: {"creator": "$creator"},
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    {$expr: {$eq: ["$_id", "$$creator"]}},
                                    {username: {$regex: (req.query.creator) ? sanitize(req.query.creator) : ""}}
                                ]
                            }
                        }
                    ],
                    as: "creator"
                }
            },
            {
                $match: {
                    $and: [
                        {$expr: {$ne:["$topic", []]}},
                        {$expr: {$ne:["$tags", []]}},
                        {$expr: {$ne:["$creator", []]}}
                    ]
                }
            },
        ])
            .then((data: any) => {
                if(!data || data.length == 0) {
                    res.status(StatusCodes.NO_CONTENT).json();
                }
                else {
                    req.decks = data;
                    next();
                }
            })
            .catch((e: any) => {
                next(e);
            });
    }

    async validateFilter(req: any, res: any) {
        if (req.query.followed == "true") {
            let decks = Helper.intersect(req.decks, req.userDecksFollowed.followedDecks);
            if (decks.length == 0) {
                res.status(StatusCodes.NO_CONTENT).json();
            } else {
                res.status(StatusCodes.OK).json(decks);
            }
        } else {
            res.status(StatusCodes.OK).json(req.decks);
        }
    }
}