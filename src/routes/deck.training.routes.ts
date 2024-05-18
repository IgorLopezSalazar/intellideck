import express from 'express';
import {Middleware} from "../middleware.ts";
import {DeckTrainingController} from "../controllers/deck.training.controller.ts";
import {DeckController} from "../controllers/deck.controller.ts";

const router = express.Router();
const deckTrainingController = new DeckTrainingController();
const deckController = new DeckController();
const middleware: Middleware = new Middleware();

router.post('/decks/:id/deckTraining',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyPublished(req, res, next);
}, (req: any, res: any) => {
    return deckTrainingController.postDeckTraining(req, res);
})

router.put('/decks/:id/deckTraining',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyPublished(req, res, next);
}, (req: any, res: any) => {
    return deckTrainingController.putDeckTraining(req, res);
})

router.delete('/decks/:id/deckTraining',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyPublished(req, res, next);
}, (req: any, res: any) => {
    return deckTrainingController.deleteDeckTraining(req, res);
})

export{ router };