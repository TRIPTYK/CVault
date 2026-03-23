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

test("ListRoute returns 200 and section templates", async () => {
  await module.createCurriculum({
    id: "curriculum-id",
    userId: TestModule.TEST_USER_ID,
    title: "Existing Curriculum",
  });

  await module.createSectionTemplate({
    id: TestModule.TEST_SECTION_TEMPLATE_ID,
    label: "Existing Section Template",
  });

  const response = await module.fastifyInstance.inject({
    method: "GET",
    url: "/section-templates",
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
  });

  expect(response.statusCode).toBe(200);
  const body = response.json();
  expect(body).toHaveProperty("data");
  expect(Array.isArray(body.data)).toBe(true);
  expect(body.data[0]).toMatchObject({
    type: "section-templates",
    id: TestModule.TEST_SECTION_TEMPLATE_ID,
    attributes: {
      label: "Existing Section Template",
      jsonSchema: {},
      position: 0,
    },
  });
});

test("ListRoute returns 404 when no section templates found", async () => {
  const response = await module.fastifyInstance.inject({
    method: "GET",
    url: "/section-templates",
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
    code: "SECTION_TEMPLATES_NOT_FOUND",
    detail: "No section templates found",
  });
});

test("ListRoute returns 401 when unauthorized", async () => {
  const response = await module.fastifyInstance.inject({
    method: "GET",
    url: "/section-templates",
  });

  expect(response.statusCode).toBe(401);
});
