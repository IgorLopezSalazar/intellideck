import { Schema, model } from 'mongoose';
import {IDeck} from "./deck.ts";
import {IUser} from "./user.ts";
export const RATING_DOCUMENT_NAME = 'rating';
export const RATING_COLLECTION_NAME = 'ratings';
export interface IRating {
    rate : number;
    user : IUser;
    deck : IDeck;
}

export const ratingSchema = new Schema<IRating>({
    rate: { type: Schema.Types.Number, required: true, min: 1, max: 10, validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not an integer value'
        } },
    deck: { type: Schema.Types.ObjectId, ref: 'deck' },
    user: { type: Schema.Types.ObjectId, ref: 'user' }
});

ratingSchema.index({ deck: 1, user: 1}, { unique: true });

export const Rating = model<IRating>(RATING_DOCUMENT_NAME, ratingSchema, RATING_COLLECTION_NAME);