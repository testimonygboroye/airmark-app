import request from "supertest";
import { BASE_URL } from "./setup";

const uniqueEmail = () => `airmark.test.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@gmail.com`;

describe("Auth — registration", () => {
  it("rejects a weak password", async () => {
    const res = await request(BASE_URL).post("/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: uniqueEmail(),
      password: "weak",
      confirmPassword: "weak",
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects mismatched passwords", async () => {
    const res = await request(BASE_URL).post("/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: uniqueEmail(),
      password: "TestPass123!",
      confirmPassword: "Different123!",
    });
    expect(res.status).toBe(400);
  });

  it("rejects a name containing numbers or symbols", async () => {
    const res = await request(BASE_URL).post("/auth/register").send({
      firstName: "Test1",
      lastName: "User",
      email: uniqueEmail(),
      password: "TestPass123!",
      confirmPassword: "TestPass123!",
    });
    expect(res.status).toBe(400);
  });

  it("accepts a valid registration and returns 201", async () => {
    const res = await request(BASE_URL).post("/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: uniqueEmail(),
      password: "TestPass123!",
      confirmPassword: "TestPass123!",
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.userId).toBeDefined();
  });

  it("rejects registering the same email twice", async () => {
    const email = uniqueEmail();
    const payload = {
      firstName: "Test",
      lastName: "User",
      email,
      password: "TestPass123!",
      confirmPassword: "TestPass123!",
    };
    await request(BASE_URL).post("/auth/register").send(payload);
    const res = await request(BASE_URL).post("/auth/register").send(payload);
    expect(res.status).toBe(409);
  });
});

describe("Auth — login", () => {
  it("rejects login with an unregistered email", async () => {
    const res = await request(BASE_URL).post("/auth/login").send({
      email: uniqueEmail(),
      password: "SomePassword123!",
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects login with a wrong password for a real account", async () => {
    const res = await request(BASE_URL).post("/auth/login").send({
      email: "testimonygboroye.dev@gmail.com",
      password: "DefinitelyWrongPassword123!",
    });
    expect(res.status).toBe(401);
  });
});

describe("Auth — protected routes", () => {
  it("rejects /auth/me with no token", async () => {
    const res = await request(BASE_URL).get("/auth/me");
    expect(res.status).toBe(401);
  });

  it("rejects /auth/me with a malformed token", async () => {
    const res = await request(BASE_URL).get("/auth/me").set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });
});
