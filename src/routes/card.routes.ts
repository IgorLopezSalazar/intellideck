import express from 'express';
import {Middleware} from "../middleware.ts";
import {DeckController} from "../controllers/deck.controller.ts";
import {CardController} from "../controllers/card.controller.ts";

const router = express.Router();
const deckController = new DeckController();
const cardController = new CardController();
const middleware: Middleware = new Middleware();

router.post('/decks/:id/cards',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyCreator(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyUnpublished(req, res, next);
}, (req: any, res: any, next: any) => {
    return cardController.postCard(req, res, next);
})

router.get('/decks/:id/cards',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return cardController.getCardsOfDeck(req, res, next);
}, (req: any, res: any) => {
    return cardController.validateCardsOfDeck(req, res);
})

router.put('/decks/:id/cards/:cardId',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyCreator(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyUnpublished(req, res, next);
}, (req: any, res: any, next: any) => {
    return cardController.putCard(req, res, next);
})

router.delete('/decks/:id/cards/:cardId',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyCreator(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyUnpublished(req, res, next);
}, (req: any, res: any, next: any) => {
    return cardController.deleteCard(req, res, next);
})

export{ router };