import supertest from "supertest";
import {expect, describe, it, jest} from '@jest/globals';
import {app} from "../../src/app.ts";
import {Deck} from "../../src/models/deck.ts";
import {Middleware} from "../../src/middleware.ts";
import {User} from "../../src/models/user.ts";
import {Topic} from "../../src/models/topic.ts";
import {Tag} from "../../src/models/tag.ts";
import {Card} from "../../src/models/card.ts";
import {DeckTraining} from "../../src/models/deck.training.ts";
import {CardTraining} from "../../src/models/card.training.ts";

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
const cardPayload = {
    _id: '6640e53d2da54166918514bd',
    question: "2 * 3?",
    answer: "6",
    deck: responsePayload._id
};

const deckTrainingPayload = {
    _id: "66326742b6e5d026db70f694",
    startDate: new Date("2024-05-20"),
    boxAmount: 7,
    backtrack: "BACKTRACK_PRIOR",
    user: userPayload.id,
    deck: responsePayload._id,
    statistics: {
        attempts: 1,
        avgCompletionTimeSeconds: 360
    }
};

const cardTrainingPayload = {
    nextTraining: new Date("2024-05-02"),
    isShown: true,
    _id: '6640e53d2da54166918514bd',
    box: 1,
    deckTraining: deckTrainingPayload._id,
    card: cardPayload._id
};

describe("Deck", () => {
    describe("GET Decks filtered", () => {
        describe("Given Internal Server Error", () => {
            describe("While getting decks", () => {
                it("should return a 500", async () => {
                    jest.spyOn(Deck, 'aggregate').mockRejectedValueOnce(new Error());
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/decks/filter?followed=true`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(500);
                            });
                    });
                });
            });
        });

        describe("Given followed = false", () => {
            describe("Given no result found", () => {
                it("should return a 204", async () => {
                    jest.spyOn(Deck, 'aggregate').mockResolvedValueOnce([]);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/decks/filter?title=hola`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(204);
                            });
                    });
                });
            });

            describe("Given results found", () => {
                it("should return a 200 and the decks", async () => {
                    jest.spyOn(Deck, 'aggregate').mockResolvedValueOnce([responsePayload]);
                    jest.spyOn(User, 'findById').mockImplementation(() => ({
                        populate: () => ({
                            exec: jest.fn().mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                                resolve({...userPayload, followedDecks: [responsePayload]});
                            }))
                        })
                    } as any));
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/decks/filter?avgDeckRating=0&topic=a&tag=a&date=2024-01-01&creator=a`)
                            .set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(200);
                                expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(responsePayload)]));
                            });
                    });
                });
            });
        });

        describe("Given followed = true", () => {
            describe("Given no result found", () => {
                it("should return a 204", async () => {
                    let responsePayloadModified = {...responsePayload};
                    responsePayloadModified._id = userPayload.id;
                    jest.spyOn(Deck, 'aggregate').mockResolvedValueOnce([responsePayloadModified]);
                    jest.spyOn(User, 'findById').mockImplementation(() => ({
                        populate: () => ({
                            exec: jest.fn().mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                                resolve({...userPayload, followedDecks: [responsePayload]});
                            }))
                        })
                    } as any));
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/decks/filter?followed=true`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(204);
                            });
                    });
                });
            });

            describe("Given results found", () => {
                it("should return a 200 and the decks", async () => {
                    jest.spyOn(Deck, 'aggregate').mockResolvedValueOnce([responsePayload]);
                    jest.spyOn(User, 'findById').mockImplementation(() => ({
                        populate: () => ({
                            exec: jest.fn().mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                                resolve({...userPayload, followedDecks: [responsePayload]});
                            }))
                        })
                    } as any));
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/decks/filter?followed=true`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(200);
                                expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(responsePayload)]));
                            });
                    });
                });
            });
        });
    });

    describe("POST Deck Method", () => {
        describe("Given deck data is valid", () => {
            it("should return a 201 and the created object", async () => {
                jest.spyOn(Deck, "create")
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
    });

    describe("PUT deck", () => {
        describe("Given deck is not published and is owned by logged user", () => {
            it("should return a 200 and the updated object", async () => {
                jest.spyOn(Deck, 'findByIdAndUpdate').mockImplementation(() => ({
                    populate: () => ({
                        populate: () =>
                            ({
                                exec: jest.fn().mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                                    resolve(responsePayload);
                                }))
                            })
                    })
                } as any));
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(responsePayload)
                    .mockResolvedValueOnce(responsePayload);
                jest.spyOn(Topic, "findById").mockResolvedValueOnce(null);
                jest.spyOn(Tag, "find").mockResolvedValueOnce([]);

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

        describe("Given logged user is not the creator of the deck", () => {
            it("should return a 400", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(null);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${responsePayload._id}`).send({title: "TestDeck"})
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(400);
                        });
                });
            });
        });

        describe("Given Internal Error occurs while validating creator", () => {
            it("should return a 500", async () => {
                jest.spyOn(Deck, "findOne").mockRejectedValueOnce(new Error());
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${responsePayload._id}`).send({title: "TestDeck"})
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(500);
                        });
                });
            });
        });

        describe("Given deck is published", () => {
            it("should return a 400", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(responsePayload).mockResolvedValueOnce(null);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${responsePayload._id}`).send({title: "TestDeck"})
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(400);
                        });
                });
            });
        });

        describe("Given Internal Error occurs while checking if published", () => {
            it("should return a 500", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(responsePayload).mockRejectedValueOnce(new Error());
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${responsePayload._id}`).send({title: "TestDeck"})
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(500);
                        });
                });
            });
        });

        describe("Given the topic was not found", () => {
            it("should return a 404", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(responsePayload)
                    .mockResolvedValueOnce(responsePayload);
                jest.spyOn(Topic, "findById").mockResolvedValueOnce(null);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${responsePayload._id}`).send({title: "TestDeck", topic: "none"})
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(404);
                        });
                });
            });
        });

        describe("Given Internal Error occurs while validating topic", () => {
            it("should return a 500", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(responsePayload)
                    .mockResolvedValueOnce(responsePayload);
                jest.spyOn(Topic, "findById").mockRejectedValueOnce(new Error());
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${responsePayload._id}`).send({title: "TestDeck", topic: "none"})
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(500);
                        });
                });
            });
        });

        describe("Given at least one tag was not found", () => {
            it("should return a 404", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(responsePayload)
                    .mockResolvedValueOnce(responsePayload);
                jest.spyOn(Topic, "findById").mockResolvedValueOnce(null);
                jest.spyOn(Tag, "find").mockResolvedValueOnce([]);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${responsePayload._id}`).send({title: "TestDeck", tags: ["none"]})
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(404);
                        });
                });
            });
        });

        describe("Given Internal Error occurs while validating tags", () => {
            it("should return a 500", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(responsePayload)
                    .mockResolvedValueOnce(responsePayload);
                jest.spyOn(Topic, "findById").mockResolvedValueOnce(null);
                jest.spyOn(Tag, "find").mockRejectedValueOnce(new Error());
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${responsePayload._id}`).send({title: "TestDeck"})
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(500);
                        });
                });
            });
        });
    });

    describe("GET Decks of User", () => {
        describe("Given user has published decks", () => {
            it("should return a 200 and the decks", async () => {
                jest.spyOn(Deck, "find").mockResolvedValueOnce([responsePayload]);
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
                jest.spyOn(Deck, "find").mockResolvedValueOnce([]);
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

    describe("GET Decks for studying today", () => {
        describe("Given user has no studies for today", () => {
            it("should return a 204", async () => {
                jest.spyOn(DeckTraining, "find").mockResolvedValueOnce([]);
                jest.spyOn(CardTraining, "find").mockResolvedValueOnce([]);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/today`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(204);
                        });
                });
            });
        });

        describe("Given user has studies for today", () => {
            it("should return a 200 and the decks to study", async () => {
                jest.spyOn(DeckTraining, "find").mockResolvedValueOnce([deckTrainingPayload]);
                jest.spyOn(CardTraining, "find").mockResolvedValueOnce([cardTrainingPayload]);
                jest.spyOn(Deck, "find").mockResolvedValueOnce([responsePayload]);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/today`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(200);
                            expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(responsePayload)]));
                        });
                });
            });
        });
    });

    describe("GET Decks followed by User", () => {
        describe("Given user follows decks", () => {
            it("should return a 200 and the decks", async () => {
                jest.spyOn(User, 'findById').mockImplementation(() => ({
                    populate: () => ({
                        exec: jest.fn().mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                            resolve([responsePayload]);
                        }))
                    })
                } as any));
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
                jest.spyOn(User, 'findById').mockImplementation(() => ({
                    populate: () => ({
                        exec: jest.fn().mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                            resolve([]);
                        }))
                    })
                } as any));
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

    describe("PUT Publish deck", () => {
        describe("Given Internal error occurs", () => {
            it("should return a 500", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(responsePayload).mockResolvedValueOnce(responsePayload);
                jest.spyOn(Card, "find").mockResolvedValueOnce([cardPayload]);
                jest.spyOn(Deck, "findByIdAndUpdate").mockRejectedValueOnce(new Error());
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${responsePayload._id}/publish`)
                        .set({"Authorization": token, 'Content-type': 'application/json'})
                        .then(response => {
                            expect(response.status).toEqual(500);
                        });
                });
            });
        });

        describe("Given no cards in deck", () => {
            it("should return a 400", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(responsePayload).mockResolvedValueOnce(responsePayload);
                jest.spyOn(Card, "find").mockResolvedValueOnce([]);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${responsePayload._id}/publish`)
                        .set({"Authorization": token, 'Content-type': 'application/json'})
                        .then(response => {
                            expect(response.status).toEqual(400);
                        });
                });
            });
        });

        describe("Given there are cards in deck", () => {
            it("should return a 200 and the deck", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(responsePayload).mockResolvedValueOnce(responsePayload);
                jest.spyOn(Card, "find").mockResolvedValueOnce([cardPayload]);
                jest.spyOn(Deck, "findByIdAndUpdate").mockResolvedValueOnce(responsePayload);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${responsePayload._id}/publish`)
                        .set({"Authorization": token, 'Content-type': 'application/json'})
                        .then(response => {
                            expect(response.status).toEqual(200);
                        });
                });
            });
        });
    });

    describe("PUT Follow deck", () => {
        describe("Given Internal error occurs", () => {
            it("should return a 500", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(responsePayload);
                jest.spyOn(User, "findOneAndUpdate").mockRejectedValueOnce(new Error());
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${responsePayload._id}/follow`)
                        .set({"Authorization": token, 'Content-type': 'application/json'})
                        .then(response => {
                            expect(response.status).toEqual(500);
                        });
                });
            });
        });

        describe("Given deck is not followed", () => {
            describe("Given deck to follow exists", () => {
                it("should return a 200 and the logged user following the deck to follow", async () => {
                    const followingPayload = {
                        ...creatorPayload,
                        followedDecks: [responsePayload._id]
                    }
                    jest.spyOn(Deck, "findOne").mockResolvedValueOnce(responsePayload);
                    jest.spyOn(User, "findOneAndUpdate").mockResolvedValueOnce(followingPayload);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/decks/${responsePayload._id}/follow`)
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
                    jest.spyOn(Deck, "findOne").mockResolvedValueOnce(null);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/decks/${responsePayload._id}/follow`)
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
                    jest.spyOn(Deck, "findOne").mockResolvedValueOnce(responsePayload);
                    jest.spyOn(User, "findOneAndUpdate").mockResolvedValueOnce(null);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/decks/${responsePayload._id}/follow`)
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
        describe("Given Internal error occurs", () => {
            it("should return a 500", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(responsePayload);
                jest.spyOn(User, "findOneAndUpdate").mockRejectedValueOnce(new Error());
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${responsePayload._id}/unfollow`)
                        .set({"Authorization": token, 'Content-type': 'application/json'})
                        .then(response => {
                            expect(response.status).toEqual(500);
                        });
                });
            });
        });

        describe("Given deck is followed", () => {
            describe("Given deck to unfollow exists", () => {
                it("should return a 200 and the logged user without the deck to unfollow", async () => {
                    const unfollowingPayload = {
                        ...creatorPayload,
                        followedDecks: []
                    }
                    jest.spyOn(Deck, "findOne").mockResolvedValueOnce(responsePayload);
                    jest.spyOn(User, "findOneAndUpdate").mockResolvedValueOnce(unfollowingPayload);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/decks/${responsePayload._id}/unfollow`)
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
                    jest.spyOn(Deck, "findOne").mockResolvedValueOnce(null);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/decks/${responsePayload._id}/unfollow`)
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
                    jest.spyOn(Deck, "findOne").mockResolvedValueOnce(responsePayload);
                    jest.spyOn(User, "findOneAndUpdate").mockResolvedValueOnce(null);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/decks/${responsePayload._id}/unfollow`)
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