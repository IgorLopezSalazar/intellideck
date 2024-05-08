import mongoose, { Schema, model } from 'mongoose';
import {DECK_DOCUMENT_NAME, deckSchema, IDeck} from "./deck.ts";

export const USER_DOCUMENT_NAME = 'user';
export const USER_COLLECTION_NAME = 'users';
export interface IUser {
    name : string;
    username : string;
    email : string;
    password : string;
    profilePicture? : string;
    role : string;
    followedUsers : IUser[];
    followedDecks : IDeck[];
}

export const userSchema = new Schema<IUser>({
    name: { type: Schema.Types.String, required: true },
    username: { type: Schema.Types.String, required: true, unique: true },
    email: { type: Schema.Types.String, required: true, unique: true },
    password: { type: Schema.Types.String, required: true },
    profilePicture: { type: Schema.Types.String},
    role: { type: Schema.Types.String, enum: ['USER', 'ADMIN'], default: 'USER', required: true },
    followedDecks: [{ type: Schema.Types.ObjectId, ref: 'deck' }],
    followedUsers: [{ type: Schema.Types.ObjectId, ref: 'user' }]
});

export const User = model<IUser>(USER_DOCUMENT_NAME, userSchema, USER_COLLECTION_NAME);