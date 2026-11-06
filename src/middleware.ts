import { defineMiddleware } from "astro:middleware";
import { Liquid } from "liquidjs";

const samples = import.meta.glob<{ default: Record<string, unknown> }>(
  "@templates/invoices/samples/*.json",
  {
    eager: true,
  },
);

const sampleData = ({ sample }: { sample: string | null }) => {
  const { $schema: _, ...data } = (
    samples[`/src/templates/invoices/samples/${sample ?? "open"}.json`] ??
    samples["/src/templates/invoices/samples/open.json"]
  ).default;
  return data;
};

const liquid = new Liquid({
  outputDelimiterLeft: "[[",
  outputDelimiterRight: "]]",
  tagDelimiterLeft: "[%",
  tagDelimiterRight: "%]",
  outputEscape: "escape",
  strictVariables: true,
  lenientIf: true,
  templates: {},
});

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  if (!import.meta.env.DEV) {
    return response;
  }

  const sample = context.url.searchParams.get("sample");

  // TODO: create a map of samples data per routes once we support more templates type
  const html = await liquid.parseAndRender(await response.text(), sampleData({ sample }));

  return new Response(html, response);
});
