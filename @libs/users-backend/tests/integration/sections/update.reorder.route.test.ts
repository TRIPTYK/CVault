import { afterAll, aroundEach, beforeAll, expect, test } from "vitest";
import { TestModule } from "#tests/utils/setup-module.js";
import { SectionsEntity } from "#src/entities/sections.entity.ts";

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

test("UpdateReorderSectionsRoute returns 200 and updates section order", async () => {
  await module.createCurriculum({
    id: TestModule.TEST_CURRICULUM_ID,
    userId: TestModule.TEST_USER_ID,
    title: "Test Curriculum",
  });

  await module.createSectionTemplate({
    id: TestModule.TEST_SECTION_TEMPLATE_ID,
    label: "Test Template",
  });

  await module.createSection({
    id: "test-section-id",
    curriculumId: TestModule.TEST_CURRICULUM_ID,
    templateId: TestModule.TEST_SECTION_TEMPLATE_ID,
    title: "Test Section",
  });
  await module.createSection({
    id: "test-section-id-2",
    curriculumId: TestModule.TEST_CURRICULUM_ID,
    templateId: TestModule.TEST_SECTION_TEMPLATE_ID,
    title: "Test Section 2",
  });
  await module.createSection({
    id: "test-section-id-3",
    curriculumId: TestModule.TEST_CURRICULUM_ID,
    templateId: TestModule.TEST_SECTION_TEMPLATE_ID,
    title: "Test Section 3",
  });

  const response = await module.fastifyInstance.inject({
    method: "PATCH",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/reorder`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      order: ["test-section-id-2", "test-section-id-3", "test-section-id"],
    },
  });

  expect(response.statusCode).toBe(204);

  const sections = await module.em.find(
    SectionsEntity,
    { curriculum: TestModule.TEST_CURRICULUM_ID },
    { orderBy: { position: "asc" } },
  );
  expect(sections).toHaveLength(3);
  expect(sections[0]!.id).toBe("test-section-id-2");
  expect(sections[1]!.id).toBe("test-section-id-3");
  expect(sections[2]!.id).toBe("test-section-id");
});

test("UpdateReorderSectionsRoute returns 404 if curriculum not found", async () => {
  await module.createCurriculum({
    id: TestModule.TEST_CURRICULUM_ID,
    userId: TestModule.TEST_USER_ID,
    title: "Test Curriculum",
  });

  await module.createSectionTemplate({
    id: TestModule.TEST_SECTION_TEMPLATE_ID,
    label: "Test Template",
  });

  await module.createSection({
    id: "test-section-id",
    curriculumId: TestModule.TEST_CURRICULUM_ID,
    templateId: TestModule.TEST_SECTION_TEMPLATE_ID,
    title: "Test Section",
  });

  const response = await module.fastifyInstance.inject({
    method: "PATCH",
    url: `/curriculums/nonexistent-curriculum-id/sections/reorder`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      order: ["test-section-id-2", "test-section-id-3", "test-section-id"],
    },
  });

  expect(response.statusCode).toBe(404);
  const body = response.json();
  expect(body).toHaveProperty("errors");
  expect(body.errors[0]).toMatchObject({
    status: "404",
    title: "Not Found",
    code: "CURRICULUM_NOT_FOUND",
    detail: `No curriculum found with id nonexistent-curriculum-id belonging to user with id ${TestModule.TEST_USER_ID}`,
  });
});

test("UpdateReorderSectionsRoute returns 404 if curriculum does not belong to user", async () => {
  await module.createCurriculum({
    id: TestModule.TEST_CURRICULUM_ID,
    userId: "other-user-id",
    title: "Test Curriculum",
  });

  const response = await module.fastifyInstance.inject({
    method: "PATCH",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/reorder`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      order: ["test-section-id-2", "test-section-id-3", "test-section-id"],
    },
  });

  expect(response.statusCode).toBe(404);
  const body = response.json();
  expect(body).toHaveProperty("errors");
  expect(body.errors[0]).toMatchObject({
    status: "404",
    title: "Not Found",
    code: "CURRICULUM_NOT_FOUND",
    detail: `No curriculum found with id ${TestModule.TEST_CURRICULUM_ID} belonging to user with id ${TestModule.TEST_USER_ID}`,
  });
});

test("UpdateReorderSectionsRoute returns 400 if number of sections in order does not match number of sections in curriculum", async () => {
  await module.createCurriculum({
    id: TestModule.TEST_CURRICULUM_ID,
    userId: TestModule.TEST_USER_ID,
    title: "Test Curriculum",
  });

  await module.createSectionTemplate({
    id: TestModule.TEST_SECTION_TEMPLATE_ID,
    label: "Test Template",
  });

  const response = await module.fastifyInstance.inject({
    method: "PATCH",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/reorder`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      order: ["test-section-id-2", "test-section-id-3"],
    },
  });

  expect(response.statusCode).toBe(400);
  const body = response.json();
  expect(body).toHaveProperty("errors");
  expect(body.errors[0]).toMatchObject({
    status: "400",
    title: "Bad Request",
    code: "INVALID_ORDER",
    detail: "Order must contain exactly 0 section ids, got 2",
  });
});

test("UpdateReorderSectionsRoute returns 400 if a section id is invalid", async () => {
  await module.createCurriculum({
    id: TestModule.TEST_CURRICULUM_ID,
    userId: TestModule.TEST_USER_ID,
    title: "Test Curriculum",
  });

  await module.createSectionTemplate({
    id: TestModule.TEST_SECTION_TEMPLATE_ID,
    label: "Test Template",
  });

  await module.createSection({
    id: "test-section-id",
    curriculumId: TestModule.TEST_CURRICULUM_ID,
    templateId: TestModule.TEST_SECTION_TEMPLATE_ID,
    title: "Test Section",
  });

  await module.createSection({
    id: "test-section-id-2",
    curriculumId: TestModule.TEST_CURRICULUM_ID,
    templateId: TestModule.TEST_SECTION_TEMPLATE_ID,
    title: "Test Section 2",
  });

  const response = await module.fastifyInstance.inject({
    method: "PATCH",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      order: ["test-section-id", "invalid-section-id"],
    },
  });

  expect(response.statusCode).toBe(400);
  const body = response.json();
  expect(body).toHaveProperty("errors");
  expect(body.errors[0]).toMatchObject({
    status: "400",
    title: "Validation Error",
    detail: "Invalid input: expected string, received undefined",
  });
});

test("UpdateRoute returns 401 when not authenticated", async () => {
  const response = await module.fastifyInstance.inject({
    method: "PATCH",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}`,
    payload: {
      title: "Updated Test Section",
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
