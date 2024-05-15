import supertest from "supertest";
import {expect, describe, it, jest} from '@jest/globals';
import {app} from "../../src/app.ts";
import {Middleware} from "../../src/middleware.ts";
import {Topic} from "../../src/models/topic.ts";

const middleware = new Middleware();

const userPayload = {
    id: "663bd4577abace2f8505108e",
    role: "USER"
}

const adminPayload = {
    id: "663bd4577abace2f8505108e",
    role: "ADMIN"
}

const responsePayload = {
    _id: '66326642b6e5d026db70f695',
    name: "TestTopic"
};

describe("Topic", () => {
    describe("GET Topics", () => {
        describe("Given topics exist", () => {
            it("should return a 200 and the topics", async () => {
                jest.spyOn(Topic, "find").mockResolvedValueOnce([responsePayload]);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/topics/`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(200);
                            expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(responsePayload)]));
                        });
                });
            });
        });

        describe("Given no topic exists", () => {
            it("should return a 204", async () => {
                jest.spyOn(Topic, "find").mockResolvedValueOnce([]);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/topics/`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(204);
                        });
                });
            });
        });

        describe("Given Internal Error occurs", () => {
            it("should return a 500", async () => {
                jest.spyOn(Topic, "find").mockRejectedValueOnce(new Error());
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/topics/`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(500);
                        });
                });
            });
        });
    });

    describe("POST Topic", () => {
        describe("Given logged user is admin", () => {
            describe("Given data is valid", () => {
                it("should return a 201 and the created topic", async () => {
                    jest.spyOn(Topic, "create")
                        .mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                            resolve(responsePayload);
                        }));
                    await middleware.generateToken(adminPayload.id, adminPayload.role).then(async (token: any) => {
                        await supertest(app).post(`/api/topics/`).send({name: responsePayload.name})
                            .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(201);
                                expect(response.body).toMatchObject(expect.objectContaining(responsePayload));
                            });
                    });
                });
            });

            describe("Given data is not valid", () => {
                it("should return a 400", async () => {
                    jest.spyOn(Topic, "create").mockRejectedValueOnce(new Error());
                    await middleware.generateToken(adminPayload.id, adminPayload.role).then(async (token: any) => {
                        await supertest(app).post(`/api/topics/`)
                            .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(400);
                            });
                    });
                });
            });
        });

        describe("Given logged user is not admin", () => {
            it("should return a 401", async () => {
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).post(`/api/topics/`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(401);
                        });
                });
            });
        });
    });

    describe("PUT Topic", () => {
        describe("Given logged user is admin", () => {
            describe("Given data is valid", () => {
                it("should return a 200 and the updated topic", async () => {
                    jest.spyOn(Topic, "findByIdAndUpdate").mockResolvedValueOnce(responsePayload);
                    await middleware.generateToken(adminPayload.id, adminPayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/topics/${responsePayload._id}`).send({name: responsePayload.name})
                            .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(200);
                                expect(response.body).toMatchObject(expect.objectContaining(responsePayload));
                            });
                    });
                });
            });

            describe("Given data is not valid", () => {
                describe("Given id not found", () => {
                    it("should return a 404", async () => {
                        jest.spyOn(Topic, "findByIdAndUpdate").mockResolvedValueOnce(null);
                        await middleware.generateToken(adminPayload.id, adminPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/topics/${responsePayload._id}`).send({name: responsePayload.name})
                                .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                                .then(response => {
                                    expect(response.status).toEqual(404);
                                });
                        });
                    });
                });

                describe("Given name not sent", () => {
                    it("should return a 400", async () => {
                        jest.spyOn(Topic, "findByIdAndUpdate").mockRejectedValueOnce(new Error());
                        await middleware.generateToken(adminPayload.id, adminPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/topics/${responsePayload._id}`).send({name: responsePayload.name})
                                .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                                .then(response => {
                                    expect(response.status).toEqual(400);
                                });
                        });
                    });
                });
            });
        });

        describe("Given logged user is not admin", () => {
            it("should return a 401", async () => {
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/topics/${responsePayload._id}`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(401);
                        });
                });
            });
        });
    });

    describe("DELETE Topic", () => {
        describe("Given logged user is admin", () => {
            it("should return a 204", async () => {
                jest.spyOn(Topic, "findByIdAndDelete").mockResolvedValueOnce(null);
                await middleware.generateToken(adminPayload.id, adminPayload.role).then(async (token: any) => {
                    await supertest(app).delete(`/api/topics/${responsePayload._id}`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(204);
                        });
                });
            });

            describe("Given Internal Error occurs", () => {
                it("should return a 500", async () => {
                    jest.spyOn(Topic, "findByIdAndDelete").mockRejectedValueOnce(new Error());
                    await middleware.generateToken(adminPayload.id, adminPayload.role).then(async (token: any) => {
                        await supertest(app).delete(`/api/topics/${responsePayload._id}`)
                            .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(500);
                            });
                    });
                });
            });
        });

        describe("Given logged user is not admin", () => {
            it("should return a 401", async () => {
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).delete(`/api/topics/${responsePayload._id}`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(401);
                        });
                });
            });
        });
    });
});