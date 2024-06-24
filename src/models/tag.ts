import { Schema, model } from 'mongoose';

export const TAG_DOCUMENT_NAME = 'tag';
export const TAG_COLLECTION_NAME = 'tags';
export interface ITag {
    name : string;
}

export const tagSchema = new Schema<ITag>({
    name: { type: Schema.Types.String, required: true, unique: true }
});

export const Tag = model<ITag>(TAG_DOCUMENT_NAME, tagSchema, TAG_COLLECTION_NAME);