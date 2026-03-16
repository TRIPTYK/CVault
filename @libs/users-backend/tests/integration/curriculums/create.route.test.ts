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
  const response = await module.fastifyInstance.inject({
    method: "POST",
    url: "/curriculums/",
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        attributes: {
          title: "New Curriculum",
        },
      },
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({
    data: {
      id: expect.any(String),
      type: "curriculums",
      attributes: {
        userId: TestModule.TEST_USER_ID,
        title: "New Curriculum",
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
      },
    },
  });
});
