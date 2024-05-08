import { Schema, model } from 'mongoose';
import {IUser, USER_DOCUMENT_NAME, userSchema} from "./user.ts";

export const DECK_DOCUMENT_NAME = 'deck';
export const DECK_COLLECTION_NAME = 'decks';
export interface IDeck {
    title : string;
    description : string;
    image : string;
    isPublished : boolean;
    creator? : IUser;
}

export const deckSchema = new Schema<IDeck>({
    title: { type: Schema.Types.String, required: true },
    description: { type: Schema.Types.String },
    image: { type: Schema.Types.String },
    isPublished: { type: Schema.Types.Boolean, required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'user' }
});

export const Deck = model<IDeck>(DECK_DOCUMENT_NAME, deckSchema, DECK_COLLECTION_NAME);