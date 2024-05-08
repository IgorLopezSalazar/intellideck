import express from 'express';
import {Middleware} from "../middleware.ts";
import {DeckController} from "../controllers/deck.controller.ts";
import {UserController} from "../controllers/user.controller.ts";

const router = express.Router();
const deckController = new DeckController();
const userController = new UserController();
const middleware: Middleware = new Middleware();

router.post('/decks',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
},(req: any, res: any, next: any) => {
    return userController.getLoggedUser(req, res, next);
}, (req: any, res: any) => {
    return deckController.postDeck(req, res);
})

router.get('/decks/:username',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any) => {
    return deckController.getUserDecks(req, res);
})

router.put('/decks/follow',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
},(req: any, res: any, next: any) => {
    return deckController.findById(req, res, next);
}, (req: any, res: any) => {
    return userController.putFollowDeck(req, res);
})

export{ router };