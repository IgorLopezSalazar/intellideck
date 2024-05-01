import supertest from "supertest";
import {expect, describe, it, jest} from '@jest/globals';
import {app} from "../../src/app.ts";
import {User} from "../../src/models/user.ts";

jest.useFakeTimers();

describe("User", () => {
    describe("GET Method", () => {
        describe("Given user not existing", () => {
            it("should return a 404", async () => {
                const userID = 'none';
                await supertest(app).get(`/api/users/${userID}`).then(response => {
                    expect(response.status).toEqual(404);
                });
            });
        });

        describe("Given valid user ID", () => {
            it("should return a 200 and the user", async () => {
                const userID = '66326642b6e5d026db70f695';
                const responsePayload = {
                    _id: userID,
                    name: "Test",
                    username: "TestTesty",
                    email: "test@test.com",
                    password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                    role: "USER"};
                const createUserMock = jest.spyOn(User, "findById")
                    .mockResolvedValueOnce(responsePayload);
                await supertest(app).get(`/api/users/${userID}`).then(response => {
                    expect(response.status).toEqual(200);
                    expect(response.body).toMatchObject(expect.objectContaining(responsePayload));
                });
            });
        });
    })

    describe("GET Collection Method", () => {
        describe("Given users exist", () => {
            it("should return a 200 and the users", async () => {
                const userID = '66326642b6e5d026db70f695';
                const responsePayload = {
                    _id: userID,
                    name: "Test",
                    username: "TestTesty",
                    email: "test@test.com",
                    password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                    role: "USER"};
                const createUserMock = jest.spyOn(User, "find")
                    .mockResolvedValueOnce([responsePayload]);
                await supertest(app).get(`/api/users/`).then(response => {
                    expect(response.status).toEqual(200);
                    expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(responsePayload)]));
                });
            });
        });
    })

    describe("POST Method", () => {
        describe("Given user data is valid", () => {
            it("should return a 201 and the created object", async () => {
                const responsePayload = {
                    _id: "66326642b6e5d026db70f695",
                    name: "Test",
                    username: "TestTesty",
                    email: "test@test.com",
                    password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                    role: "USER"};
                const createUserMock = jest.spyOn(User, "create")
                    .mockReturnValueOnce(new Promise<any>((resolve:any, reject: any) => {
                        resolve(responsePayload);
                    }));

                await supertest(app).post(`/api/users/`).send({
                    name: "Test",
                    username: "TestTesty",
                    email: "test@test.com",
                    password: "12345678",
                    role: "USER"})
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
        })
    })
})