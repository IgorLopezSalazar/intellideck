import {Schema, model} from 'mongoose';
import {IDeck} from "./deck.ts";
import {IUser} from "./user.ts";

export const DECK_TRAINING_DOCUMENT_NAME = 'deckTraining';
export const DECK_TRAINING_COLLECTION_NAME = 'deckTrainings';

export interface IDeckTraining {
    startDate: Date;
    boxAmount: number;
    backtrack: string;
    user: IUser;
    deck: IDeck;
}

export const deckTrainingSchema = new Schema<IDeckTraining>({
    startDate: {type: Schema.Types.Date, required: true},
    boxAmount: {
        type: Schema.Types.Number, required: true, min: 1, max: 13, validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        }
    },
    backtrack: {type: Schema.Types.String, enum: ['BACKTRACK_PRIOR', 'BACKTRACK_FIRST'], default: 'BACKTRACK_FIRST', required: true},
    user: {type: Schema.Types.ObjectId, ref: 'user'},
    deck: {type: Schema.Types.ObjectId, ref: 'deck'}
});

deckTrainingSchema.index({ deck: 1, user: 1}, { unique: true });

export const DeckTraining = model<IDeckTraining>(DECK_TRAINING_DOCUMENT_NAME, deckTrainingSchema, DECK_TRAINING_COLLECTION_NAME);