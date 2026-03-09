import { afterAll, aroundEach, beforeAll, expect } from "vitest";
import { test } from "vitest";
import { TestModule } from "#tests/utils/setup-module.js";

let module: TestModule;

beforeAll(async () => {
  module = await TestModule.init();
});

afterAll(async () => {
  await module.close();
});

aroundEach(async (runTest) => {
  await module.em.begin();
  await runTest();
  await module.em.rollback();
});

test("ListRoute returns curriculums in JSON:API format", async () => {
  await module.createCurriculum({
    id: "curriculum-id",
    userId: TestModule.TEST_USER_ID,
    title: "Existing Curriculum",
  });

  const response = await module.fastifyInstance.inject({
    method: "GET",
    url: "/curriculums",
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
  });

  expect(response.statusCode).toBe(200);
  const body = response.json();
  expect(body).toHaveProperty("data");
  expect(Array.isArray(body.data)).toBe(true);
  expect(body.data[0]).toMatchObject({
    type: "curriculums",
    id: "curriculum-id",
    attributes: {
      title: "Existing Curriculum",
      updatedAt: expect.any(String),
    },
  });
});

test("ListRoute returns 404 when no curriculums found", async () => {
  const response = await module.fastifyInstance.inject({
    method: "GET",
    url: "/curriculums",
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
  });

  expect(response.statusCode).toBe(404);
  const body = response.json();
  expect(body).toHaveProperty("errors");
  expect(Array.isArray(body.errors)).toBe(true);
  expect(body.errors[0]).toMatchObject({
    status: "404",
    title: "Not Found",
    code: "CURRICULUMS_NOT_FOUND",
    detail: "No curriculums found for user with id " + TestModule.TEST_USER_ID,
  });
});
