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

test("DeleteRoute returns 204 and deletes a item", async () => {
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
    id: "test-section-id",
    curriculumId: TestModule.TEST_CURRICULUM_ID,
    templateId: TestModule.TEST_SECTION_TEMPLATE_ID,
    title: "Test Section",
  });

  await module.createSectionItem({
    id: TestModule.TEST_SECTION_ITEM_ID,
    sectionId: "test-section-id",
    content: { field1: "value1", field2: 42 },
  });

  const response = await module.fastifyInstance.inject({
    method: "DELETE",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}/items/${TestModule.TEST_SECTION_ITEM_ID}`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
  });

  expect(response.statusCode).toBe(204);

  const deletedItem = await module.em.findOne(SectionsEntity, {
    id: TestModule.TEST_SECTION_ITEM_ID,
  });
  expect(deletedItem).toBeNull();
});

test("DeleteRoute returns 404 if curriculum not found", async () => {
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
    id: "test-section-id",
    curriculumId: TestModule.TEST_CURRICULUM_ID,
    templateId: TestModule.TEST_SECTION_TEMPLATE_ID,
    title: "Test Section",
  });

  const response = await module.fastifyInstance.inject({
    method: "DELETE",
    url: `/curriculums/nonexistent-curriculum-id/sections/${TestModule.TEST_SECTION_ID}/items/${TestModule.TEST_SECTION_ITEM_ID}`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
  });

  expect(response.statusCode).toBe(404);
  const body = response.json();
  expect(body).toHaveProperty("errors");
  expect(body.errors[0]).toMatchObject({
    status: "404",
    title: "Not Found",
    code: "SECTION_ITEM_NOT_FOUND",
    detail: `No item found with id ${TestModule.TEST_SECTION_ITEM_ID} in section ${TestModule.TEST_SECTION_ID} for curriculum nonexistent-curriculum-id for user ${TestModule.TEST_USER_ID}`,
  });
});

test("DeleteRoute returns 404 if curriculum does not belong to user", async () => {
  await module.createCurriculum({
    id: TestModule.TEST_CURRICULUM_ID,
    userId: "other-user-id",
    title: "Test Curriculum",
  });

  const response = await module.fastifyInstance.inject({
    method: "DELETE",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}/items/${TestModule.TEST_SECTION_ITEM_ID}`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
  });

  expect(response.statusCode).toBe(404);
  const body = response.json();
  expect(body).toHaveProperty("errors");
  expect(body.errors[0]).toMatchObject({
    status: "404",
    title: "Not Found",
    code: "SECTION_ITEM_NOT_FOUND",
    detail: `No item found with id ${TestModule.TEST_SECTION_ITEM_ID} in section ${TestModule.TEST_SECTION_ID} for curriculum ${TestModule.TEST_CURRICULUM_ID} for user ${TestModule.TEST_USER_ID}`,
  });
});

test("DeleteRoute returns 404 if section not found", async () => {
  await module.createCurriculum({
    id: TestModule.TEST_CURRICULUM_ID,
    userId: TestModule.TEST_USER_ID,
    title: "Test Curriculum",
  });

  const response = await module.fastifyInstance.inject({
    method: "DELETE",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}/items/${TestModule.TEST_SECTION_ITEM_ID}`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
  });

  expect(response.statusCode).toBe(404);
  const body = response.json();
  expect(body).toHaveProperty("errors");
  expect(body.errors[0]).toMatchObject({
    status: "404",
    title: "Not Found",
    code: "SECTION_ITEM_NOT_FOUND",
    detail: `No item found with id ${TestModule.TEST_SECTION_ITEM_ID} in section ${TestModule.TEST_SECTION_ID} for curriculum ${TestModule.TEST_CURRICULUM_ID} for user ${TestModule.TEST_USER_ID}`,
  });
});

test("DeleteRoute returns 404 if item not found", async () => {
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
    id: "test-section-id",
    curriculumId: TestModule.TEST_CURRICULUM_ID,
    templateId: TestModule.TEST_SECTION_TEMPLATE_ID,
    title: "Test Section",
  });

  const response = await module.fastifyInstance.inject({
    method: "DELETE",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}/items/nonexistent-item-id`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
  });

  expect(response.statusCode).toBe(404);
  const body = response.json();
  expect(body).toHaveProperty("errors");
  expect(body.errors[0]).toMatchObject({
    status: "404",
    title: "Not Found",
    code: "SECTION_ITEM_NOT_FOUND",
    detail: `No item found with id nonexistent-item-id in section ${TestModule.TEST_SECTION_ID} for curriculum ${TestModule.TEST_CURRICULUM_ID} for user ${TestModule.TEST_USER_ID}`,
  });
});

test("DeleteRoute returns 401 when not authenticated", async () => {
  const response = await module.fastifyInstance.inject({
    method: "DELETE",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}/items/${TestModule.TEST_SECTION_ITEM_ID}`,
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
