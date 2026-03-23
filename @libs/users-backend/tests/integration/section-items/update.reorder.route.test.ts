import { afterAll, aroundEach, beforeAll, expect, test } from "vitest";
import { TestModule } from "#tests/utils/setup-module.js";
import { SectionItemsEntity } from "#src/index.ts";

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

test("UpdateReorderSectionsRoute returns 204 and updates items order", async () => {
  await module.createCurriculum({
    id: TestModule.TEST_CURRICULUM_ID,
    userId: TestModule.TEST_USER_ID,
    title: "Test Curriculum",
  });

  await module.createSectionTemplate({
    id: TestModule.TEST_SECTION_TEMPLATE_ID,
    label: "Test Template",
    jsonSchema: [
      { key: "field1", type: "string" },
      { key: "field2", type: "string" },
    ],
  });

  await module.createSection({
    id: TestModule.TEST_SECTION_ID,
    curriculumId: TestModule.TEST_CURRICULUM_ID,
    templateId: TestModule.TEST_SECTION_TEMPLATE_ID,
    title: "Test Section",
  });

  await module.createSectionItem({
    id: "test-section-item-id",
    sectionId: TestModule.TEST_SECTION_ID,
    content: { field1: "value1", field2: "value2" },
  });

  await module.createSectionItem({
    id: "test-section-item-id-2",
    sectionId: TestModule.TEST_SECTION_ID,
    content: { field1: "value3", field2: "value4" },
  });

  const response = await module.fastifyInstance.inject({
    method: "PATCH",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}/items/reorder`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        attributes: {
          order: ["test-section-item-id-2", "test-section-item-id"],
        },
      },
    },
  });

  expect(response.statusCode).toBe(204);
  const items = await module.em.find(
    SectionItemsEntity,
    { section: TestModule.TEST_SECTION_ID },
    { orderBy: { position: "asc" } },
  );
  expect(items).toHaveLength(2);
  expect(items[0]!.id).toBe("test-section-item-id-2");
  expect(items[1]!.id).toBe("test-section-item-id");
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
    url: `/curriculums/nonexistent-curriculum-id/sections/${TestModule.TEST_SECTION_ID}/items/reorder`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        attributes: {
          order: ["test-section-id-2", "test-section-id-3", "test-section-id"],
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
    code: "SECTION_NOT_FOUND",
    detail: `No section found with id ${TestModule.TEST_SECTION_ID} in curriculum nonexistent-curriculum-id belonging to user with id ${TestModule.TEST_USER_ID}`,
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
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}/items/reorder`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        attributes: {
          order: ["test-section-id-2", "test-section-id-3", "test-section-id"],
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
    code: "SECTION_NOT_FOUND",
    detail: `No section found with id ${TestModule.TEST_SECTION_ID} in curriculum ${TestModule.TEST_CURRICULUM_ID} belonging to user with id ${TestModule.TEST_USER_ID}`,
  });
});

test("UpdateReorderSectionsRoute returns 400 if number of items in order does not match number of items in section", async () => {
  await module.createCurriculum({
    id: TestModule.TEST_CURRICULUM_ID,
    userId: TestModule.TEST_USER_ID,
    title: "Test Curriculum",
  });

  await module.createSectionTemplate({
    id: TestModule.TEST_SECTION_TEMPLATE_ID,
    label: "Test Template",
    jsonSchema: [
      { key: "field1", type: "string" },
      { key: "field2", type: "string" },
    ],
  });

  await module.createSection({
    id: TestModule.TEST_SECTION_ID,
    curriculumId: TestModule.TEST_CURRICULUM_ID,
    templateId: TestModule.TEST_SECTION_TEMPLATE_ID,
    title: "Test Section",
  });

  const response = await module.fastifyInstance.inject({
    method: "PATCH",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}/items/reorder`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        attributes: {
          order: ["test-section-id-2", "test-section-id-3"],
        },
      },
    },
  });

  expect(response.statusCode).toBe(400);
  const body = response.json();
  expect(body).toHaveProperty("errors");
  expect(body.errors[0]).toMatchObject({
    status: "400",
    title: "Bad Request",
    code: "INVALID_ORDER",
    detail: "Order must contain exactly 0 item ids, got 2",
  });
});

test("UpdateReorderSectionsRoute returns 400 if a item id is invalid", async () => {
  await module.createCurriculum({
    id: TestModule.TEST_CURRICULUM_ID,
    userId: TestModule.TEST_USER_ID,
    title: "Test Curriculum",
  });

  await module.createSectionTemplate({
    id: TestModule.TEST_SECTION_TEMPLATE_ID,
    label: "Test Template",
    jsonSchema: [
      { key: "field1", type: "string" },
      { key: "field2", type: "string" },
    ],
  });

  await module.createSection({
    id: TestModule.TEST_SECTION_ID,
    curriculumId: TestModule.TEST_CURRICULUM_ID,
    templateId: TestModule.TEST_SECTION_TEMPLATE_ID,
    title: "Test Section",
  });

  await module.createSectionItem({
    id: TestModule.TEST_SECTION_ITEM_ID,
    sectionId: TestModule.TEST_SECTION_ID,
    content: { field1: "value1", field2: "value2" },
  });

  await module.createSectionItem({
    id: "test-section-id-2",
    sectionId: TestModule.TEST_SECTION_ID,
    content: { field1: "value3", field2: "value4" },
  });

  const response = await module.fastifyInstance.inject({
    method: "PATCH",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}/items/reorder`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        attributes: {
          order: [TestModule.TEST_SECTION_ITEM_ID, "invalid-section-id"],
        },
      },
    },
  });

  expect(response.statusCode).toBe(400);
  const body = response.json();
  expect(body).toHaveProperty("errors");
  expect(body.errors[0]).toMatchObject({
    status: "400",
    title: "Bad Request",
    code: "INVALID_ITEM_ID",
    detail: `Item with id invalid-section-id does not belong to section ${TestModule.TEST_SECTION_ID} in curriculum ${TestModule.TEST_CURRICULUM_ID}`,
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
