import { Schema, model } from 'mongoose';
import {IUser, userSchema} from "./user.ts";

export const DOCUMENT_NAME = 'deck';
export const COLLECTION_NAME = 'decks';
export interface IDeck {
    title : string;
    description : string;
    image : string;
    isPublished : boolean;
    creator? : IUser;
}

const schema = new Schema<IDeck>({
    title: { type: Schema.Types.String, required: true, unique: true },
    description: { type: Schema.Types.String },
    image: { type: Schema.Types.String },
    isPublished: { type: Schema.Types.Boolean, required: true },
    creator: { type: userSchema }
});

export const Deck = model<IDeck>(DOCUMENT_NAME, schema, COLLECTION_NAME);