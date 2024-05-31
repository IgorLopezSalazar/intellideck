import supertest from "supertest";
import {expect, describe, it} from '@jest/globals';
import {app} from "../../src/app.ts";
import {Middleware} from "../../src/middleware.ts";

const middleware = new Middleware();

const userPayload = {
    id: "663bd4577abace2f8505108e",
    role: "USER"
}

describe("Image", () => {
    describe("POST Image", () => {
        describe("Given no image sent", () => {
            it("should return a 400", async () => {
                await middleware.generateToken(userPayload.id, userPayload.role).then(async (token: any) => {
                    await supertest(app).post(`/api/images`)
                        .set({Accept: 'application/json', 'Content-type': 'application/json', "Authorization": token})
                        .then(response => {
                            expect(response.status).toEqual(400);
                        });
                });
            });
        });
    });
});