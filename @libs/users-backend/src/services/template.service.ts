import * as Handlebars from "handlebars";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import type { SectionEntityType } from "#src/entities/sections.entity.ts";

export const SectionItemSchema = z.object({
  jsonData: z.record(z.string(), z.string()),
});

export const SectionSchema = z.object({
  templateId: z.string(),
  title: z.string(),
  position: z.number(),
  items: z.array(SectionItemSchema),
});

export const SectionsSchema = z.array(SectionSchema);

const TEMPLATE_BASE_URL = "/templates/";

const SIDEBAR_TEMPLATE_IDS = new Set([
  "e2e-section-template-informations-personnelles",
  "e2e-section-template-compétences",
  "e2e-section-template-langues",
]);

async function fetchTemplate(pathUrl: string): Promise<string | null> {
  const filePath = path.join(process.cwd(), "src", pathUrl);

  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

function templateIdToFilename(templateId: string): string {
  const filename = templateId.replace(/^e2e-section-template-/, "");
  return filename;
}

async function renderSection(section: SectionEntityType, modelId: string): Promise<string> {
  const {
    template: { id: templateId },
    title,
    items,
  } = section;

  const filename = templateIdToFilename(templateId);
  const templatePath = `${TEMPLATE_BASE_URL}${modelId}/sections/${filename}.html`;
  const templateSource = await fetchTemplate(templatePath);

  if (!templateSource) return "";

  const compiledTemplate = Handlebars.compile(templateSource);

  if (templateId === "e2e-section-template-informations-personnelles") {
    const item = items[0] as { jsonData: Record<string, string> } | undefined;
    if (!item) return "";

    const pdpPath = item.jsonData["profilePicture"];
    let resolvedProfilePicture = pdpPath;

    if (pdpPath) {
      try {
        const pdpBuffer = await fs.readFile(pdpPath);
        resolvedProfilePicture = `data:image/png;base64,${pdpBuffer.toString("base64")}`;
      } catch {
        resolvedProfilePicture = "";
      }
    }

    const jsonData = { ...item.jsonData, profilePicture: resolvedProfilePicture };
    return compiledTemplate({
      title,
      item: jsonData,
      items: [jsonData],
    });
  }

  const context =
    items.length === 1
      ? { title, item: items[0]?.jsonData, items: items.map((i) => i.jsonData) }
      : { title, items: items.map((i) => i.jsonData) };

  return compiledTemplate(context);
}

export default async function renderCv(
  sections: SectionEntityType[],
  modelId: string,
): Promise<string> {
  const sorted = [...sections].sort((a, b) => a.position - b.position);

  const leftSections: { html: string }[] = [];
  const rightSections: { html: string }[] = [];

  for (const section of sorted) {
    if (!section.isActive) continue;
    const html = await renderSection(section, modelId);

    if (!html) continue;

    if (SIDEBAR_TEMPLATE_IDS.has(section.template.id)) {
      leftSections.push({ html });
    } else {
      rightSections.push({ html });
    }
  }

  const [baseSource, styles] = await Promise.all([
    fetchTemplate(`${TEMPLATE_BASE_URL}${modelId}/base.html`),
    fetchTemplate(`${TEMPLATE_BASE_URL}${modelId}/style.css`),
  ]);

  if (!baseSource || !styles) {
    return "";
  }

  const compiled = Handlebars.compile(baseSource);

  return compiled({
    leftSections,
    rightSections,
    styles,
  });
}
