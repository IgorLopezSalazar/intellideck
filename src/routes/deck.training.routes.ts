import express from 'express';
import {Middleware} from "../middleware.ts";
import {DeckTrainingController} from "../controllers/deck.training.controller.ts";
import {DeckController} from "../controllers/deck.controller.ts";
import {CardController} from "../controllers/card.controller.ts";
import {CardTrainingController} from "../controllers/card.training.controller.ts";

const router = express.Router();
const deckTrainingController = new DeckTrainingController();
const cardTrainingController = new CardTrainingController();
const deckController = new DeckController();
const cardController = new CardController();
const middleware: Middleware = new Middleware();

router.post('/decks/:id/deckTraining',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyPublished(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckTrainingController.postDeckTraining(req, res, next);
}, (req: any, res: any, next: any) => {
    return cardController.getCardsOfDeck(req, res, next);
}, (req: any, res: any, next: any) => {
    return cardTrainingController.postCardTrainings(req, res, next);
})

router.put('/decks/:id/deckTraining',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyPublished(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckTrainingController.putDeckTraining(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckTrainingController.putStatisticsAverageTime(req, res, next);
}, (req: any, res: any, next: any) => {
    return cardTrainingController.getCardTrainingsOfDeckTraining(req, res, next);
}, (req: any, res: any, next: any) => {
    return cardTrainingController.putCardTrainings(req, res, next);
})

router.delete('/decks/:id/deckTraining',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyPublished(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckTrainingController.deleteDeckTraining(req, res, next);
}, (req: any, res: any, next: any) => {
    return cardController.getCardsOfDeck(req, res, next);
}, (req: any, res: any, next: any) => {
    return cardTrainingController.deleteCardTrainings(req, res, next);
})

router.get('/decks/:id/deckTraining',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyPublished(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckTrainingController.getDeckTraining(req, res, next);
}, (req: any, res: any) => {
    return deckTrainingController.validateDeckTraining(req, res);
})

export{ router };