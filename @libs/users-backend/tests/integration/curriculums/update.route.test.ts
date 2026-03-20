import { afterAll, aroundEach, beforeAll, expect as hardExpect } from "vitest";
import { test } from "vitest";
import { TestModule } from "#tests/utils/setup-module.js";

const expect = hardExpect.soft;

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

test("UpdateRoute updates curriculum and returns JSON:API format", async () => {
  await module.createCurriculum({
    id: "curriculum-id",
    userId: TestModule.TEST_USER_ID,
    title: "Existing Curriculum",
  });

  const response = await module.fastifyInstance.inject({
    method: "PATCH",
    url: `/curriculums/curriculum-id`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        id: "curriculum-id",
        type: "curriculums",
        attributes: {
          title: "Updated Curriculum",
        },
      },
    },
  });

  expect(response.statusCode).toBe(200);
  const body = response.json();
  expect(body).toHaveProperty("data");
  expect(body.data).toMatchObject({
    type: "curriculums",
    id: "curriculum-id",
    attributes: {
      title: "Updated Curriculum",
    },
  });
});

test("UpdateRoute returns JSON:API error when curriculum not found", async () => {
  const response = await module.fastifyInstance.inject({
    method: "PATCH",
    url: "/curriculums/nonexistent-id",
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        attributes: {
          title: "Updated Curriculum",
        },
      },
    },
  });

  expect(response.statusCode).toBe(404);
  const body = response.json();
  expect(body).toHaveProperty("errors");
  expect(body.errors[0]).toMatchObject({
    status: "404",
    title: "Not Found",
    code: "CURRICULUM_NOT_FOUND",
    detail: "Curriculum with id nonexistent-id not found",
  });
});
