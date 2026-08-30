import request from "supertest";
import { BASE_URL } from "./setup";

describe("Permission enforcement", () => {
  it("rejects creating an event with no auth token", async () => {
    const res = await request(BASE_URL).post("/events").send({
      teamId: "000000000000000000000000",
      title: "Unauthorized Test Event",
      scheduledStart: new Date().toISOString(),
      cameraCount: 2,
    });
    expect(res.status).toBe(401);
  });

  it("rejects OBS control with no auth token", async () => {
    const res = await request(BASE_URL)
      .post("/events/000000000000000000000000/obs/scene")
      .send({ teamId: "000000000000000000000000", sceneName: "Main" });
    expect(res.status).toBe(401);
  });

  it("rejects the admin panel with no auth token", async () => {
    const res = await request(BASE_URL).get("/admin/stats");
    expect(res.status).toBe(401);
  });
});
