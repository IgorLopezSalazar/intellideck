import supertest from "supertest";
import {expect, describe, it, beforeEach, afterEach} from '@jest/globals';
import {app} from "../../src/app.ts";

describe("User", () => {
    describe("GET Method", () => {
        describe("Given user not existing", () => {
            it("should return a 404", async () => {
                const userID = 'none';
                await supertest(app).get(`/api/users/${userID}`).then(response => {
                    expect(response.status).toEqual(404);
                });
            });
        })
    })
})