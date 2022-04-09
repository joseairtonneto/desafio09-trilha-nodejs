import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../../app";

let connection: Connection;

describe("Create Statement Controller", () => {
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

  it("should be able to make a deposit", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@example.com.br",
      password: "test",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "deposit",
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.body).toHaveProperty("id");
    expect(response.status).toBe(201);
  });

  it("should be able to make a withdraw", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@example.com.br",
      password: "test",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "withdraw",
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.body).toHaveProperty("id");
    expect(response.status).toBe(201);
  });
});
