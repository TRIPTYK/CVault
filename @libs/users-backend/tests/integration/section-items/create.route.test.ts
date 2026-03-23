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

test("CreateRoute returns 201 and create a section", async () => {
  await module.createCurriculum({
    id: TestModule.TEST_CURRICULUM_ID,
    userId: TestModule.TEST_USER_ID,
    title: "Test Curriculum",
  });

  await module.createSectionTemplate({
    id: TestModule.TEST_SECTION_TEMPLATE_ID,
    label: "Test Template",
    jsonSchema: [
      { key: "field1", label: "Field 1", type: "string" },
      { key: "field2", label: "Field 2", type: "number" },
    ],
  });

  await module.createSection({
    id: TestModule.TEST_SECTION_ID,
    curriculumId: TestModule.TEST_CURRICULUM_ID,
    templateId: TestModule.TEST_SECTION_TEMPLATE_ID,
    title: "Test Section",
  });

  const response = await module.fastifyInstance.inject({
    method: "POST",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}/items/`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {},
  });

  expect(response.statusCode).toBe(201);
  const body = response.json();
  expect(body).toHaveProperty("data");
  expect(body.data).toMatchObject({
    id: expect.any(String),
    type: "section-items",
    attributes: {
      position: 0,
      sectionId: TestModule.TEST_SECTION_ID,
      jsonData: {
        field1: "",
        field2: "",
      },
    },
  });
});

test("CreateRoute returns 404 if curriculum not found", async () => {
  const response = await module.fastifyInstance.inject({
    method: "POST",
    url: `/curriculums/nonexistent-curriculum-id/sections/${TestModule.TEST_SECTION_ID}/items/`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {},
  });

  expect(response.statusCode).toBe(404);
  const body = response.json();
  expect(body).toHaveProperty("errors");
  expect(body.errors[0]).toMatchObject({
    status: "404",
    title: "Not Found",
    code: "SECTION_NOT_FOUND",
    detail: `No section found with id ${TestModule.TEST_SECTION_ID} for curriculum nonexistent-curriculum-id belonging to user ${TestModule.TEST_USER_ID}`,
  });
});

test("CreateRoute returns 404 if curriculum does not belong to user", async () => {
  await module.createCurriculum({
    id: TestModule.TEST_CURRICULUM_ID,
    userId: "other-user-id",
    title: "Test Curriculum",
  });

  const response = await module.fastifyInstance.inject({
    method: "POST",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}/items/`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {},
  });

  expect(response.statusCode).toBe(404);
  const body = response.json();
  expect(body).toHaveProperty("errors");
  expect(body.errors[0]).toMatchObject({
    status: "404",
    title: "Not Found",
    code: "SECTION_NOT_FOUND",
    detail: `No section found with id ${TestModule.TEST_SECTION_ID} for curriculum ${TestModule.TEST_CURRICULUM_ID} belonging to user ${TestModule.TEST_USER_ID}`,
  });
});

test("CreateRoute returns 404 if section not found", async () => {
  await module.createCurriculum({
    id: TestModule.TEST_CURRICULUM_ID,
    userId: TestModule.TEST_USER_ID,
    title: "Test Curriculum",
  });

  const response = await module.fastifyInstance.inject({
    method: "POST",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}/items/`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {},
  });

  expect(response.statusCode).toBe(404);
  const body = response.json();
  expect(body).toHaveProperty("errors");
  expect(body.errors[0]).toMatchObject({
    status: "404",
    title: "Not Found",
    code: "SECTION_NOT_FOUND",
    detail: `No section found with id ${TestModule.TEST_SECTION_ID} for curriculum ${TestModule.TEST_CURRICULUM_ID} belonging to user ${TestModule.TEST_USER_ID}`,
  });
});

test("CreateRoute returns 401 when not authenticated", async () => {
  const response = await module.fastifyInstance.inject({
    method: "POST",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}/items/`,
    payload: {},
  });

  expect(response.statusCode).toBe(401);
  const body = response.json();
  expect(body).toHaveProperty("errors");
  expect(body.errors[0]).toMatchObject({
    status: "401",
    title: "Unauthorized",
    code: "UNAUTHORIZED",
    detail: "Missing or invalid authorization header",
  });
});
