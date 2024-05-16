import supertest from "supertest";
import {expect, describe, it, jest} from '@jest/globals';
import {app} from "../../src/app.ts";
import {Middleware} from "../../src/middleware.ts";
import {Tag} from "../../src/models/tag.ts";

const middleware = new Middleware();

const userPayload = {
    id: "663bd4577abace2f8505108e",
    role: "USER"
}

const responsePayload = {
    _id: '66326642b6e5d026db70f695',
    name: "TestTag"
};

describe("Tag", () => {
    describe("GET Tags", () => {
        describe("Given Internal Error occurs", () => {
            it("should return a 500", async () => {
                jest.spyOn(Tag, "find").mockRejectedValueOnce(new Error());
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/tags`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(500);
                        });
                });
            });
        });

        describe("Given tags exist", () => {
            it("should return a 200 and the tags", async () => {
                jest.spyOn(Tag, "find").mockResolvedValueOnce([responsePayload]);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/tags`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(200);
                            expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(responsePayload)]));
                        });
                });
            });
        });

        describe("Given no valid tag exists", () => {
            it("should return a 204", async () => {
                jest.spyOn(Tag, "find").mockResolvedValueOnce([]);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/tags`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(204);
                        });
                });
            });
        });
    });

    describe("GET Tag by name", () => {
        describe("Given Internal Error occurs while retrieving tag", () => {
            it("should return a 500", async () => {
                jest.spyOn(Tag, "findOne").mockRejectedValueOnce(new Error());
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/tags/${responsePayload.name}`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(500);
                        });
                });
            });
        });

        describe("Given tag exists", () => {
            it("should return a 200 and the tag", async () => {
                jest.spyOn(Tag, "findOne").mockResolvedValueOnce(responsePayload);
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).get(`/api/tags/${responsePayload.name}`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(200);
                            expect(response.body).toMatchObject(expect.objectContaining(responsePayload));
                        });
                });
            });
        });

        describe("Given tag does not exist", () => {
            describe("Given data is valid", () => {
                it("should return a 201 and the tag", async () => {
                    jest.spyOn(Tag, "findOne").mockResolvedValueOnce(null);
                    jest.spyOn(Tag, "create")
                        .mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                            resolve(responsePayload);
                        }));
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/tags/${responsePayload.name}`)
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
                    jest.spyOn(Tag, "findOne").mockResolvedValueOnce(null);
                    jest.spyOn(Tag, "create").mockRejectedValueOnce(new Error());
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/tags/${responsePayload.name}`)
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