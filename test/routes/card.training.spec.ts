import supertest from "supertest";
import {describe, expect, it, jest} from '@jest/globals';
import {app} from "../../src/app.ts";
import {Middleware} from "../../src/middleware.ts";
import {Deck} from "../../src/models/deck.ts";
import {CardTraining} from "../../src/models/card.training.ts";
import {DeckTraining} from "../../src/models/deck.training.ts";

const middleware = new Middleware();

const userPayload = {
    id: "663bd4577abace2f8505108e",
    role: "USER"
}

const deckPayload = {
    _id: "66326642b6e5d026db70f695",
    title: "TestDeck",
    description: "This is a test deck",
    isPublished: true,
    creator: userPayload.id
};

const deckTrainingPayload = {
    _id: "66326742b6e5d026db70f694",
    startDate: new Date("2024-05-20"),
    boxAmount: 7,
    backtrack: "BACKTRACK_PRIOR",
    user: "663bd4577abace2f8505108e",
    deck: "66326642b6e5d026db70f695",
    statistics: {
        attempts: 1,
        avgCompletionTimeSeconds: 360
    }
};

const datePayload = {
    nextTraining: new Date("2024-05-02")
}

const tempResponsePayload = {
    isShown: true,
    _id: '6640e53d2da54166918514bd',
    box: 1,
    deckTraining: deckTrainingPayload._id,
    card: '6640e53d2da54166918514b2'
};

describe("Card Training", () => {
    describe("GET Cards trainings of deck training", () => {
        describe("Given card trainings exist in deck training", () => {
            it("should return a 200 and the card trainings", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                jest.spyOn(DeckTraining, "findOne").mockResolvedValueOnce(deckTrainingPayload);
                jest.spyOn(CardTraining, 'find').mockImplementation(() => ({
                    populate: () => ({
                        populate: () =>
                            ({
                                exec: jest.fn().mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                                    resolve([{...datePayload, ...tempResponsePayload}]);
                                }))
                            })
                    })
                } as any));

                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/${deckPayload._id}/deckTraining/cards`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(200);
                            expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(
                                {nextTraining: datePayload.nextTraining.toISOString(), ...tempResponsePayload})]));
                        });
                });
            });
        });

        describe("Given no card trainings exist", () => {
            it("should return a 204", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                jest.spyOn(DeckTraining, "findOne").mockResolvedValueOnce(deckTrainingPayload);
                jest.spyOn(CardTraining, "find").mockImplementation(() => ({
                    populate: () => ({
                        populate: () =>
                            ({
                                exec: jest.fn().mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                                    resolve([]);
                                }))
                            })
                    })
                } as any));
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/${deckPayload._id}/deckTraining/cards`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(204);
                        });
                });
            });
        });

        describe("Given Internal Error occurs", () => {
            it("should return a 500", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                jest.spyOn(DeckTraining, "findOne").mockResolvedValueOnce(deckTrainingPayload);
                jest.spyOn(CardTraining, "find").mockImplementation(() => ({
                    populate: () => ({
                        populate: () =>
                            ({
                                exec: jest.fn().mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                                    reject(new Error());
                                }))
                            })
                    })
                } as any));
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/${deckPayload._id}/deckTraining/cards`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(500);
                        });
                });
            });
        });
    });

    describe("GET Cards trainings of deck training for today", () => {
        describe("Given card trainings exist in deck training", () => {
            it("should return a 200 and the card trainings for today (day and month < 10)", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                jest.spyOn(DeckTraining, "findOne").mockResolvedValueOnce(deckTrainingPayload);
                jest.spyOn(CardTraining, 'find').mockImplementation(() => ({
                    populate: () => ({
                        populate: () =>
                            ({
                                exec: jest.fn().mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                                    resolve([{...datePayload, ...tempResponsePayload}]);
                                }))
                            })
                    })
                } as any));

                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/${deckPayload._id}/deckTraining/cards/today`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(200);
                            expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(
                                {nextTraining: datePayload.nextTraining.toISOString(), ...tempResponsePayload})]));
                        });
                });
            });
        });

        describe("Given no card trainings exist for today", () => {
            it("should return a 204", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                jest.spyOn(DeckTraining, "findOne").mockResolvedValueOnce(deckTrainingPayload);
                jest.spyOn(CardTraining, 'find').mockImplementation(() => ({
                    populate: () => ({
                        populate: () =>
                            ({
                                exec: jest.fn().mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                                    resolve([]);
                                }))
                            })
                    })
                } as any));
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/${deckPayload._id}/deckTraining/cards/today`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(204);
                        });
                });
            });
        });

        describe("Given Internal Error occurs", () => {
            it("should return a 500", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                jest.spyOn(DeckTraining, "findOne").mockResolvedValueOnce(deckTrainingPayload);
                jest.spyOn(CardTraining, 'find').mockImplementation(() => ({
                    populate: () => ({
                        populate: () =>
                            ({
                                exec: jest.fn().mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                                    reject(new Error());
                                }))
                            })
                    })
                } as any));
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/${deckPayload._id}/deckTraining/cards/today`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(500);
                        });
                });
            });
        });
    });

    describe("PUT Show/Hide Card", () => {
        describe("Given deck is published", () => {
            describe("Given user has deck training", () => {
                describe("Given user has card training", () => {
                    describe("Given hide", () => {
                        it("should return a 200 and the card training hidden", async () => {
                            tempResponsePayload.isShown = false;
                            jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                            jest.spyOn(DeckTraining, "findOne").mockResolvedValueOnce(deckTrainingPayload);
                            jest.spyOn(CardTraining, "findOneAndUpdate").mockResolvedValueOnce({...datePayload, ...tempResponsePayload});

                            await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                                await supertest(app).put(`/api/decks/${deckPayload._id}/deckTraining/cards/${tempResponsePayload.card}/hide`)
                                    .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                                    .then(response => {
                                        expect(response.status).toEqual(200);
                                        expect(response.body).toMatchObject(expect.objectContaining(
                                            {nextTraining: datePayload.nextTraining.toISOString(), ...tempResponsePayload}));
                                    });
                            });
                        });
                    });

                    describe("Given show", () => {
                        it("should return a 200 and the card training shown", async () => {
                            jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                            jest.spyOn(DeckTraining, "findOne").mockResolvedValueOnce(deckTrainingPayload);
                            jest.spyOn(CardTraining, "findOneAndUpdate").mockResolvedValueOnce({...datePayload, ...tempResponsePayload});

                            await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                                await supertest(app).put(`/api/decks/${deckPayload._id}/deckTraining/cards/${tempResponsePayload.card}/show`)
                                    .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                                    .then(response => {
                                        expect(response.status).toEqual(200);
                                        expect(response.body).toMatchObject(expect.objectContaining(
                                            {nextTraining: datePayload.nextTraining.toISOString(), ...tempResponsePayload}));
                                    });
                            });
                        });
                    });
                });

                describe("Given user has not card training", () => {
                    describe("Given hide", () => {
                        it("should return a 404", async () => {
                            jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                            jest.spyOn(DeckTraining, "findOne").mockResolvedValueOnce(deckTrainingPayload);
                            jest.spyOn(CardTraining, "findOneAndUpdate").mockResolvedValueOnce(null);

                            await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                                await supertest(app).put(`/api/decks/${deckPayload._id}/deckTraining/cards/${tempResponsePayload.card}/hide`)
                                    .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                                    .then(response => {
                                        expect(response.status).toEqual(404);
                                    });
                            });
                        });
                    });

                    describe("Given show", () => {
                        it("should return a 404", async () => {
                            jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                            jest.spyOn(DeckTraining, "findOne").mockResolvedValueOnce(deckTrainingPayload);
                            jest.spyOn(CardTraining, "findOneAndUpdate").mockResolvedValueOnce(null);

                            await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                                await supertest(app).put(`/api/decks/${deckPayload._id}/deckTraining/cards/${tempResponsePayload.card}/show`)
                                    .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                                    .then(response => {
                                        expect(response.status).toEqual(404);
                                    });
                            });
                        });
                    });
                });
            });

            describe("Given user has not deck training", () => {
                describe("Given hide", () => {
                    it("should return a 404", async () => {
                        jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                        jest.spyOn(DeckTraining, "findOne").mockResolvedValueOnce(null);

                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/decks/${deckPayload._id}/deckTraining/cards/${tempResponsePayload.card}/hide`)
                                .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                                .then(response => {
                                    expect(response.status).toEqual(404);
                                });
                        });
                    });
                });

                describe("Given show", () => {
                    it("should return a 404", async () => {
                        jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                        jest.spyOn(DeckTraining, "findOne").mockResolvedValueOnce(null);

                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/decks/${deckPayload._id}/deckTraining/cards/${tempResponsePayload.card}/show`)
                                .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                                .then(response => {
                                    expect(response.status).toEqual(404);
                                });
                        });
                    });
                });
            });

            describe("Given Internal Error while updating", () => {
                describe("Given hide", () => {
                    it("should return a 500", async () => {
                        jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                        jest.spyOn(DeckTraining, "findOne").mockResolvedValueOnce(deckTrainingPayload);
                        jest.spyOn(CardTraining, "findOneAndUpdate").mockRejectedValueOnce(new Error());

                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/decks/${deckPayload._id}/deckTraining/cards/${tempResponsePayload.card}/hide`)
                                .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                                .then(response => {
                                    expect(response.status).toEqual(500);
                                });
                        });
                    });
                });

                describe("Given show", () => {
                    it("should return a 500", async () => {
                        jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                        jest.spyOn(DeckTraining, "findOne").mockResolvedValueOnce(deckTrainingPayload);
                        jest.spyOn(CardTraining, "findOneAndUpdate").mockRejectedValueOnce(new Error());

                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/decks/${deckPayload._id}/deckTraining/cards/${tempResponsePayload.card}/show`)
                                .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                                .then(response => {
                                    expect(response.status).toEqual(500);
                                });
                        });
                    });
                });
            });
        });
    });
});