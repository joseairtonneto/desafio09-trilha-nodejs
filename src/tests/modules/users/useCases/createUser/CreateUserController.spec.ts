import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../../app";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Test",
      email: "test@example.com.br",
      password: "test",
    });

    expect(response.status).toBe(201);
  });
});
