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

test("UpdateRoute returns 200 and updates a item", async () => {
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
      { key: "field2", label: "Field 2", type: "string" },
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
    content: {
      field1: "value1",
      field2: "value2",
    },
  });

  const response = await module.fastifyInstance.inject({
    method: "PATCH",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}/items/${TestModule.TEST_SECTION_ITEM_ID}`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        attributes: {
          field1: "updated value",
          field2: "value2",
        },
      },
    },
  });

  expect(response.statusCode).toBe(200);
  const body = response.json();
  expect(body).toHaveProperty("data");
  expect(body.data).toMatchObject({
    id: TestModule.TEST_SECTION_ITEM_ID,
    type: "section-items",
    attributes: {
      position: 0,
    },
  });

  const item = await module.em.findOneOrFail(
    SectionsEntity,
    { id: TestModule.TEST_SECTION_ID },
    { populate: ["items"] },
  );
  const updatedItem = item.items.getItems().find((i) => i.id === TestModule.TEST_SECTION_ITEM_ID);
  expect(updatedItem).toBeDefined();
  expect(updatedItem!.jsonData).toMatchObject({
    field1: "updated value",
    field2: "value2",
  });
});

test("UpdateRoute returns 404 if curriculum not found", async () => {
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
      { key: "field2", label: "Field 2", type: "string" },
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
    content: {
      field1: "value1",
      field2: "value2",
    },
  });

  const response = await module.fastifyInstance.inject({
    method: "PATCH",
    url: `/curriculums/nonexistent-curriculum-id/sections/${TestModule.TEST_SECTION_ID}/items/${TestModule.TEST_SECTION_ITEM_ID}`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        attributes: {
          field1: "updated value",
          field2: "value2",
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
    code: "SECTION_ITEM_NOT_FOUND",
    detail: `No item found with id ${TestModule.TEST_SECTION_ITEM_ID} for section with id ${TestModule.TEST_SECTION_ID} for curriculum with id nonexistent-curriculum-id belonging to user with id ${TestModule.TEST_USER_ID}`,
  });
});

test("UpdateRoute returns 404 if curriculum does not belong to user", async () => {
  await module.createCurriculum({
    id: TestModule.TEST_CURRICULUM_ID,
    userId: "other-user-id",
    title: "Test Curriculum",
  });

  await module.createSectionTemplate({
    id: TestModule.TEST_SECTION_TEMPLATE_ID,
    label: "Test Template",
    jsonSchema: [
      { key: "field1", label: "Field 1", type: "string" },
      { key: "field2", label: "Field 2", type: "string" },
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
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}/items/${TestModule.TEST_SECTION_ITEM_ID}`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        attributes: {
          title: "Updated Test Section",
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
    code: "SECTION_ITEM_NOT_FOUND",
    detail: `No item found with id ${TestModule.TEST_SECTION_ITEM_ID} for section with id ${TestModule.TEST_SECTION_ID} for curriculum with id ${TestModule.TEST_CURRICULUM_ID} belonging to user with id ${TestModule.TEST_USER_ID}`,
  });
});

test("UpdateRoute returns 404 if section not found", async () => {
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
      { key: "field2", label: "Field 2", type: "string" },
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
    content: {
      field1: "value1",
      field2: "value2",
    },
  });

  const response = await module.fastifyInstance.inject({
    method: "PATCH",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/nonexistent-section-id/items/${TestModule.TEST_SECTION_ITEM_ID}`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        attributes: {
          title: "Updated Test Section",
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
    code: "SECTION_ITEM_NOT_FOUND",
    detail: `No item found with id ${TestModule.TEST_SECTION_ITEM_ID} for section with id nonexistent-section-id for curriculum with id ${TestModule.TEST_CURRICULUM_ID} belonging to user with id ${TestModule.TEST_USER_ID}`,
  });
});

test("UpdateRoute returns 404 if item not found", async () => {
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
      { key: "field2", label: "Field 2", type: "string" },
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
    content: {
      field1: "value1",
      field2: "value2",
    },
  });

  const response = await module.fastifyInstance.inject({
    method: "PATCH",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}/items/nonexistent-item-id`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        attributes: {
          field1: "updated value",
          field2: "value2",
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
    detail: `No item found with id nonexistent-item-id for section with id ${TestModule.TEST_SECTION_ID} for curriculum with id ${TestModule.TEST_CURRICULUM_ID} belonging to user with id ${TestModule.TEST_USER_ID}`,
  });
});

test("UpdateRoute returns 422 if unknown fields are provided", async () => {
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
      { key: "field2", label: "Field 2", type: "string" },
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
    content: {
      field1: "value1",
      field2: "value2",
    },
  });

  const response = await module.fastifyInstance.inject({
    method: "PATCH",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}/items/${TestModule.TEST_SECTION_ITEM_ID}`,
    headers: {
      authorization: module.generateBearerToken(TestModule.TEST_USER_ID),
    },
    payload: {
      data: {
        attributes: {
          field1: "updated value",
          unknownField: "some value",
        },
      },
    },
  });

  expect(response.statusCode).toBe(422);
  const body = response.json();
  expect(body).toHaveProperty("errors");
  expect(body.errors[0]).toMatchObject({
    status: "422",
    title: "Unprocessable Entity",
    code: "INVALID_JSON_DATA",
    detail: "Unknown fields: unknownField",
  });
});

test("UpdateRoute returns 401 when not authenticated", async () => {
  const response = await module.fastifyInstance.inject({
    method: "PATCH",
    url: `/curriculums/${TestModule.TEST_CURRICULUM_ID}/sections/${TestModule.TEST_SECTION_ID}/items/${TestModule.TEST_SECTION_ITEM_ID}`,
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
