# nullish templates

This project is used by nullish users to design their own document templates. You help a user change how their documents look or read. Read `README.md` first: it explains the project from the user's side.

A template is one self-contained HTML file per language. nullish fills it with LiquidJS and prints it to PDF with Chromium.

In nullish, users manage templates per organization under Settings > Document Templates. A template has a type (e.g. invoice) and a name, and one document per language, whose content is the built file `templates/<type>/<lang>.html`.

`npm run build` builds `dist/<lang>/<type>/index.html`, then the `copy-templates` integration in `astro.plugin.ts` copies each one to `templates/<type>/<lang>.html`.

## Where to work

Each template type has its own folder in `src/templates/<type>/`, with its layout, texts, schema and samples. Invoices are the current example:

- `src/templates/invoices/Invoice.astro`: the invoice layout. Most changes happen here.
- `src/templates/invoices/i18n.json`: the texts. Every key has `en`, `fr`, `de` and `it`.
- `src/templates/invoices/schema.json`: the data the template receives.
- `src/templates/invoices/samples/*.json`: sample data for the preview (`open.json`, `draft.json`). They must stay valid against `schema.json`.
- `src/styles/page.css`: Tailwind for the templates, and the text sizes.
- `src/components/templates/`: the page (`Page.astro`), the HTML document (`Template.astro`) and the QR-bill page (`QrBill.astro`). Change them only when the request needs it.

Don't change the preview app (`src/pages/index.astro`, `src/components/app/`, `src/middleware.ts`, `src/styles/global.css`) or `astro.config.ts` and `astro.plugin.ts` unless the user asks for it.

## Rules for templates

### Data

- The data is under `nullish`. Its content depends on the template type. The type's `schema.json` (e.g. `src/templates/invoices/schema.json`) is the reference: use only fields that exist there, with their exact names.
- Values are already formatted strings (dates, amounts with currency). Don't format them again.
- Fields that can be `null` or absent must be wrapped in `[% if %]`. Check `schema.json`: anything not in `required`, or typed with `null`, is optional. Put separators (`, `, `·`, `<br />`) inside the `if` of the value they belong to, so no empty line or dangling separator is left.

### Syntax

- LiquidJS with custom delimiters: `[[ value ]]` for output, `[% tag %]` for tags, e.g. `[% if %]…[% endif %]`, `[% for line in nullish.lines %]…[% endfor %]`, comparisons like `line.type == "discount"`.
- Never write `{{ }}` or `{% %}`: Astro reads `{` as an expression.
- Output is HTML-escaped. Use `| raw` only for trusted HTML, i.e. `nullish.qrBill`.
- Don't write `[[` or `[%` anywhere else, including Tailwind arbitrary variants like `[[data-x]_&]:`. Use `data-[…]:` or `aria-[…]:` variants instead.
- Translated texts are Astro expressions: `{t("key")}`, with the key in `i18n.json`. Follow the user's preference: edit `i18n.json`, or write texts directly in the layout. When nothing is said, keep using `{t("key")}`, since it keeps the four languages working.

### Layout

- Style with Tailwind classes or raw CSS. One spacing unit is 1 mm of the A4 page (`pt-15` = 15 mm). Use the text sizes from `page.css` (`text-fine`, `text-small`, `text-body`, `text-large`, `text-heading`, `text-title`), not fixed `pt` or `px` values.
- In raw CSS, write sizes with the same unit, in millimeters: `padding-top: calc(var(--spacing) * 15)` for 15 mm, `font-size: calc(var(--spacing) * 3.175)` for 9 pt (1 pt = 0.3528 mm). The text-size classes have no CSS variable to reuse. Plain `15mm` or `9pt` is right in the PDF but doesn't scale in the preview.
- Keep the recipient address in the envelope window (`absolute top-50 right-15 w-77`) unless the user asks to move it.
- The QR-bill page is added by `Template.astro`. Don't place it in `Invoice.astro`.
- The built HTML must be self-contained: inline images as SVG or `data:` URIs. Never reference `/public` files or external URLs: external resources are blocked when the PDF is rendered.
- Fonts: only the fonts on the nullish server are available, so a font that isn't embedded falls back to another one in the PDF. To use a custom font, embed it as a `data:` URI in a `@font-face`.

## Checking your work

1. Run `npm run build`. It must pass.
2. Check that `dist/<lang>/invoices/index.html` still contains the Liquid placeholders, and that the CSS is inlined in a `<style>` tag (no `<link>`).
3. Render each built template with both samples, using the same settings as the preview, and check that nothing throws:

   ```js
   import { Liquid } from "liquidjs";
   import fs from "node:fs";

   const liquid = new Liquid({
     outputDelimiterLeft: "[[",
     outputDelimiterRight: "]]",
     tagDelimiterLeft: "[%",
     tagDelimiterRight: "%]",
     outputEscape: "escape",
     strictVariables: true,
     lenientIf: true,
   });

   for (const lang of ["en", "fr", "de", "it"]) {
     const html = fs.readFileSync(`dist/${lang}/invoices/index.html`, "utf8");
     for (const sample of ["open", "draft"]) {
       const { $schema, ...data } = JSON.parse(
         fs.readFileSync(`src/templates/invoices/samples/${sample}.json`, "utf8"),
       );
       await liquid.parseAndRender(html, data);
     }
   }
   ```

   If you changed how optional fields are handled, also render with fields set to `null`.

4. Tell the user to check the result in the preview (`npm run dev`), since layout can only be judged visually.

## Working with the user

- Do what is asked, and keep changes small and in the existing style.
- Ask before structural changes: renaming or moving files, new dependencies, changes to the preview app or the Astro config.
- When the user asks "why", explain. Change code only when asked.

## References

- LiquidJS: https://liquidjs.com
- Tailwind CSS: https://tailwindcss.com/docs
- Astro components: https://docs.astro.build/en/basics/astro-components/
