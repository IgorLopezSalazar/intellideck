import supertest from "supertest";
import {expect, describe, it, jest} from '@jest/globals';
import {app} from "../../src/app.ts";
import {User} from "../../src/models/user.ts";
import {Middleware} from "../../src/middleware.ts";
import {Aggregate} from "mongoose";

jest.useFakeTimers();
const middleware = new Middleware();

const userPayload = {
    id: "663bd4577abace2f8505108e",
    role: "USER"
}

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
                    const id = '66326642b6e5d026db70f695';
                    const responsePayload = {
                        _id: id,
                        name: "Test",
                        username: "TestTesty",
                        email: "test@test.com",
                        password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                        role: "USER"
                    };
                    const createUserMock = jest.spyOn(User, "findById")
                        .mockResolvedValueOnce(responsePayload);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/${id}`)
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
                    const userID = '66326642b6e5d026db70f695';
                    await supertest(app).get(`/api/users/${userID}`)
                        .then(response => {
                            expect(response.status).toEqual(400);
                        });
                });
            });

            describe("Given valid user ID and sending invalid token", () => {
                it("should return a 401 unauthorized", async () => {
                    const userID = '66326642b6e5d026db70f695';
                    const invalidToken = "Bearer none"
                    await supertest(app).get(`/api/users/${userID}`)
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
                    const userID = '66326642b6e5d026db70f695';
                    const followedUserPayload = {
                        _id: userID,
                        name: "Test",
                        username: "TestTesty",
                        email: "test@test.com",
                        password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                        role: "USER"
                    }
                    const responsePayload = {
                        followedUsers: [followedUserPayload]
                    };

                     const userMock = jest.spyOn(User, "aggregate")
                         .mockResolvedValueOnce([responsePayload]);

                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/followed/${userPayload.id}`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(200);
                                console.log(response.body);
                                expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(followedUserPayload)]));
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
                    const userID = '66326642b6e5d026db70f695';
                    const responsePayload = {
                        _id: userID,
                        name: "Test",
                        username: "TestTesty",
                        email: "test@test.com",
                        password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                        role: "USER"
                    };
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
                const responsePayload = {
                    _id: "66326642b6e5d026db70f695",
                    name: "Test",
                    username: "TestTesty",
                    email: "test@test.com",
                    password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                    role: "USER"
                };
                const createUserMock = jest.spyOn(User, "create")
                    .mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                        resolve(responsePayload);
                    }));

                await supertest(app).post(`/api/users/`).send({
                    name: "Test",
                    username: "TestTesty",
                    email: "test@test.com",
                    password: "12345678",
                    role: "USER"
                }).set({Accept: 'application/json', 'Content-type': 'application/json'})
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

                await supertest(app).post(`/api/users/`).send({
                    name: "Test",
                    username: "TestTesty",
                    email: "test@test.com",
                    password: "12345678",
                    role: "USER"
                }).set({Accept: 'application/json', 'Content-type': 'application/json'})
                    .then(response => {
                        expect(response.status).toEqual(409);
                    });
            });
        });
    });

    describe("POST Login Method", () => {
        describe("Given login data is valid", () => {
            it("should return a 200 and a jwt token", async () => {
                const responsePayload = {
                    _id: "66326642b6e5d026db70f695",
                    name: "Test",
                    username: "TestTesty",
                    email: "test@test.com",
                    password: "$2a$10$Xu39yMLoJEH/2bEkNRUFseMaICGmGMbTjJzlJttvEfW9cjjI.yOuW",
                    role: "USER"
                };
                const createUserMock = jest.spyOn(User, "findOne")
                    .mockResolvedValueOnce(responsePayload);

                await supertest(app).post(`/api/login/`).send({
                    username: "TestTesty",
                    password: "12345678"
                }).set({'Content-type': 'application/json'})
                    .then(response => {
                        expect(response.status).toEqual(200);
                        expect(response.body).toMatch(new RegExp(/^Bearer .*$/));
                    });
            });
        });

        describe("Given login data is invalid", () => {
            it("should return a 401", async () => {
                const responsePayload = {
                    _id: "66326642b6e5d026db70f695",
                    name: "Test",
                    username: "TestTesty",
                    email: "test@test.com",
                    password: "notASaltedPassword",
                    role: "USER"
                };
                const createUserMock = jest.spyOn(User, "findOne")
                    .mockResolvedValueOnce(responsePayload);

                await supertest(app).post(`/api/login/`).send({
                    username: "TestTesty",
                    password: "12345678"
                }).set({'Content-type': 'application/json'})
                    .then(response => {
                        expect(response.status).toEqual(401);
                    });
            });
        });
    });

    describe("PUT Follow Method", () => {
        describe("Given user is not followed", () => {
            describe("Given user is logged", () => {
                describe("Given user to follow exists", () => {
                    it("should return a 200 and the logged user following the user to follow", async () => {
                        const userID = '66326642b6e5d026db70f695';
                        const userLoggedPayload = {
                            _id: userPayload.id,
                            name: "Test",
                            username: "TestTesty",
                            email: "test@test.com",
                            password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                            role: "USER",
                        };

                        const followingPayload = {
                            _id: userPayload.id,
                            name: "Test",
                            username: "TestTesty",
                            email: "test@test.com",
                            password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                            role: "USER",
                            followedUsers: [userID]
                        }
                        const userMock = jest.spyOn(User, "findById")
                            .mockResolvedValueOnce(userLoggedPayload);
                        const followMock = jest.spyOn(User, "findOneAndUpdate")
                            .mockResolvedValueOnce(followingPayload);
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/users/follow`).send({
                                id: userID
                            }).set({"Authorization": token, 'Content-type': 'application/json'})
                                .then(response => {
                                    expect(response.status).toEqual(200);
                                    expect(response.body).toMatchObject(expect.objectContaining(followingPayload));
                                    expect(response.body.followedUsers.length).toBeGreaterThan(0);
                                    expect(response.body.followedUsers).toContainEqual(userID);
                                });
                        });
                    });
                });
            });

            describe("Given user is not logged", () => {
                it("should return a 401 unauthorized", async () => {
                    const toFollowID = '66326642b6e5d026db70f695';
                    const invalidToken = "Bearer none"
                    await supertest(app).put(`/api/users/follow`).send({
                        id: toFollowID
                    }).set({"Authorization": invalidToken, 'Content-type': 'application/json'})
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
                        const userID = '66326642b6e5d026db70f695';
                        const userLoggedPayload = {
                            _id: userPayload.id,
                            name: "Test",
                            username: "TestTesty",
                            email: "test@test.com",
                            password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                            role: "USER",
                        };

                        const userMock = jest.spyOn(User, "findById")
                            .mockResolvedValueOnce(userLoggedPayload);
                        const followMock = jest.spyOn(User, "findOneAndUpdate")
                            .mockResolvedValueOnce(null);
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/users/follow`).send({
                                id: userID
                            }).set({"Authorization": token, 'Content-type': 'application/json'})
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
                        const userID = '66326642b6e5d026db70f695';
                        const userLoggedPayload = {
                            _id: userPayload.id,
                            name: "Test",
                            username: "TestTesty",
                            email: "test@test.com",
                            password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                            role: "USER",
                            followedUsers: [userID]
                        };

                        const unfollowingPayload = {
                            _id: userPayload.id,
                            name: "Test",
                            username: "TestTesty",
                            email: "test@test.com",
                            password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                            role: "USER",
                            followedUsers: []
                        }
                        const userMock = jest.spyOn(User, "findById")
                            .mockResolvedValueOnce(userLoggedPayload);
                        const followMock = jest.spyOn(User, "findOneAndUpdate")
                            .mockResolvedValueOnce(unfollowingPayload);
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/users/unfollow`).send({
                                id: userID
                            }).set({"Authorization": token, 'Content-type': 'application/json'})
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
                    const userID = '66326642b6e5d026db70f695';
                    const invalidToken = "Bearer none"
                    await supertest(app).put(`/api/users/unfollow`).send({
                        id: userID
                    }).set({"Authorization": invalidToken, 'Content-type': 'application/json'})
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
                        const userID = '66326642b6e5d026db70f695';
                        const userLoggedPayload = {
                            _id: userPayload.id,
                            name: "Test",
                            username: "TestTesty",
                            email: "test@test.com",
                            password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                            role: "USER",
                        };

                        const userMock = jest.spyOn(User, "findById")
                            .mockResolvedValueOnce(userLoggedPayload);
                        const user2Mock = jest.spyOn(User, "findOneAndUpdate")
                            .mockResolvedValueOnce(null);
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/users/unfollow`).send({
                                id: userID
                            }).set({"Authorization": token, 'Content-type': 'application/json'})
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