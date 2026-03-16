import { afterAll, aroundEach, beforeAll, expect, test } from "vitest";
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

test("CreateRoute works correctly", async () => {
  await module.createCurriculum({
    userId: TestModule.TEST_USER_ID,
    id: "original-curriculum-id",
    title: "Original Curriculum",
  });

  const response = await module.fastifyInstance.inject({
    method: "POST",
    url: "/curriculums/:id/duplicate".replace(":id", "original-curriculum-id"),
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({
    data: {
      id: expect.any(String),
      type: "curriculums",
      attributes: {
        userId: TestModule.TEST_USER_ID,
        title: "Original Curriculum (copy)",
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
      },
    },
  });
});

test("CreateRoute returns 404 if original curriculum not found", async () => {
  const response = await module.fastifyInstance.inject({
    method: "POST",
    url: "/curriculums/:id/duplicate".replace(":id", "nonexistent-curriculum-id"),
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
  });

  expect(response.statusCode).toBe(404);
  expect(response.json()).toEqual({
    errors: [
      {
        status: "404",
        title: "Not Found",
        code: "CURRICULUM_NOT_FOUND",
        detail: 'A curriculum with id "nonexistent-curriculum-id" was not found',
      },
    ],
  });
});
