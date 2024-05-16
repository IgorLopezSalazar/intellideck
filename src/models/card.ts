import { Schema, model } from 'mongoose';
import {IDeck} from "./deck.ts";

export const CARD_DOCUMENT_NAME = 'card';
export const CARD_COLLECTION_NAME = 'cards';
export interface ICard {
    question : string;
    answer : string;
    image : string;
    deck: IDeck;
}

export const cardSchema = new Schema<ICard>({
    question: { type: Schema.Types.String },
    answer: { type: Schema.Types.String },
    image: { type: Schema.Types.String },
    deck: { type: Schema.Types.ObjectId, ref: 'deck' }
});

export const Card = model<ICard>(CARD_DOCUMENT_NAME, cardSchema, CARD_COLLECTION_NAME);