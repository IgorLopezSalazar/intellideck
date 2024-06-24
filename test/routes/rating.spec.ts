import supertest from "supertest";
import {expect, describe, it, jest} from '@jest/globals';
import {app} from "../../src/app.ts";
import {Middleware} from "../../src/middleware.ts";
import {Rating} from "../../src/models/rating.ts";
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

const responsePayload = [{
    _id: '6640e53d2da54166918514bd',
    rate: 8,
    deck: deckPayload._id,
    user: userPayload.id
}, {
    _id: '6640e53d2da54166918514bt',
    rate: 4,
    deck: deckPayload._id,
    user: "663bd4577abace2f8505108f"
}];

describe("Rating", () => {
    describe("POST Rating", () => {
        describe("Given user has not rated deck yet", () => {
            describe("Given data is valid", () => {
                it("should return a 201 and the created rating", async () => {
                    jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                    jest.spyOn(Rating, "create")
                        .mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                            resolve(responsePayload[0]);
                        }));
                    jest.spyOn(Rating, "find").mockResolvedValueOnce(responsePayload);
                    jest.spyOn(Deck, "findByIdAndUpdate").mockResolvedValueOnce(deckPayload);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).post(`/api/decks/${deckPayload._id}/ratings`).send(
                            {rate: responsePayload[0].rate})
                            .set({
                                Accept: 'application/json',
                                'Content-type': 'application/json',
                                "Authorization": token
                            })
                            .then(response => {
                                expect(response.status).toEqual(201);
                                expect(response.body).toBe(6);
                            });
                    });
                });
            });
        });

        describe("Given user has rated the deck", () => {
            it("should return a 409", async () => {
                jest.spyOn(Rating, "create").mockRejectedValueOnce({code: 11000});
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).post(`/api/decks/${deckPayload._id}/ratings`).send(
                        {rate: responsePayload[0].rate})
                        .set({
                            Accept: 'application/json',
                            'Content-type': 'application/json',
                            "Authorization": token
                        })
                        .then(response => {
                            expect(response.status).toEqual(409);
                        });
                });
            });
        });

        describe("Given deck is unpublished", () => {
            it("should return a 404", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(null);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).post(`/api/decks/${deckPayload._id}/ratings`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(404);
                        });
                });
            });
        });
    });

    describe("GET Rating of logged user", () => {
        describe("Given user has rated the deck", () => {
            describe("Given data is valid", () => {
                it("should return a 200 and the rating", async () => {
                    jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                    jest.spyOn(Rating, "findOne").mockResolvedValueOnce(responsePayload[0]);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/decks/${deckPayload._id}/ratings`).send(
                            {rate: responsePayload[0].rate})
                            .set({
                                Accept: 'application/json',
                                'Content-type': 'application/json',
                                "Authorization": token
                            })
                            .then(response => {
                                expect(response.status).toEqual(200);
                                expect(response.body).toMatchObject(expect.objectContaining(responsePayload[0]));
                            });
                    });
                });
            });
        });

        describe("Given user has not rated the deck", () => {
            it("should return a 204", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                jest.spyOn(Rating, "findOne").mockResolvedValueOnce(null);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/${deckPayload._id}/ratings`).send(
                        {rate: responsePayload[0].rate})
                        .set({
                            Accept: 'application/json',
                            'Content-type': 'application/json',
                            "Authorization": token
                        })
                        .then(response => {
                            expect(response.status).toEqual(204);
                        });
                });
            });
        });

        describe("Given deck is unpublished", () => {
            it("should return a 404", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(null);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/decks/${deckPayload._id}/ratings`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(404);
                        });
                });
            });
        });
    });

    describe("PUT Rating", () => {
        describe("Given logged user has rated the deck", () => {
            describe("Given data is valid", () => {
                it("should return a 200 and the updated rating", async () => {
                    jest.spyOn(Rating, "findOneAndUpdate").mockResolvedValueOnce(responsePayload[0]);
                    jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                    jest.spyOn(Rating, "find").mockResolvedValueOnce(responsePayload);
                    jest.spyOn(Deck, "findByIdAndUpdate").mockResolvedValueOnce(deckPayload);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/decks/${deckPayload._id}/ratings`).send(
                            {rate: responsePayload[0].rate})
                            .set({
                                Accept: 'application/json',
                                'Content-type': 'application/json',
                                "Authorization": token
                            })
                            .then(response => {
                                expect(response.status).toEqual(200);
                                expect(response.body).toBe(6);
                            });
                    });
                });
            });

            describe("Given data is not valid", () => {
                describe("Given data for find is not correct", () => {
                    it("should return a 400", async () => {
                        jest.spyOn(Rating, "findOneAndUpdate").mockResolvedValueOnce(null);
                        jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/decks/${deckPayload._id}/ratings`)
                                .set({
                                    Accept: 'application/json',
                                    'Content-type': 'application/json',
                                    "Authorization": token
                                })
                                .then(response => {
                                    expect(response.status).toEqual(400);
                                });
                        });
                    });
                });

                describe("Given validators failed", () => {
                    it("should return a 400", async () => {
                        jest.spyOn(Rating, "findOneAndUpdate").mockRejectedValueOnce({errors: {rating: {kind: "user defined"}}});
                        jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/decks/${deckPayload._id}/ratings`)
                                .set({
                                    Accept: 'application/json',
                                    'Content-type': 'application/json',
                                    "Authorization": token
                                })
                                .then(response => {
                                    expect(response.status).toEqual(400);
                                });
                        });
                    });
                });
            });
        });

        describe("Given deck is unpublished", () => {
            it("should return a 404", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(null);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/decks/${deckPayload._id}/ratings`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(404);
                        });
                });
            });
        });
    });

    describe("DELETE Rating", () => {
        describe("Given deck is published", () => {
            it("should return a 204", async () => {
                jest.spyOn(Rating, "findOneAndDelete").mockResolvedValueOnce(null);
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                jest.spyOn(Rating, "find").mockResolvedValueOnce(responsePayload);
                jest.spyOn(Deck, "findByIdAndUpdate").mockResolvedValueOnce(deckPayload);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).delete(`/api/decks/${deckPayload._id}/ratings`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(204);
                        });
                });
            });

            describe("Given Internal Error occurs", () => {
                it("should return a 500", async () => {
                    jest.spyOn(Rating, "findOneAndDelete").mockRejectedValueOnce(new Error());
                    jest.spyOn(Deck, "findOne").mockResolvedValueOnce(deckPayload);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).delete(`/api/decks/${deckPayload._id}/ratings`)
                            .set({
                                Accept: 'application/json',
                                'Content-type': 'application/json',
                                "Authorization": token
                            })
                            .then(response => {
                                expect(response.status).toEqual(500);
                            });
                    });
                });
            });
        });

        describe("Given deck is unpublished", () => {
            it("should return a 404", async () => {
                jest.spyOn(Deck, "findOne").mockResolvedValueOnce(null);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).delete(`/api/decks/${deckPayload._id}/ratings`)
                        .set({
                            Accept: 'application/json',
                            'Content-type': 'application/json',
                            "Authorization": token
                        })
                        .then(response => {
                            expect(response.status).toEqual(404);
                        });
                });
            });
        });
    });
});