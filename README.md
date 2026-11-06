# nullish templates

Design your own document templates for [nullish](https://nullish.so).

A template is a single HTML file. nullish fills it with the data of a document and prints it to PDF.

## Getting started

> [!TIP]
> To keep your updated templates in your own GitHub repository, [fork it](https://github.com/usenullish/templates/fork) first.

1. Clone the repository and install the dependencies:

```sh
git clone https://github.com/usenullish/templates.git
cd templates
npm install
```

2. Start the preview:

```sh
npm run dev
```

3. Open [http://localhost:4321](http://localhost:4321).

## What to edit

Each template has its own folder in `src/templates/`. For invoices, it's `src/templates/invoices/`, and you'll mostly work in two files:

- `Invoice.astro` is the layout: what appears on the page, and where.
- `i18n.json` holds the texts, in English, French, German and Italian.

Open `Invoice.astro` with the preview next to it, change something and save: the preview updates right away.

## Writing a template

### Data

When nullish prints a PDF, it fills the template with the document's data. In the template, that data sits under the namespace `nullish`.

What `nullish` contains depends on the kind of document. An invoice comes with a client, for example, while another kind of document may not.

Each kind of document has a schema that defines its fields and describes each of them.

> [!TIP]
> The sample data files link to their schema, so your editor can autocomplete the fields and flag mistakes.

#### Invoice

Schema: [`src/templates/invoices/schema.json`](src/templates/invoices/schema.json).

| Field                               | Type                                               | Can be empty | Description                                                                                     |
| ----------------------------------- | -------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------- |
| `nullish.organization.name`         | text                                               | no           | Name of your organization                                                                       |
| `nullish.organization.careOf`       | text                                               | yes          | Care of, e.g. Jane Doe                                                                          |
| `nullish.organization.address`      | text                                               | yes          | Street and number, e.g. Sihlquai 131                                                            |
| `nullish.organization.postalCode`   | text                                               | yes          | Postal code, e.g. 8005                                                                          |
| `nullish.organization.city`         | text                                               | yes          | City, e.g. Zürich                                                                               |
| `nullish.organization.country.code` | text                                               | yes          | Country code, e.g. CH                                                                           |
| `nullish.organization.country.name` | text                                               | yes          | Country name, in the language of the document                                                   |
| `nullish.organization.email`        | text                                               | yes          | Email address                                                                                   |
| `nullish.organization.phone`        | text                                               | yes          | Phone number, e.g. +41791234567                                                                 |
| `nullish.organization.website`      | text                                               | yes          | Website address                                                                                 |
| `nullish.organization.iban`         | text                                               | yes          | IBAN of the bank account chosen for the invoice                                                 |
| `nullish.client.name`               | text                                               | no           | Name of the client                                                                              |
| `nullish.client.careOf`             | text                                               | yes          | Care of, e.g. Jane Doe                                                                          |
| `nullish.client.address`            | text                                               | yes          | Street and number                                                                               |
| `nullish.client.postalCode`         | text                                               | yes          | Postal code                                                                                     |
| `nullish.client.city`               | text                                               | yes          | City                                                                                            |
| `nullish.client.country.code`       | text                                               | yes          | Country code, e.g. CH                                                                           |
| `nullish.client.country.name`       | text                                               | yes          | Country name, in the language of the document                                                   |
| `nullish.invoice.number`            | text                                               | yes          | Invoice number, empty for a draft                                                               |
| `nullish.invoice.status`            | `draft`, `open`, `paid`, `uncollectible` or `void` | no           | Status of the invoice                                                                           |
| `nullish.invoice.issueOn`           | date                                               | no           | Issue date                                                                                      |
| `nullish.invoice.dueOn`             | date                                               | yes          | Due date                                                                                        |
| `nullish.invoice.currency`          | text                                               | no           | Currency, e.g. CHF                                                                              |
| `nullish.invoice.subtotal`          | amount                                             | no           | Total of the lines without VAT                                                                  |
| `nullish.invoice.vat`               | amount                                             | yes          | VAT, empty without VAT                                                                          |
| `nullish.invoice.vatRate`           | text                                               | yes          | VAT rate, e.g. 8.1 %, empty without VAT                                                         |
| `nullish.invoice.total`             | amount                                             | no           | Total including VAT                                                                             |
| `nullish.lines`                     | list                                               | no           | The lines of the invoice, each with the four fields below                                       |
| `line.type`                         | `item` or `discount`                               | no           | A regular line or a discount                                                                    |
| `line.description`                  | text                                               | no           | Description of the line                                                                         |
| `line.quantity`                     | number                                             | no           | Quantity                                                                                        |
| `line.unitPrice`                    | amount                                             | no           | Price per unit                                                                                  |
| `nullish.qrBill`                    | SVG                                                | yes          | The Swiss QR-bill, empty for a draft or without a bank account. Added to the PDF automatically. |

All values are already formatted, in the language of the document: dates, amounts with their currency, quantities. Don't format them again.

Fields that can be empty may be missing or `null`. Wrap them in `[% if %]`, see [Syntax](#syntax).

### Syntax

Placeholders in square brackets mark where data goes. They can also show something only when a value is set, or repeat a block for each line.

```liquid
[[ nullish.client.name ]]

[% if nullish.client.careOf %]c/o [[ nullish.client.careOf ]][% endif %]

[% for line in nullish.lines %]
    [[ line.description ]] [[ line.unitPrice ]]
[% endfor %]

[% if line.type == "discount" %]−[% endif %]
```

- `[[ … ]]` prints a value. It is HTML-escaped.
- `[% … %]` is a tag: `if`, `for`, `unless`, comparisons.
- Many fields can be empty (`null`). Wrap them in `[% if %]`, so no empty line or stray separator is left.

> [!TIP]
> Templates are written with [LiquidJS](https://liquidjs.com). Its [documentation](https://liquidjs.com/tutorials/intro-to-liquid.html) lists everything you can use.

### Texts in several languages

Templates support multiple languages by default. Labels come from `i18n.json` and are written as `{t("key")}`:

```html
<h1>{t("title")} [[ nullish.invoice.number ]]</h1>
```

Each key needs all four languages:

```json
"title": { "en": "Invoice", "fr": "Facture", "de": "Rechnung", "it": "Fattura" }
```

You can either edit those labels or, if you prefer, hardcode text directly in the templates. There are no strict rules on that matter.

### Layout and styling

You can style a template with raw CSS or using [Tailwind](https://tailwindcss.com/docs) classes.

Sizes are in millimeters, like on paper. The page is A4 (210 × 297 mm), `pt-15` adds 15 mm of space above an element, and `w-77` makes it 77 mm wide.

For text, use these sizes:

| Class          | Size   |
| -------------- | ------ |
| `text-fine`    | 6.5 pt |
| `text-small`   | 7.5 pt |
| `text-body`    | 9 pt   |
| `text-large`   | 10 pt  |
| `text-heading` | 14 pt  |
| `text-title`   | 16 pt  |

### Images and fonts

The built template **must not** depend on other files: nullish only stores the HTML.

> [!NOTE]
> External resources, such as scripts, images or fonts loaded from a URL, are blocked and ignored when the PDF is rendered.

- Inline images, e.g. your logo, as SVG or as a `data:` URI. Files in `public/` are not available to nullish.
- Fonts: only the fonts on the nullish server are available. To use your own font, embed it as a `data:` URI in a `@font-face`.

## Building

When your template is ready, build the files to upload to nullish:

```sh
npm run build
```

This writes one template per language, grouped by type in `templates/`:

```
templates/invoices/en.html
templates/invoices/fr.html
templates/invoices/de.html
templates/invoices/it.html
```

## Uploading to nullish

Templates are managed per organization in nullish, under **Settings > Document Templates**.

1. Create a template: choose its type (e.g. invoice) and give it a name. You can have several templates of the same type, e.g. one per brand or style.
2. Add a document to it for each language you need. A document is a language and its content. Use the matching built file as content, e.g. `templates/invoices/fr.html` for French.
