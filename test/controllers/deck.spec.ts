import supertest from "supertest";
import {expect, describe, it, jest} from '@jest/globals';
import {app} from "../../src/app.ts";
import {Deck} from "../../src/models/deck.ts";
import {Middleware} from "../../src/middleware.ts";
import {User} from "../../src/models/user.ts";

const middleware = new Middleware();

const userPayload = {
    id: "663bd4577abace2f8505108e",
    role: "USER"
}
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
    creator: creatorPayload._id
};

describe("Deck", () => {
    describe("POST Deck Method", () => {
        describe("Given deck data is valid", () => {
            it("should return a 201 and the created object", async () => {
                const createDeckMock = jest.spyOn(Deck, "create")
                    .mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                        resolve(responsePayload);
                    }));
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).post(`/api/decks/`).send({
                        title: "TestDeck",
                        description: "This is a test deck"
                    }).set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(201);
                            expect(response.body).toMatchObject(expect.objectContaining(responsePayload));
                        });
                });
            });
        });

        describe("Given deck data is invalid", () => {
            it("should return a 400", async () => {
                const createUserMock = jest.spyOn(Deck, "create")
                    .mockRejectedValueOnce(new Error());

                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).post(`/api/decks/`).send({
                        description: "This is a test deck"
                    }).set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(400);
                        });
                });
            });
        });
    });

    describe("PUT deck", () => {
        describe("Given deck is not published and is owned by logged deck", () => {
            it("should return a 200 and the updated object", async () => {
                const createDeckMock = jest.spyOn(Deck, "findOneAndUpdate")
                    .mockResolvedValueOnce(responsePayload);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${responsePayload._id}`).send({title: "TestDeck"})
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(200);
                            expect(response.body).toMatchObject(expect.objectContaining(responsePayload));
                        });
                });
            });
        });

        describe("Given deck is either published or not owned by logged deck", () => {
            it("should return a 400", async () => {
                const createDeckMock = jest.spyOn(Deck, "findOneAndUpdate")
                    .mockResolvedValueOnce(null);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${responsePayload._id}`).send({title: "TestDeck"})
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(400);
                        });
                });
            });
        });
    });

    describe("GET Decks of User", () => {
        describe("Given user has published decks", () => {
            it("should return a 200 and the decks", async () => {
                const createDeckMock = jest.spyOn(Deck, "find")
                    .mockResolvedValueOnce([responsePayload]);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/${creatorPayload._id}`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(200);
                            expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(responsePayload)]));
                        });
                });
            });
        });

        describe("Given user has no published decks", () => {
            it("should return a 204", async () => {
                const createDeckMock = jest.spyOn(Deck, "find")
                    .mockResolvedValueOnce([]);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/${creatorPayload._id}`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(204);
                        });
                });
            });
        });
    });

    describe("GET Decks followed by User", () => {
        describe("Given user follows decks", () => {
            it("should return a 200 and the decks", async () => {
                const userWithDecksPayload = {
                    ...creatorPayload,
                    followedDecks: [responsePayload]
                }
                const createDeckMock = jest.spyOn(User, "aggregate")
                    .mockResolvedValueOnce([userWithDecksPayload]);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/followed/${creatorPayload._id}`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(200);
                            expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(responsePayload)]));
                        });
                });
            });
        });

        describe("Given user follows doesn't follow any decks", () => {
            it("should return a 204", async () => {
                const userWithDecksPayload = {
                    ...creatorPayload,
                    followedDecks: []
                }
                const createDeckMock = jest.spyOn(User, "aggregate")
                    .mockResolvedValueOnce([userWithDecksPayload]);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/followed/${creatorPayload._id}`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(204);
                        });
                });
            });
        });
    });

    describe("PUT Follow deck", () => {
        describe("Given deck is not followed", () => {
            describe("Given deck to follow exists", () => {
                it("should return a 200 and the logged user following the deck to follow", async () => {
                    const followingPayload = {
                        ...creatorPayload,
                        followedDecks: [responsePayload._id]
                    }
                    const deckMock = jest.spyOn(Deck, "findOne")
                        .mockResolvedValueOnce(responsePayload);
                    const followMock = jest.spyOn(User, "findOneAndUpdate")
                        .mockResolvedValueOnce(followingPayload);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/decks/follow`).send({id: responsePayload._id})
                            .set({"Authorization": token, 'Content-type': 'application/json'})
                            .then(response => {
                                expect(response.status).toEqual(200);
                                expect(response.body).toMatchObject(expect.objectContaining(followingPayload));
                                expect(response.body.followedDecks.length).toBeGreaterThan(0);
                                expect(response.body.followedDecks).toContainEqual(responsePayload._id);
                            });
                    });
                });
            });

            describe("Given deck to follow does not exists", () => {
                it("should return a 404", async () => {
                    const deckMock = jest.spyOn(Deck, "findOne")
                        .mockResolvedValueOnce(null);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/decks/follow`).send({id: responsePayload._id})
                            .set({"Authorization": token, 'Content-type': 'application/json'})
                            .then(response => {
                                expect(response.status).toEqual(404);
                            });
                    });
                });
            });
        });

        describe("Given deck is followed", () => {
            describe("Given deck to follow exists", () => {
                it("should return a 400 bad request", async () => {
                    const deckMock = jest.spyOn(Deck, "findOne")
                        .mockResolvedValueOnce(responsePayload);
                    const followMock = jest.spyOn(User, "findOneAndUpdate")
                        .mockResolvedValueOnce(null);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/decks/follow`).send({id: responsePayload._id})
                            .set({"Authorization": token, 'Content-type': 'application/json'})
                            .then(response => {
                                expect(response.status).toEqual(400);
                            });
                    });
                });
            });
        });
    });

    describe("PUT Unfollow deck", () => {
        describe("Given deck is followed", () => {
            describe("Given deck to unfollow exists", () => {
                it("should return a 200 and the logged user without the deck to unfollow", async () => {
                    const unfollowingPayload = {
                        ...creatorPayload,
                        followedDecks: []
                    }
                    const deckMock = jest.spyOn(Deck, "findOne")
                        .mockResolvedValueOnce(responsePayload);
                    const followMock = jest.spyOn(User, "findOneAndUpdate")
                        .mockResolvedValueOnce(unfollowingPayload);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/decks/unfollow`).send({id: responsePayload._id})
                            .set({"Authorization": token, 'Content-type': 'application/json'})
                            .then(response => {
                                expect(response.status).toEqual(200);
                                expect(response.body).toMatchObject(expect.objectContaining(unfollowingPayload));
                                expect(response.body.followedDecks.length).toEqual(0);
                            });
                    });
                });
            });

            describe("Given deck to unfollow does not exists", () => {
                it("should return a 404", async () => {
                    const deckMock = jest.spyOn(Deck, "findOne")
                        .mockResolvedValueOnce(null);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/decks/unfollow`).send({id: responsePayload._id})
                            .set({"Authorization": token, 'Content-type': 'application/json'})
                            .then(response => {
                                expect(response.status).toEqual(404);
                            });
                    });
                });
            });
        });

        describe("Given deck is not followed", () => {
            describe("Given deck to unfollow exists", () => {
                it("should return a 400 bad request", async () => {
                    const deckMock = jest.spyOn(Deck, "findOne")
                        .mockResolvedValueOnce(responsePayload);
                    const followMock = jest.spyOn(User, "findOneAndUpdate")
                        .mockResolvedValueOnce(null);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/decks/unfollow`).send({id: responsePayload._id})
                            .set({"Authorization": token, 'Content-type': 'application/json'})
                            .then(response => {
                                expect(response.status).toEqual(400);
                            });
                    });
                });
            });
        });
    });
});