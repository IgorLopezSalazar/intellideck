import { Schema, model } from 'mongoose';

export const DOCUMENT_NAME = 'user';
export const COLLECTION_NAME = 'users';
export interface IUser {
    name : string;
    username : string;
    email : string;
    password : string;
    profilePicture? : string;
    role : string;
    followedUsers : IUser[];
}

export const userSchema = new Schema<IUser>({
    name: { type: Schema.Types.String, required: true },
    username: { type: Schema.Types.String, required: true, unique: true },
    email: { type: Schema.Types.String, required: true, unique: true },
    password: { type: Schema.Types.String, required: true },
    profilePicture: { type: Schema.Types.String},
    role: { type: Schema.Types.String, enum: ['USER', 'ADMIN'], default: 'USER', required: true },
});

userSchema.add({ followedUsers: [userSchema] });

export const User = model<IUser>(DOCUMENT_NAME, userSchema, COLLECTION_NAME);