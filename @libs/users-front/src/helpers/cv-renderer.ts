import * as Handlebars from 'handlebars';
import type { Sections } from '#src/schemas/sections.ts';

const TEMPLATE_BASE_URL = '/templates/template1';
const SIDEBAR_TEMPLATE_IDS = new Set([
  'e2e-section-template-informations-personnelles',
  'e2e-section-template-compétences',
  'e2e-section-template-langues',
]);

const templateCache = new Map<string, string>();

async function fetchTemplate(path: string): Promise<string | null> {
  if (templateCache.has(path)) return templateCache.get(path)!;
  const res = await fetch(path);
  if (!res.ok) return null;
  const text = await res.text();
  templateCache.set(path, text);
  return text;
}

function templateIdToFilename(templateId: string): string {
  return templateId.replace(/^e2e-section-template-/, '');
}

async function renderSection(section: Sections): Promise<string> {
  const { templateId, title, items } = section;
  const filename = templateIdToFilename(templateId);
  const templatePath = `${TEMPLATE_BASE_URL}/sections/${filename}.html`;
  const templateSource = await fetchTemplate(templatePath);

  if (!templateSource) {
    return '';
  }

  const compiledTemplate = Handlebars.compile(templateSource);
  const context =
    items.length === 1
      ? { title, item: items[0]?.jsonData, items: items.map((i) => i.jsonData) }
      : { title, items: items.map((i) => i.jsonData) };

  return compiledTemplate(context);
}

export default async function renderCv(sections: Sections[]): Promise<string> {
  const sorted = [...sections].sort((a, b) => a.position - b.position);

  const leftSections: { html: string }[] = [];
  const rightSections: { html: string }[] = [];

  for (const section of sorted) {
    if (!section.isActive) continue;
    const html = await renderSection(section);
    if (!html) continue;

    if (SIDEBAR_TEMPLATE_IDS.has(section.templateId)) {
      leftSections.push({ html });
    } else {
      rightSections.push({ html });
    }
  }

  const [baseSource, styles] = await Promise.all([
    fetchTemplate(`${TEMPLATE_BASE_URL}/base.html`),
    fetchTemplate(`${TEMPLATE_BASE_URL}/style.css`),
  ]);

  if (!baseSource || !styles) {
    return '';
  }

  return Handlebars.compile(baseSource)({
    leftSections,
    rightSections,
    styles,
  });
}
