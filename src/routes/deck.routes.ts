import express from 'express';
import {Middleware} from "../middleware.ts";
import {DeckController} from "../controllers/deck.controller.ts";
import {UserController} from "../controllers/user.controller.ts";
import {TagController} from "../controllers/tag.controller.ts";

const router = express.Router();
const deckController = new DeckController();
const userController = new UserController();
const tagController = new TagController();
const middleware: Middleware = new Middleware();

router.post('/decks',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any) => {
    return deckController.postDeck(req, res);
})

router.get('/decks/:id',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any) => {
    return deckController.getUserDecks(req, res);
})

router.put('/decks/follow',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
},(req: any, res: any, next: any) => {
    return deckController.findById(req, res, next);
}, (req: any, res: any, next: any) => {
    return userController.putFollowDeck(req, res, next);
}, (req: any, res: any) => {
    return userController.validateFollowUnfollow(req, res);
})

router.put('/decks/unfollow',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
},(req: any, res: any, next: any) => {
    return deckController.findById(req, res, next);
}, (req: any, res: any, next: any) => {
    return userController.putUnfollowDeck(req, res, next);
}, (req: any, res: any) => {
    return userController.validateFollowUnfollow(req, res);
})

router.get('/decks/followed/:id',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any) => {
    return userController.getDecksFollowed(req, res);
})

router.put('/decks/:id',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyCreator(req, res, next);
}, (req: any, res: any) => {
    return deckController.updateDeck(req, res);
})

router.put('/decks/:id/tag/add',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyCreator(req, res, next);
}, (req: any, res: any, next: any) => {
    return tagController.getTag(req, res, next);
}, (req: any, res: any, next: any) => {
    return tagController.ensureTagExistence(req, res, next);
}, (req: any, res: any) => {
    return deckController.addTag(req, res);
})

router.put('/decks/:id/tag/remove',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyCreator(req, res, next);
}, (req: any, res: any, next: any) => {
    return tagController.getTag(req, res, next);
}, (req: any, res: any, next: any) => {
    return tagController.ensureTagExistence(req, res, next);
}, (req: any, res: any) => {
    return deckController.removeTag(req, res);
})

export{ router };