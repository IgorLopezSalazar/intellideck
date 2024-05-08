import supertest from "supertest";
import {expect, describe, it, jest} from '@jest/globals';
import {app} from "../../src/app.ts";
import {Deck} from "../../src/models/deck.ts";
import {Middleware} from "../../src/middleware.ts";
import {User} from "../../src/models/user.ts";

jest.useFakeTimers();
const middleware = new Middleware();

const userPayload = {
    username: "Test",
    role: "USER"
}

describe("Deck", () => {
    describe("POST Deck Method", () => {
        describe("Given deck data is valid", () => {
            it("should return a 201 and the created object", async () => {
                const creatorPayload = {
                    _id: "663a6edf49c12cdab59ddfc2",
                    name: "Test",
                    username: "TestTesty",
                    email: "test@test.com",
                    password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                    role: "USER"
                }
                const responsePayload = {
                    _id: "66326642b6e5d026db70f695",
                    title: "TestDeck",
                    description: "This is a test deck",
                    isPublished: false,
                    creator: creatorPayload
                };
                const userMock = jest.spyOn(User, "findOne")
                    .mockResolvedValueOnce(creatorPayload);
                const createDeckMock = jest.spyOn(Deck, "create")
                    .mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                        resolve(responsePayload);
                    }));
                await middleware.generateToken(userPayload.username, userPayload.role).then(async (token: any) => {
                    await supertest(app).post(`/api/decks/`).send({
                        title: "TestDeck",
                        description: "This is a test deck",
                        isPublished: false
                    }).set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(201);
                            expect(response.body).toMatchObject(expect.objectContaining(responsePayload));
                        });
                });
            });
        });

        describe("Given user data is invalid", () => {
            it("should return a 400", async () => {
                const creatorPayload = {
                    _id: "663a6edf49c12cdab59ddfc2",
                    name: "Test",
                    username: "TestTesty",
                    email: "test@test.com",
                    password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                    role: "USER"
                }
                const userMock = jest.spyOn(User, "findOne")
                    .mockResolvedValueOnce(creatorPayload);
                const createUserMock = jest.spyOn(Deck, "create")
                    .mockRejectedValueOnce(new Error());


                await middleware.generateToken(userPayload.username, userPayload.role).then(async (token: any) => {
                    await supertest(app).post(`/api/decks/`).send({
                        description: "This is a test deck",
                        isPublished: false
                    }).set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(400);
                        });
                });
            });
        });
    });
});