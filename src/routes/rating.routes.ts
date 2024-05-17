import express from 'express';
import {Middleware} from "../middleware.ts";
import {DeckController} from "../controllers/deck.controller.ts";
import {RatingController} from "../controllers/rating.controller.ts";

const router = express.Router();
const deckController = new DeckController();
const ratingController = new RatingController();
const middleware: Middleware = new Middleware();

router.post('/decks/:id/ratings',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyPublished(req, res, next);
}, (req: any, res: any) => {
    return ratingController.postRating(req, res);
})

router.get('/decks/:id/ratings',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any) => {
    return ratingController.getAvgRatingOfDeck(req, res);
})

router.put('/decks/:id/ratings',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyPublished(req, res, next);
}, (req: any, res: any) => {
    return ratingController.putRating(req, res);
})

router.delete('/decks/:id/ratings',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyPublished(req, res, next);
}, (req: any, res: any) => {
    return ratingController.deleteRating(req, res);
})

export{ router };