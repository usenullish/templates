import { expect, type Page } from "@playwright/test";

export interface TemplatePageParams {
  page: Page;
}

export class TemplatePage {
  readonly #page: Page;

  constructor({ page }: TemplatePageParams) {
    this.#page = page;
  }

  get page(): Page {
    return this.#page;
  }

  async assertScreenshot({ name }: { name: string }) {
    await expect(this.#page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
    });
  }
}
