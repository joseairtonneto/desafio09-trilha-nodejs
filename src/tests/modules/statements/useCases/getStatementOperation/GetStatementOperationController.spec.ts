import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../../app";

let connection: Connection;

describe("Get Statement Operation Controller", () => {
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

  it("should be able to get the statement of a user", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "test@example.com.br",
      password: "test",
    });

    const { token } = responseToken.body;

    const statement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "deposit",
      })
      .set({ Authorization: `Bearer ${token}` });

    const response = await request(app)
      .get(`/api/v1/statements/${statement.body.id}`)
      .set({ Authorization: `Bearer ${token}` });

    expect(response.body).toEqual({
      id: statement.body.id,
      user_id: statement.body.user_id,
      description: "deposit",
      amount: "100.00",
      type: "deposit",
      created_at: statement.body.created_at,
      updated_at: statement.body.updated_at,
    });
  });
});
