import supertest from "supertest";
import {expect, describe, it, jest} from '@jest/globals';
import {app} from "../../src/app.ts";
import {Middleware} from "../../src/middleware.ts";
import {Card} from "../../src/models/card.ts";
import {Deck} from "../../src/models/deck.ts";
import {DeckTraining} from "../../src/models/deck.training.ts";
import {CardTraining} from "../../src/models/card.training.ts";

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

const cardPayload = {
    _id: '6640e53d2da54166918514bd',
    question: "2 * 3?",
    answer: "6",
    deck: deckPayload._id
};

const dateDeckTrainingPayload = {
    startDate: new Date("2024-05-20")
}

const tempResponsePayload = {
    _id: "66326742b6e5d026db70f694",
    boxAmount: 7,
    backtrack: "BACKTRACK_PRIOR",
    user: "663bd4577abace2f8505108e",
    deck: "66326642b6e5d026db70f695",
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
    deckTraining: tempResponsePayload._id,
    card: {_id: '6640e53d2da54166918514bd'}
};

describe("Deck training", () => {
    describe("GET Deck training", () => {
        describe("Given logged user has an ongoing deck training", () => {
            it("should return a 200 and the deck training", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                jest.spyOn(DeckTraining, "findOne").mockResolvedValueOnce({...dateDeckTrainingPayload, ...tempResponsePayload});
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/${deckPayload._id}/deckTraining`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(200);
                            expect(response.body).toMatchObject(expect.objectContaining(
                                {startDate: dateDeckTrainingPayload.startDate.toISOString(), ...tempResponsePayload}));
                        });
                });
            });
        });

        describe("Given user has not started to study the deck", () => {
            it("should return a 404", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                jest.spyOn(DeckTraining, "findOne").mockResolvedValueOnce(null);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/${deckPayload._id}/deckTraining`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(404);
                        });
                });
            });
        });

        describe("Given catch during search of deck training occurs", () => {
            it("should return a 500", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                jest.spyOn(DeckTraining, "findOne").mockRejectedValueOnce(new Error());
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/${deckPayload._id}/deckTraining`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(500);
                        });
                });
            });
        });
    });

    describe("POST Deck Training (and Card Tranings)", () => {
        describe("Given logged user has no previous Deck Training", () => {
            it("should return a 201 and the created deck training", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                jest.spyOn(DeckTraining, "create")
                    .mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                        resolve({...dateDeckTrainingPayload, ...tempResponsePayload});
                    }));
                jest.spyOn(Card, "find").mockResolvedValueOnce([cardPayload]);
                jest.spyOn(CardTraining, "create")
                    .mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                        resolve(cardTrainingPayload);
                    }));
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).post(`/api/decks/${deckPayload._id}/deckTraining`).send(
                        {boxAmount: tempResponsePayload.boxAmount, backtrack: tempResponsePayload.backtrack})
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(201);
                            expect(response.body).toMatchObject(expect.objectContaining({...tempResponsePayload,
                                startDate: dateDeckTrainingPayload.startDate.toISOString()}));
                        });
                });
            });

            it("should return a 201 and the created deck training (card training show data sent in body)", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                jest.spyOn(DeckTraining, "create")
                    .mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                        resolve({...dateDeckTrainingPayload, ...tempResponsePayload});
                    }));
                jest.spyOn(Card, "find").mockResolvedValueOnce([cardPayload]);
                jest.spyOn(CardTraining, "create")
                    .mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                        resolve(cardTrainingPayload);
                    }));
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).post(`/api/decks/${deckPayload._id}/deckTraining`).send(
                        {boxAmount: tempResponsePayload.boxAmount, backtrack: tempResponsePayload.backtrack,
                        cards: [{id: cardTrainingPayload._id, isShown: cardTrainingPayload.isShown}]})
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(201);
                            expect(response.body).toMatchObject(expect.objectContaining({...tempResponsePayload,
                                startDate: dateDeckTrainingPayload.startDate.toISOString()}));
                        });
                });
            });
        });

        describe("Given user has previous deck training", () => {
            it("should return a 409", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                jest.spyOn(DeckTraining, "create").mockRejectedValueOnce({code: 11000});
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).post(`/api/decks/${deckPayload._id}/deckTraining`).send(
                        {boxAmount: tempResponsePayload.boxAmount, backtrack: tempResponsePayload.backtrack})
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(409);
                        });
                });
            });
        });

        describe("Given error while creating card training", () => {
            it("should return a 500", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                jest.spyOn(DeckTraining, "create")
                    .mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                        resolve({...dateDeckTrainingPayload, ...tempResponsePayload});
                    }));
                jest.spyOn(Card, "find").mockResolvedValueOnce([cardPayload]);
                jest.spyOn(CardTraining, "create").mockRejectedValueOnce(new Error());
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).post(`/api/decks/${deckPayload._id}/deckTraining`).send(
                        {boxAmount: tempResponsePayload.boxAmount, backtrack: tempResponsePayload.backtrack,
                            cards: [{id: cardTrainingPayload._id, isShown: cardTrainingPayload.isShown}]})
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(500);
                        });
                });
            });
        });
    });
    //
    describe("PUT Deck Training", () => {
        describe("Given logged user has ongoing deck training", () => {
            describe("Given data is valid", () => {
                describe("Given data implies a study was done", () => {
                    it("should return a 200 and the updated deck training", async () => {
                        jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                        jest.spyOn(DeckTraining, "findOneAndUpdate")
                            .mockResolvedValueOnce({...dateDeckTrainingPayload, ...tempResponsePayload})
                            .mockResolvedValueOnce({...dateDeckTrainingPayload, ...tempResponsePayload});
                        jest.spyOn(CardTraining, "find").mockImplementation(() => ({
                            populate: () => ({
                                populate: () =>
                                    ({
                                        exec: jest.fn().mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                                            resolve([cardTrainingPayload]);
                                        }))
                                    })
                            })
                        } as any));
                        jest.spyOn(CardTraining, "findOneAndUpdate")
                            .mockResolvedValueOnce(cardTrainingPayload);
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/decks/${deckPayload._id}/deckTraining`).send(
                                {completionTimeSeconds: 300, cards: [{id: cardPayload._id, box: 5}]})
                                .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                                .then(response => {
                                    expect(response.status).toEqual(200);
                                    expect(response.body).toMatchObject(expect.objectContaining({...tempResponsePayload,
                                        startDate: dateDeckTrainingPayload.startDate.toISOString()}));
                                });
                        });
                    });
                });

                describe("Given data implies a reset of the deck training is to be done", () => {
                    it("should return a 200 and the updated deck training", async () => {
                        jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                        jest.spyOn(DeckTraining, "findOneAndUpdate")
                            .mockResolvedValueOnce({...dateDeckTrainingPayload, ...tempResponsePayload});
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/decks/${deckPayload._id}/deckTraining`).send(
                                {resetDate: true})
                                .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                                .then(response => {
                                    expect(response.status).toEqual(200);
                                    expect(response.body).toMatchObject(expect.objectContaining({...tempResponsePayload,
                                        startDate: dateDeckTrainingPayload.startDate.toISOString()}));
                                });
                        });
                    });
                });
            });

            describe("Given data is invalid", () => {
                describe("Given time taken for attempt not sent", ()=> {
                    it("should return a 400", async () => {
                        jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                        jest.spyOn(DeckTraining, "findOneAndUpdate")
                            .mockResolvedValueOnce({...dateDeckTrainingPayload, ...tempResponsePayload});
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/decks/${deckPayload._id}/deckTraining`).send(
                                {resetDate: true, cards: [{id: cardPayload._id, box: 5}]})
                                .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                                .then(response => {
                                    expect(response.status).toEqual(400);
                                });
                        });
                    });
                });

                describe("Given time taken for attempt invalid", ()=> {
                    it("should return a 400", async () => {
                        jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                        jest.spyOn(DeckTraining, "findOneAndUpdate")
                            .mockResolvedValueOnce({...dateDeckTrainingPayload, ...tempResponsePayload});
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/decks/${deckPayload._id}/deckTraining`).send(
                                {completionTimeSeconds: -6000, resetDate: true, cards: [{id: cardPayload._id, box: 5}]})
                                .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                                .then(response => {
                                    expect(response.status).toEqual(400);
                                });
                        });
                    });
                });

                describe("Given deck id badly formatted", ()=> {
                    it("should return a 400", async () => {
                        jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                        jest.spyOn(DeckTraining, "findOneAndUpdate").mockRejectedValueOnce({errors: {box: {kind: "user defined"}}});
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/decks/${deckPayload._id}/deckTraining`).send(
                                {resetDate: true, cards: [{id: cardPayload._id, box: 5.5}]})
                                .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                                .then(response => {
                                    expect(response.status).toEqual(400);
                                });
                        });
                    });
                });

                describe("Given card box higher than deck training box", ()=> {
                    it("should return a 400", async () => {
                        jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                        jest.spyOn(DeckTraining, "findOneAndUpdate")
                            .mockResolvedValueOnce({...dateDeckTrainingPayload, ...tempResponsePayload})
                            .mockResolvedValueOnce({...dateDeckTrainingPayload, ...tempResponsePayload});
                        jest.spyOn(CardTraining, "find").mockImplementation(() => ({
                            populate: () => ({
                                populate: () =>
                                    ({
                                        exec: jest.fn().mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                                            resolve([cardTrainingPayload]);
                                        }))
                                    })
                            })
                        } as any));
                        jest.spyOn(CardTraining, "findOneAndUpdate").mockRejectedValueOnce({errors: {box: {kind: "min"}}});
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/decks/${deckPayload._id}/deckTraining`).send(
                                {completionTimeSeconds: 300, cards: [{id: cardPayload._id, box: 12}]})
                                .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                                .then(response => {
                                    console.log(response.body)
                                    expect(response.status).toEqual(400);
                                });
                        });
                    });
                });
            });
        });

        describe("Given logged user has not an ongoing deck training", () => {
            it("should return a 404", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                jest.spyOn(DeckTraining, "findOneAndUpdate").mockResolvedValueOnce(null);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${deckPayload._id}/deckTraining`).send(
                        {resetDate: true, cards: [{id: cardPayload._id, box: 5}]})
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(404);
                        });
                });
            });
        });

        describe("Given error when querying database", () => {
            it("should return a 500", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                jest.spyOn(DeckTraining, "findOneAndUpdate")
                    .mockResolvedValueOnce({...dateDeckTrainingPayload, ...tempResponsePayload})
                    .mockRejectedValueOnce(new Error());
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${deckPayload._id}/deckTraining`).send(
                        {completionTimeSeconds: 300, cards: [{id: cardPayload._id, box: 5}]})
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(500);
                        });
                });
            });
        });
    });

    describe("DELETE Deck Training", () => {
        describe("Given logged user has an ongoing deck training", () => {
            it("should return a 204", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                jest.spyOn(DeckTraining, "findOneAndDelete").mockResolvedValueOnce(tempResponsePayload);
                jest.spyOn(Card, "find").mockResolvedValueOnce([cardPayload]);
                jest.spyOn(CardTraining, "findOneAndDelete").mockResolvedValueOnce(null);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).delete(`/api/decks/${deckPayload._id}/deckTraining`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(204);
                        });
                });
            });

            describe("Given Internal Error occurs while deleting cards", () => {
                it("should return a 500", async () => {
                    jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                    jest.spyOn(DeckTraining, "findOneAndDelete").mockResolvedValueOnce(tempResponsePayload);
                    jest.spyOn(Card, "find").mockResolvedValueOnce([cardPayload]);
                    jest.spyOn(CardTraining, "findOneAndDelete").mockRejectedValueOnce(new Error());
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).delete(`/api/decks/${deckPayload._id}/deckTraining`)
                            .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(500);
                            });
                    });
                });
            });

        });

        describe("Given logged user has an ongoing deck training", () => {
            it("should return a 204", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                jest.spyOn(DeckTraining, "findOneAndDelete").mockRejectedValueOnce(new Error());
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).delete(`/api/decks/${deckPayload._id}/deckTraining`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(204);
                        });
                });
            });
        });
    });
});