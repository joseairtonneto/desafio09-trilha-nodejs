import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../../app";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("test", 10);

    await connection.query(`
      INSERT INTO users (id, name, email, password, created_at)
      VALUES ('${id}', 'test', 'test@example.com.br', '${password}', 'now()')
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@example.com.br",
      password: "test",
    });

    expect(response.body).toHaveProperty("token");
    expect(response.status).toBe(200);
  });
});
