import request from "supertest";
import { BASE_URL } from "./setup";

describe("System health", () => {
  it("GET /system/health returns ok", async () => {
    const res = await request(BASE_URL).get("/system/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe("ok");
  });
});
