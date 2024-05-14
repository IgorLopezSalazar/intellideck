import supertest from "supertest";
import {expect, describe, it, jest} from '@jest/globals';
import {app} from "../../src/app.ts";
import {User} from "../../src/models/user.ts";
import {Middleware} from "../../src/middleware.ts";

const middleware = new Middleware();

const userPayload = {
    id: "663bd4577abace2f8505108e",
    role: "USER"
}
const invalidToken = "Bearer none";
const creationPayload = {
    name: "Test",
    username: "TestTesty",
    email: "test@test.com",
    password: "$2a$10$Xu39yMLoJEH/2bEkNRUFseMaICGmGMbTjJzlJttvEfW9cjjI.yOuW",
    role: "USER"
}
const responsePayload = {
    _id: '66326642b6e5d026db70f695',
    ...creationPayload
};

describe("User", () => {
    describe("GET User by ID Method", () => {
        describe("User logged", () => {
            describe("Given ID not existing", () => {
                it("should return a 404", async () => {
                    const id = 'none';
                    const userMock = jest.spyOn(User, "findById")
                        .mockResolvedValueOnce(null);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/${id}`)
                            .set({"Authorization": token}).then(response => {
                                expect(response.status).toEqual(404);
                            });
                    });
                });
            });

            describe("Given valid user ID", () => {
                it("should return a 200 and the user", async () => {
                    const createUserMock = jest.spyOn(User, "findById")
                        .mockResolvedValueOnce(responsePayload);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/${responsePayload._id}`)
                            .set({"Authorization": token}).then(response => {
                                expect(response.status).toEqual(200);
                                expect(response.body).toMatchObject(expect.objectContaining(responsePayload));
                            });
                    });
                });
            })
        });
        describe("User not logged", () => {
            describe("Given valid user ID and not sending token", () => {
                it("should return a 400 bad request", async () => {
                    await supertest(app).get(`/api/users/${responsePayload._id}`)
                        .then(response => {
                            expect(response.status).toEqual(400);
                        });
                });
            });

            describe("Given valid user ID and sending invalid token", () => {
                it("should return a 401 unauthorized", async () => {
                    await supertest(app).get(`/api/users/${responsePayload._id}`)
                        .set({"Authorization": invalidToken})
                        .then(response => {
                            expect(response.status).toEqual(401);
                        });
                });
            })
        });
    })

    describe("GET Users Followed Method", () => {
        describe("User logged", () => {
            describe("Given user ID provided and users followed", () => {
                it("should return a 200 and the users", async () => {
                    const arrayPayload = {
                        followedUsers: [responsePayload]
                    };

                     const userMock = jest.spyOn(User, "aggregate")
                         .mockResolvedValueOnce([arrayPayload]);

                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/followed/${userPayload.id}`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(200);
                                console.log(response.body);
                                expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(responsePayload)]));
                            });
                    });
                });
            });

            describe("Given no users followed", () => {
                it("should return a 204", async () => {
                    const userMock = jest.spyOn(User, "aggregate")
                        .mockResolvedValueOnce([{
                            followedUsers: []
                        }]);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/followed/${userPayload.id}`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(204);
                            });
                    });
                });
            });
        });
    })

    describe("GET Followers Method", () => {
        describe("User logged", () => {
            describe("Given user ID passed and user with followers", () => {
                it("should return a 200 and the followers", async () => {
                    const createUserMock = jest.spyOn(User, "find")
                        .mockResolvedValueOnce([responsePayload]);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/followers/${userPayload.id}`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(200);
                                expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(responsePayload)]));
                            });
                    });
                });
            });

            describe("Given no followers exist", () => {
                it("should return a 204", async () => {
                    const createUserMock = jest.spyOn(User, "find")
                        .mockResolvedValueOnce([]);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/followers/${userPayload.id}`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(204);
                            });
                    });
                });
            });
        });
    })

    describe("POST User Method", () => {
        describe("Given user data is valid", () => {
            it("should return a 201 and the created object", async () => {
                const createUserMock = jest.spyOn(User, "create")
                    .mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                        resolve(responsePayload);
                    }));

                await supertest(app).post(`/api/users/`).send(creationPayload)
                    .set({Accept: 'application/json', 'Content-type': 'application/json'})
                    .then(response => {
                        expect(response.status).toEqual(201);
                        expect(response.body).toMatchObject(expect.objectContaining({
                            _id: expect.any(String),
                            name: "Test",
                            username: "TestTesty",
                            email: "test@test.com",
                            password: expect.stringMatching(/^[$]2a[$]10[$].*$/),
                            role: "USER"
                        }));
                    });
            });
        });

        describe("Given user data is duplicated", () => {
            it("should return a 409", async () => {
                const createUserMock = jest.spyOn(User, "create")
                    .mockRejectedValueOnce(new Error());

                await supertest(app).post(`/api/users/`).send(creationPayload)
                    .set({Accept: 'application/json', 'Content-type': 'application/json'})
                    .then(response => {
                        expect(response.status).toEqual(409);
                    });
            });
        });
    });

    describe("PUT User Method", () => {
        describe("Given user data is valid", () => {
            it("should return a 200 and the updated object", async () => {
                const createUserMock = jest.spyOn(User, "findByIdAndUpdate")
                    .mockResolvedValueOnce(responsePayload);

                await middleware.generateToken(responsePayload._id, responsePayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/users/`).send({username: creationPayload.username})
                        .set({"Authorization": token, Accept: 'application/json', 'Content-type': 'application/json'})
                        .then(response => {
                            expect(response.status).toEqual(200);
                            expect(response.body).toMatchObject(expect.objectContaining(responsePayload));
                        });
                });
            });
        });

        describe("Given user data is duplicated", () => {
            it("should return a 409", async () => {
                const createUserMock = jest.spyOn(User, "findByIdAndUpdate")
                    .mockRejectedValueOnce(new Error());

                await middleware.generateToken(responsePayload._id, responsePayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/users/`).send({username: creationPayload.username})
                        .set({"Authorization": token, Accept: 'application/json', 'Content-type': 'application/json'})
                        .then(response => {
                            expect(response.status).toEqual(409);
                        });
                });
            });
        });
    });

    describe("POST Login Method", () => {
        describe("Given login data is valid", () => {
            it("should return a 200 and a jwt token", async () => {
                const createUserMock = jest.spyOn(User, "findOne")
                    .mockResolvedValueOnce(responsePayload);
                await supertest(app).post(`/api/login/`).send({
                    username: responsePayload.username,
                    password: "12345678"
                }).set({'Content-type': 'application/json'})
                    .then(response => {
                        expect(response.status).toEqual(200);
                        expect(response.body).toMatch(new RegExp(/^Bearer .*$/));
                    });
            });
        });

        describe("Given login data is invalid", () => {
            describe("Given username does not exist", () => {
                it("should return a 401", async () => {
                    const createUserMock = jest.spyOn(User, "findOne")
                        .mockResolvedValueOnce(null);
                    await supertest(app).post(`/api/login/`).send({
                        username: "NonexistentUser",
                        password: "12345678"
                    }).set({'Content-type': 'application/json'})
                        .then(response => {
                            expect(response.status).toEqual(401);
                        });
                });
            });
            describe("Given password is not the same", () => {
                it("should return a 401", async () => {
                    const createUserMock = jest.spyOn(User, "findOne")
                        .mockResolvedValueOnce(responsePayload);
                    await supertest(app).post(`/api/login/`).send({
                        username: responsePayload.username,
                        password: "NotTheCorrectPassword"
                    }).set({'Content-type': 'application/json'})
                        .then(response => {
                            expect(response.status).toEqual(401);
                        });
                });
            });
        });
    });

    describe("PUT Follow Method", () => {
        describe("Given user is not followed", () => {
            describe("Given user is logged", () => {
                describe("Given user to follow exists", () => {
                    it("should return a 200 and the logged user following the user to follow", async () => {
                        const userLoggedPayload = {
                            _id: userPayload.id,
                            ...creationPayload
                        };

                        const followingPayload = {
                            ...userLoggedPayload,
                            followedUsers: [responsePayload._id]
                        }
                        const userMock = jest.spyOn(User, "findById")
                            .mockResolvedValueOnce(userLoggedPayload);
                        const followMock = jest.spyOn(User, "findOneAndUpdate")
                            .mockResolvedValueOnce(followingPayload);
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/users/follow`).send({id: responsePayload._id})
                                .set({"Authorization": token, 'Content-type': 'application/json'})
                                .then(response => {
                                    expect(response.status).toEqual(200);
                                    expect(response.body).toMatchObject(expect.objectContaining(followingPayload));
                                    expect(response.body.followedUsers.length).toBeGreaterThan(0);
                                    expect(response.body.followedUsers).toContainEqual(responsePayload._id);
                                });
                        });
                    });
                });
            });

            describe("Given user is not logged", () => {
                it("should return a 401 unauthorized", async () => {
                    await supertest(app).put(`/api/users/follow`).send({id: responsePayload._id})
                        .set({"Authorization": invalidToken, 'Content-type': 'application/json'})
                        .then(response => {
                            expect(response.status).toEqual(401);
                        });
                });
            });
        });

        describe("Given user is followed", () => {
            describe("Given user is logged", () => {
                describe("Given user to follow exists", () => {
                    it("should return a 400 bad request", async () => {
                        const userLoggedPayload = {
                            _id: userPayload.id,
                            ...creationPayload
                        };

                        const userMock = jest.spyOn(User, "findById")
                            .mockResolvedValueOnce(userLoggedPayload);
                        const followMock = jest.spyOn(User, "findOneAndUpdate")
                            .mockResolvedValueOnce(null);
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/users/follow`).send({id: responsePayload._id})
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

    describe("PUT Unfollow Method", () => {
        describe("Given user is followed", () => {
            describe("Given user is logged", () => {
                describe("Given user to unfollow exists", () => {
                    it("should return a 200 and the logged user without the user to unfollow", async () => {
                        const userLoggedPayload = {
                            _id: userPayload.id,
                            ...creationPayload,
                            followedUsers: [responsePayload._id]
                        };
                        const unfollowingPayload = {
                            _id: userPayload.id,
                            ...creationPayload,
                            followedUsers: []
                        };
                        const userMock = jest.spyOn(User, "findById")
                            .mockResolvedValueOnce(userLoggedPayload);
                        const followMock = jest.spyOn(User, "findOneAndUpdate")
                            .mockResolvedValueOnce(unfollowingPayload);
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/users/unfollow`).send({id: responsePayload._id})
                                .set({"Authorization": token, 'Content-type': 'application/json'})
                                .then(response => {
                                    expect(response.status).toEqual(200);
                                    expect(response.body).toMatchObject(expect.objectContaining(unfollowingPayload));
                                    expect(response.body.followedUsers.length).toEqual(0);
                                });
                        });
                    });
                });
            });

            describe("Given user is not logged", () => {
                it("should return a 401 unauthorized", async () => {
                    await supertest(app).put(`/api/users/unfollow`).send({id: responsePayload._id})
                        .set({"Authorization": invalidToken, 'Content-type': 'application/json'})
                        .then(response => {
                            expect(response.status).toEqual(401);
                        });
                });
            });
        });

        describe("Given user is not followed", () => {
            describe("Given user is logged", () => {
                describe("Given user to unfollow exists", () => {
                    it("should return a 400 bad request", async () => {
                        const userLoggedPayload = {
                            _id: userPayload.id,
                            ...creationPayload,
                            followedUsers: []
                        };

                        const userMock = jest.spyOn(User, "findById")
                            .mockResolvedValueOnce(userLoggedPayload);
                        const user2Mock = jest.spyOn(User, "findOneAndUpdate")
                            .mockResolvedValueOnce(null);
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/users/unfollow`).send({id: responsePayload._id})
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
})