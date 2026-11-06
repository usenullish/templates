import { expect, test } from "@playwright/test";
import { TemplatePage } from "./_page";

(["light", "dark"] as const).forEach((mode) => {
  test.describe(`${mode} mode`, () => {
    test.use({ colorScheme: mode });

    (["en", "de", "fr", "it"] as const).forEach((lang) => {
      test(`match screenshot ${lang}`, async ({ page }) => {
        const home = new TemplatePage({ page });

        await page.goto(`/${lang}/invoices?sample=open`);

        await expect(page.getByText("hello@example.com")).toBeVisible();

        await home.assertScreenshot({ name: `invoice-${lang}-${mode}` });
      });
    });
  });
});
