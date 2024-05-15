import { Schema, model } from 'mongoose';

export const TOPIC_DOCUMENT_NAME = 'topic';
export const TOPIC_COLLECTION_NAME = 'topics';
export interface ITopic {
    name : string;
}

export const topicSchema = new Schema<ITopic>({
    name: { type: Schema.Types.String, required: true, unique: true }
});

export const Topic = model<ITopic>(TOPIC_DOCUMENT_NAME, topicSchema, TOPIC_COLLECTION_NAME);