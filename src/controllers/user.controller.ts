import pkg from 'bcryptjs';
const { hashSync, compare } = pkg;
import jwt from 'jsonwebtoken';
import fs from 'fs';
import forge, {Base64} from 'node-forge';

import {User} from "../models/user.ts";
import StatusCodes from "http-status-codes";
import * as repl from "repl";


const SALT_ROUNDS : number = 10;

export class UserController {
    async getAllUsers(req: any, res: any) {
        User.find({})
            .then((data: any) =>
                res.status(StatusCodes.OK).json(data))
            .catch((e: any) =>
                res.status(StatusCodes.NOT_FOUND).json("No result found"));
    }

    async postUser(req: any, res: any) {
        let user = new User({
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            password: hashSync(req.body.password, SALT_ROUNDS),
            profilePicture: req.body.profilePicture,
            role: req.body.role
        })
        User.create(user)
            .then((data: any) =>
                res.status(StatusCodes.CREATED).json(data))
            .catch((e: any) =>
                res.status(StatusCodes.CONFLICT).json("A user with the same email or username already exists"));
    }

    async getUser(req: any, res: any) {
        User.findById(req.params.id)
            .then((data: any) =>
                res.status(StatusCodes.OK).json(data))
            .catch((e: any) =>
                res.status(StatusCodes.NOT_FOUND).json("No result found"));
    }

    async login(req: any, res: any) {
        console.log("-------------------------------")
        console.log(req.body)
        console.log("-------------------------------")
        let decryptedData = this.decryptPayload(req.body.encHex);
        User.findOne({username: decryptedData.username})
            .then((user: any) => {
                if(!user) {
                    res.status(StatusCodes.UNAUTHORIZED).json("Authentication failed");
                }
                compare(decryptedData.password, user.password)
                    .then((match: boolean) => {
                        if(!match) {
                            res.status(StatusCodes.UNAUTHORIZED).json("Authentication failed");
                        }
                        const token = jwt.sign({ userId: user._id }, this.readPrivateKey(), {
                            expiresIn: '1h',
                            algorithm: 'RS256'
                        });
                        res.status(200).json(this.encryptPayload("Bearer " + token));
                    })
            })
            .catch((e: any) => {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error while processing the login. Please try again later");
                console.log(e);
            });

    }

    readPrivateKey() {
        return fs.readFileSync('./private.key', "utf-8");
    }

     encryptText(text:string, key:any, iv:any) {
        const cipher = forge.cipher.createCipher('AES-CBC', key);
        cipher.start({ iv: iv });
        cipher.update(forge.util.createBuffer(text));
        cipher.finish();
        const encrypted = cipher.output;
        return encrypted.toHex();
    }

    encryptPayload(payload: any) {
        // Generate a random symmetric key for AES encryption
        const symmetricKey = forge.random.getBytesSync(16);
        const iv = forge.random.getBytesSync(16);

        // Encrypt the payload using the generated symmetric key
        const encryptedPayload = this.encryptText(JSON.stringify(payload), symmetricKey, iv)

        return forge.util.encode64(iv + encryptedPayload)
    };

    decryptAESKey(AESKey: any, publicKey: any) {
        const publicKeyPem = forge.pki.privateKeyFromPem(publicKey);
        console.log(AESKey)
        return publicKeyPem.decrypt(AESKey, 'RSA-OAEP')
    }

    decryptText(text: any, key: any, iv: any) {
        const cipher = forge.cipher.createDecipher('AES-CBC', key);
        cipher.start({ iv: iv });
        cipher.update(forge.util.createBuffer(text));
        cipher.finish();
        const decrypted = cipher.output;
        return decrypted.toHex();
    }

    decryptPayload(responseData: any) {
        // server's public RSA key (replace this with the actual key)
        const serverPublicKey = this.readPrivateKey();

        // Encrypt the symmetric key with the server's public RSA key
        const decryptedSymmetricKey = this.decryptAESKey(responseData, serverPublicKey)
        const payl = Buffer.from(decryptedSymmetricKey).slice(16);
        const iv = Buffer.from(decryptedSymmetricKey).slice(0,16);

        // Encrypt the payload using the generated symmetric key
        const decryptedPayload = this.decryptText(JSON.stringify(payl), decryptedSymmetricKey, iv)

        return JSON.parse(decryptedPayload.toString())
    };
}