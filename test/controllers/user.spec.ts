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
const partialCreationPayload = {
    name: "Test",
    surname: "Test",
    username: "TestTesty",
    email: "test@test.com",
    role: "USER"
}
const creationPayload = {
    ...partialCreationPayload,
    password: "$2a$10$Xu39yMLoJEH/2bEkNRUFseMaICGmGMbTjJzlJttvEfW9cjjI.yOuW"
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
                    jest.spyOn(User, "findById").mockResolvedValueOnce(null);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/${id}`)
                            .set({"Authorization": token}).then(response => {
                                expect(response.status).toEqual(404);
                            });
                    });
                });
            });

            describe("Given Internal error occurs", () => {
                it("should return a 500", async () => {
                    jest.spyOn(User, "findById").mockRejectedValueOnce(new Error());
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/${responsePayload._id}`)
                            .set({"Authorization": token}).then(response => {
                                expect(response.status).toEqual(500);
                            });
                    });
                });
            });

            describe("Given valid user ID", () => {
                it("should return a 200 and the user", async () => {
                    jest.spyOn(User, "findById").mockResolvedValueOnce(responsePayload);
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

    describe("GET Users filtered", () => {
        describe("Given Internal Server Error", () => {
            describe("While getting followers", () => {
                it("should return a 500", async () => {
                    jest.spyOn(User, 'find').mockRejectedValueOnce(new Error());
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/filter?follower=true`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(500);
                            });
                    });
                });
            });

            describe("While getting followed", () => {
                it("should return a 500", async () => {
                    jest.spyOn(User, 'find').mockResolvedValueOnce([responsePayload]);
                    jest.spyOn(User, "aggregate").mockRejectedValueOnce(new Error());
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/filter?followed=true`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(500);
                            });
                    });
                });
            });
        });

        describe("Given follower = true, followed = false", () => {
            describe("Given no result found", () => {
                it("should return a 204", async () => {
                    jest.spyOn(User, 'find').mockResolvedValueOnce([]);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/filter?follower=true&username=hola`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(204);
                            });
                    });
                });
            });

            describe("Given results found", () => {
                it("should return a 200 and the users", async () => {
                    jest.spyOn(User, 'find').mockResolvedValueOnce([responsePayload]);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/filter?follower=true&username=T`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(200);
                                expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(responsePayload)]));
                            });
                    });
                });
            });
        });

        describe("Given follower = false, followed = true", () => {
            describe("Given no result found", () => {
                it("should return a 204", async () => {
                    jest.spyOn(User, 'find').mockResolvedValueOnce([responsePayload]);
                    jest.spyOn(User, "aggregate").mockResolvedValueOnce([{...responsePayload, followedUsers: []}]);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/filter?followed=true&username=T`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(204);
                            });
                    });
                });
            });

            describe("Given results found", () => {
                it("should return a 200 and the users", async () => {
                    jest.spyOn(User, 'find').mockResolvedValueOnce([responsePayload]);
                    jest.spyOn(User, "aggregate").mockResolvedValueOnce([{...responsePayload, followedUsers: [responsePayload]}]);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/filter?followed=true&username=T`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(200);
                                expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(responsePayload)]));
                            });
                    });
                });
            });
        });

        describe("Given follower = true, followed = true", () => {
            describe("Given no result found", () => {
                it("should return a 204", async () => {
                    let responsePayloadEdited = {...responsePayload};
                    responsePayloadEdited._id = userPayload.id;
                    jest.spyOn(User, 'find').mockResolvedValueOnce([responsePayloadEdited]);
                    jest.spyOn(User, "aggregate").mockResolvedValueOnce([{...responsePayloadEdited, followedUsers: [responsePayload]}]);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/filter?followed=true&follower=true&username=T`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(204);
                            });
                    });
                });
            });

            describe("Given results found", () => {
                it("should return a 200 and the users", async () => {
                    jest.spyOn(User, 'find').mockResolvedValueOnce([responsePayload]);
                    jest.spyOn(User, "aggregate").mockResolvedValueOnce([{...responsePayload, followedUsers: [responsePayload]}]);
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/filter?followed=true&follower=true&username=T`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(200);
                                expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(responsePayload)]));
                            });
                    });
                });
            });
        });
    });

    describe("GET Users Followed Method", () => {
        describe("User logged", () => {
            describe("Given user ID provided and users followed", () => {
                it("should return a 200 and the users", async () => {
                    jest.spyOn(User, 'findById').mockImplementation(() => ({
                        populate: () => ({
                            exec: jest.fn().mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                                resolve([responsePayload]);
                            }))
                        })
                    } as any));
                    await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/followed/${userPayload.id}`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(200);
                                expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(responsePayload)]));
                            });
                    });
                });
            });

            describe("Given no users followed", () => {
                it("should return a 204", async () => {
                    jest.spyOn(User, 'findById').mockImplementation(() => ({
                        populate: () => ({
                            exec: jest.fn().mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                                resolve([]);
                            }))
                        })
                    } as any));
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
                    jest.spyOn(User, "find").mockResolvedValueOnce([responsePayload]);
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
                    jest.spyOn(User, "find").mockResolvedValueOnce([]);
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
                jest.spyOn(User, "create")
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
                            surname: "Test",
                            username: "TestTesty",
                            email: "test@test.com",
                            password: expect.stringMatching(/^[$]2a[$]10[$].*$/),
                            role: "USER"
                        }));
                    });
            });
        });

        describe("Given user data is missing password", () => {
            it("should return a 400", async () => {
                await supertest(app).post(`/api/users/`).send(partialCreationPayload)
                    .set({Accept: 'application/json', 'Content-type': 'application/json'})
                    .then(response => {
                        expect(response.status).toEqual(400);
                    });
            });
        });

        describe("Given user data is duplicated", () => {
            it("should return a 409", async () => {
                jest.spyOn(User, "create").mockRejectedValueOnce({code: 11000});
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
            describe("Given password is not to be updated", () => {
                it("should return a 200 and the updated object", async () => {
                    jest.spyOn(User, "findByIdAndUpdate").mockResolvedValueOnce(responsePayload);
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

            describe("Given password is to be updated", () => {
                it("should return a 200 and the updated object", async () => {
                    jest.spyOn(User, "findByIdAndUpdate").mockResolvedValueOnce(responsePayload)
                        .mockResolvedValueOnce(responsePayload);
                    jest.spyOn(User, "findById").mockResolvedValueOnce(responsePayload);
                    await middleware.generateToken(responsePayload._id, responsePayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/users/`).send({passwords: {new: "123456789", old: "12345678"}})
                            .set({"Authorization": token, Accept: 'application/json', 'Content-type': 'application/json'})
                            .then(response => {
                                expect(response.status).toEqual(200);
                                expect(response.body).toMatchObject(expect.objectContaining(responsePayload));
                            });
                    });
                });
            });
        });
        describe("Given user data is not valid", () => {
            describe("Given user data is duplicated", () => {
                it("should return a 409", async () => {
                    jest.spyOn(User, "findByIdAndUpdate").mockRejectedValueOnce({code: 11000});
                    await middleware.generateToken(responsePayload._id, responsePayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/users/`).send({username: creationPayload.username})
                            .set({"Authorization": token, Accept: 'application/json', 'Content-type': 'application/json'})
                            .then(response => {
                                expect(response.status).toEqual(409);
                            });
                    });
                });
            });

            describe("Given user data is missing old password", () => {
                it("should return a 400", async () => {
                    await middleware.generateToken(responsePayload._id, responsePayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/users/`).send({passwords: {new: "12345678"}})
                            .set({"Authorization": token, Accept: 'application/json', 'Content-type': 'application/json'})
                            .then(response => {
                                expect(response.status).toEqual(400);
                            });
                    });
                });
            });

            describe("Given user data is missing new password", () => {
                it("should return a 400", async () => {
                    await middleware.generateToken(responsePayload._id, responsePayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/users/`).send({passwords: {old: "12345678"}})
                            .set({"Authorization": token, Accept: 'application/json', 'Content-type': 'application/json'})
                            .then(response => {
                                expect(response.status).toEqual(400);
                            });
                    });
                });
            });

            describe("Given old password is incorrect", () => {
                it("should return a 400", async () => {
                    jest.spyOn(User, "findById").mockResolvedValueOnce(responsePayload);
                    await middleware.generateToken(responsePayload._id, responsePayload.role).then(async (token: any) => {
                        await supertest(app).put(`/api/users/`).send({passwords: {old: "not correct", new: "12334444334"}})
                            .set({"Authorization": token, Accept: 'application/json', 'Content-type': 'application/json'})
                            .then(response => {
                                expect(response.status).toEqual(400);
                            });
                    });
                });
            });
        });
    });

    describe("POST Login Method", () => {
        describe("Given login data is valid", () => {
            it("should return a 200 and a jwt token", async () => {
                jest.spyOn(User, "findOne").mockResolvedValueOnce(responsePayload);
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

        describe("Given Internal error occurs", () => {
            it("should return a 500", async () => {
                jest.spyOn(User, "findOne").mockRejectedValueOnce(new Error());
                await supertest(app).post(`/api/login/`).send({
                    username: responsePayload.username,
                    password: "12345678"
                }).set({'Content-type': 'application/json'})
                    .then(response => {
                        expect(response.status).toEqual(500);
                    });
            });
        });

        describe("Given login data is invalid", () => {
            describe("Given username does not exist", () => {
                it("should return a 401", async () => {
                    jest.spyOn(User, "findOne").mockResolvedValueOnce(null);
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
                    jest.spyOn(User, "findOne").mockResolvedValueOnce(responsePayload);
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
        describe("Given Internal error occurs", () => {
            it("should return a 500", async () => {
                jest.spyOn(User, "findOneAndUpdate").mockRejectedValueOnce(new Error());
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/users/${responsePayload._id}/follow`)
                        .set({"Authorization": token, 'Content-type': 'application/json'})
                        .then(response => {
                            expect(response.status).toEqual(500);
                        });
                });
            });
        });

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
                        jest.spyOn(User, "findById").mockResolvedValueOnce(userLoggedPayload);
                        jest.spyOn(User, "findOneAndUpdate").mockResolvedValueOnce(followingPayload);
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/users/${responsePayload._id}/follow`)
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
                    await supertest(app).put(`/api/users/${responsePayload._id}/follow`)
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

                        jest.spyOn(User, "findById").mockResolvedValueOnce(userLoggedPayload);
                        jest.spyOn(User, "findOneAndUpdate").mockResolvedValueOnce(null);
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/users/${responsePayload._id}/follow`)
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
        describe("Given Internal error occurs", () => {
            it("should return a 500", async () => {
                jest.spyOn(User, "findOneAndUpdate").mockRejectedValueOnce(new Error());
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).put(`/api/users/${responsePayload._id}/unfollow`)
                        .set({"Authorization": token, 'Content-type': 'application/json'})
                        .then(response => {
                            expect(response.status).toEqual(500);
                        });
                });
            });
        });

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
                        jest.spyOn(User, "findById").mockResolvedValueOnce(userLoggedPayload);
                        jest.spyOn(User, "findOneAndUpdate").mockResolvedValueOnce(unfollowingPayload);
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/users/${responsePayload._id}/unfollow`)
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
                    await supertest(app).put(`/api/users/${responsePayload._id}/unfollow`)
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

                        jest.spyOn(User, "findById").mockResolvedValueOnce(userLoggedPayload);
                        jest.spyOn(User, "findOneAndUpdate").mockResolvedValueOnce(null);
                        await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/users/${responsePayload._id}/unfollow`)
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