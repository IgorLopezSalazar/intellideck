import supertest from "supertest";
import {expect, describe, it, jest} from '@jest/globals';
import {app} from "../../src/app.ts";
import {Middleware} from "../../src/middleware.ts";
import {Card} from "../../src/models/card.ts";
import {Deck} from "../../src/models/deck.ts";

const middleware = new Middleware();

const userPayload = {
    id: "663bd4577abace2f8505108e",
    role: "USER"
}

const deckPayload = {
    _id: "66326642b6e5d026db70f695",
    title: "TestDeck",
    description: "This is a test deck",
    isPublished: false,
    creator: userPayload.id
};

const responsePayload = {
    _id: '6640e53d2da54166918514bd',
    question: "2 * 3?",
    answer: "6",
    deck: deckPayload._id
};

describe("Card", () => {
    describe("GET Cards of deck", () => {
        describe("Given cards exist in deck", () => {
            it("should return a 200 and the cards", async () => {
                jest.spyOn(Card, "find").mockResolvedValueOnce([responsePayload]);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/${deckPayload._id}/cards`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(200);
                            expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(responsePayload)]));
                        });
                });
            });
        });

        describe("Given no cards exist", () => {
            it("should return a 204", async () => {
                jest.spyOn(Card, "find").mockResolvedValueOnce([]);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/${deckPayload._id}/cards`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(204);
                        });
                });
            });
        });

        describe("Given Internal Error occurs", () => {
            it("should return a 500", async () => {
                jest.spyOn(Card, "find").mockRejectedValueOnce(new Error());
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/${deckPayload._id}/cards`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(500);
                        });
                });
            });
        });
    });

    describe("POST Card", () => {
        describe("Given logged user is owner of deck", () => {
            describe("Given data is valid", () => {
                it("should return a 201 and the created deck", async () => {
                    jest.spyOn(Card, "create")
                        .mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                            resolve(responsePayload);
                        }));
                    jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload)
                        .mockResolvedValueOnce(deckPayload);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).post(`/api/decks/${deckPayload._id}/cards`).send(
                            {question: responsePayload.question, answer: responsePayload.answer})
                            .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(201);
                                expect(response.body).toMatchObject(expect.objectContaining(responsePayload));
                            });
                    });
                });
            });

            describe("Given Internal Error occurs", () => {
                describe("While verifying creator", () => {
                    it("should return a 500", async () => {
                        jest.spyOn(Deck, "findOne").mockRejectedValueOnce(new Error());
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).post(`/api/decks/${deckPayload._id}/cards`).send(
                                {question: responsePayload.question, answer: responsePayload.answer})
                                .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                                .then(response => {
                                    expect(response.status).toEqual(500);
                                });
                        });
                    });
                });

                describe("While verifying unpublished", () => {
                    it("should return a 500", async () => {
                        jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload)
                            .mockRejectedValueOnce(new Error());
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).post(`/api/decks/${deckPayload._id}/cards`).send(
                                {question: responsePayload.question, answer: responsePayload.answer})
                                .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                                .then(response => {
                                    expect(response.status).toEqual(500);
                                });
                        });
                    });
                });

                describe("While creating card", () => {
                    it("should return a 500", async () => {
                        jest.spyOn(Card, "create").mockRejectedValueOnce(new Error());
                        jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload)
                            .mockResolvedValueOnce(deckPayload);
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).post(`/api/decks/${deckPayload._id}/cards`).send(
                                {question: responsePayload.question, answer: responsePayload.answer})
                                .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                                .then(response => {
                                    expect(response.status).toEqual(500);
                                });
                        });
                    });
                });
            });
        });

        describe("Given logged user is not creator", () => {
            it("should return a 400", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(null);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).post(`/api/decks/${deckPayload._id}/cards`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(400);
                        });
                });
            });
        });

        describe("Given deck published already", () => {
            it("should return a 400", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload)
                    .mockResolvedValueOnce(null);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).post(`/api/decks/${deckPayload._id}/cards`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(400);
                        });
                });
            });
        });
    });

    describe("PUT Card", () => {
        describe("Given logged user is owner", () => {
            describe("Given data is valid", () => {
                it("should return a 200 and the updated card", async () => {
                    jest.spyOn(Card, "findByIdAndUpdate").mockResolvedValueOnce(responsePayload);
                    jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload)
                        .mockResolvedValueOnce(deckPayload);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/decks/${deckPayload._id}/cards/${responsePayload._id}`).send(
                            {question: responsePayload.question, answer: responsePayload.answer})
                            .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(200);
                                expect(response.body).toMatchObject(expect.objectContaining(responsePayload));
                            });
                    });
                });
            });

            describe("Given data is not valid", () => {
                it("should return a 404", async () => {
                    jest.spyOn(Card, "findByIdAndUpdate").mockResolvedValueOnce(null);
                    jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload)
                        .mockResolvedValueOnce(deckPayload);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/decks/${deckPayload._id}/cards/${responsePayload._id}`)
                            .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(404);
                            });
                    });
                });
            });
        });

        describe("Given logged user is not creator", () => {
            it("should return a 400", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(null);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${deckPayload._id}/cards/${responsePayload._id}`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(400);
                        });
                });
            });
        });

        describe("Given deck published already", () => {
            it("should return a 400", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload)
                    .mockResolvedValueOnce(null);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${deckPayload._id}/cards/${responsePayload._id}`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(400);
                        });
                });
            });
        });

        describe("Given Internal Error while updating", () => {
            it("should return a 500", async () => {
                jest.spyOn(Card, "findByIdAndUpdate").mockRejectedValueOnce(new Error());
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload)
                    .mockResolvedValueOnce(deckPayload);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${deckPayload._id}/cards/${responsePayload._id}`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(500);
                        });
                });
            });
        });
    });

    describe("DELETE Cards", () => {
        describe("Given logged user is owner of deck", () => {
            it("should return a 204", async () => {
                jest.spyOn(Card, "findByIdAndDelete").mockResolvedValueOnce(null);
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload)
                    .mockResolvedValueOnce(deckPayload);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).delete(`/api/decks/${deckPayload._id}/cards/${responsePayload._id}`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(204);
                        });
                });
            });

            describe("Given Internal Error occurs", () => {
                it("should return a 500", async () => {
                    jest.spyOn(Card, "findByIdAndDelete").mockRejectedValueOnce(new Error());
                    jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload)
                        .mockResolvedValueOnce(deckPayload);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).delete(`/api/decks/${deckPayload._id}/cards/${responsePayload._id}`)
                            .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(500);
                            });
                    });
                });
            });

            describe("Given logged user is not creator", () => {
                it("should return a 400", async () => {
                    jest.spyOn(Deck, "findOne").mockResolvedValueOnce(null);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).delete(`/api/decks/${deckPayload._id}/cards/${responsePayload._id}`)
                            .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(400);
                            });
                    });
                });
            });

            describe("Given deck published already", () => {
                it("should return a 400", async () => {
                    jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload)
                        .mockResolvedValueOnce(null);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).delete(`/api/decks/${deckPayload._id}/cards/${responsePayload._id}`)
                            .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(400);
                            });
                    });
                });
            });
        });
    });
});