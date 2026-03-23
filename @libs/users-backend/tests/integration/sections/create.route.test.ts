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
  });

  const title = "New Section";

  const response = await module.fastifyInstance.inject({
    method: "POST",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        attributes: {
          templateId: TestModule.TEST_SECTION_TEMPLATE_ID,
          title: title,
        },
      },
    },
  });

  expect(response.statusCode).toBe(201);
  const body = response.json();
  expect(body).toEqual({
    data: {
      type: "sections",
      id: expect.any(String),
      attributes: {
        curriculumId: TestModule.TEST_CURRICULUM_ID,
        templateId: TestModule.TEST_SECTION_TEMPLATE_ID,
        title: title,
        position: 0,
      },
    },
  });
});

test("CreateRoute returns 404 if curriculum not found", async () => {
  const response = await module.fastifyInstance.inject({
    method: "POST",
    url: `/curriculums/nonexistent-curriculum-id/sections`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        attributes: {
          templateId: TestModule.TEST_SECTION_TEMPLATE_ID,
          title: "New Section",
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
    detail: `No curriculum found with id nonexistent-curriculum-id`,
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
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        attributes: {
          templateId: TestModule.TEST_SECTION_TEMPLATE_ID,
          title: "New Section",
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
    detail: `No curriculum found with id ${TestModule.TEST_CURRICULUM_ID}`,
  });
});

test("CreateRoute returns 404 if template not found", async () => {
  await module.createCurriculum({
    id: TestModule.TEST_CURRICULUM_ID,
    userId: TestModule.TEST_USER_ID,
    title: "Test Curriculum",
  });

  const response = await module.fastifyInstance.inject({
    method: "POST",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        attributes: {
          templateId: "nonexistent-template-id",
          title: "New Section",
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
    code: "SECTION_TEMPLATE_NOT_FOUND",
    detail: `No section template found with id nonexistent-template-id`,
  });
});

test("CreateRoute returns 401 when not authenticated", async () => {
  const response = await module.fastifyInstance.inject({
    method: "POST",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections`,
    payload: {
      data: {
        attributes: {
          templateId: TestModule.TEST_SECTION_TEMPLATE_ID,
          title: "New Section",
        },
      },
    },
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

test("CreateRoute returns 400 when title is missing", async () => {
  const response = await module.fastifyInstance.inject({
    method: "POST",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        attributes: {
          templateId: TestModule.TEST_SECTION_TEMPLATE_ID,
        },
      },
    },
  });

  expect(response.statusCode).toBe(400);
  const body = response.json();
  expect(body).toHaveProperty("errors");
  expect(body.errors[0]).toMatchObject({
    status: "400",
    title: "Validation Error",
    detail: expect.any(String),
    source: {
      pointer: "//data/attributes/title",
    },
  });
});

test("CreateRoute returns 400 when templateId is missing", async () => {
  const response = await module.fastifyInstance.inject({
    method: "POST",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        attributes: {
          title: "New Section",
        },
      },
    },
  });

  expect(response.statusCode).toBe(400);
  const body = response.json();
  expect(body).toHaveProperty("errors");
  expect(body.errors[0]).toMatchObject({
    status: "400",
    title: "Validation Error",
    detail: expect.any(String),
    source: {
      pointer: "//data/attributes/templateId",
    },
  });
});
