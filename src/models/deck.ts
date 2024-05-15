import { Schema, model } from 'mongoose';
import {IUser} from "./user.ts";
import {ITopic} from "./topic.ts";
import {ITag} from "./tag.js";

export const DECK_DOCUMENT_NAME = 'deck';
export const DECK_COLLECTION_NAME = 'decks';
export interface IDeck {
    title : string;
    description : string;
    image : string;
    isPublished : boolean;
    creator? : IUser;
    topic : ITopic;
    tags: ITag[];
}

export const deckSchema = new Schema<IDeck>({
    title: { type: Schema.Types.String, required: true },
    description: { type: Schema.Types.String },
    image: { type: Schema.Types.String },
    isPublished: { type: Schema.Types.Boolean, required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'user' },
    topic: { type: Schema.Types.ObjectId, ref: 'topic' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'tag' }]
});

export const Deck = model<IDeck>(DECK_DOCUMENT_NAME, deckSchema, DECK_COLLECTION_NAME);