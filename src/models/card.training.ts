import {Schema, model} from 'mongoose';
import {IDeckTraining} from "./deck.training.ts";
import {ICard} from "./card.ts";

export const CARD_TRAINING_DOCUMENT_NAME = 'cardTraining';
export const CARD_TRAINING_COLLECTION_NAME = 'cardTrainings';

export interface ICardTraining {
    nextTraining: Date;
    isShown: boolean;
    box: number;
    deckTraining: IDeckTraining;
    card: ICard;
}

export const cardTrainingSchema = new Schema<ICardTraining>({
    nextTraining: {type: Schema.Types.Date},
    isShown: {type: Schema.Types.Boolean, required: true},
    box: { type: Schema.Types.Number, required: true, min: 1, max: 13, validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not an integer value'
        } },
    deckTraining: {type: Schema.Types.ObjectId, ref: 'deckTraining'},
    card: {type: Schema.Types.ObjectId, ref: 'card'}
});

cardTrainingSchema.index({ deckTraining: 1, card: 1}, { unique: true });

export const CardTraining = model<ICardTraining>(CARD_TRAINING_DOCUMENT_NAME, cardTrainingSchema, CARD_TRAINING_COLLECTION_NAME);