import puppeteer, { Browser } from "puppeteer";

export class PdfService {
  private browser: Browser | null = null;

  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
      });
    }

    return this.browser;
  }

  public async renderHtmlToPdf(html: string): Promise<Buffer> {
    const browser = await this.getBrowser();

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await page.close();

    return Buffer.from(pdf);
  }
}

export default new PdfService();
