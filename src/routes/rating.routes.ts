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
}, (req: any, res: any, next: any) => {
    return ratingController.postRating(req, res, next);
}, (req: any, res: any, next: any) => {
    return ratingController.getAvgRatingOfDeck(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.updateDeckRating(req, res, next);
}, (req: any, res: any) => {
    return ratingController.responsePostRating(req, res);
})

router.put('/decks/:id/ratings',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyPublished(req, res, next);
}, (req: any, res: any, next: any) => {
    return ratingController.putRating(req, res, next);
}, (req: any, res: any, next: any) => {
    return ratingController.getAvgRatingOfDeck(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.updateDeckRating(req, res, next);
}, (req: any, res: any) => {
    return ratingController.responsePutRating(req, res);
})

router.delete('/decks/:id/ratings',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyPublished(req, res, next);
}, (req: any, res: any, next: any) => {
    return ratingController.deleteRating(req, res, next);
}, (req: any, res: any, next: any) => {
    return ratingController.getAvgRatingOfDeck(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.updateDeckRating(req, res, next);
}, (req: any, res: any) => {
    return ratingController.responseDeleteRating(req, res);
})

router.get('/decks/:id/ratings',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyPublished(req, res, next);
}, (req: any, res: any, next: any) => {
    return ratingController.getRating(req, res, next);
})

export{ router };