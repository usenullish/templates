import type { AstroIntegration } from "astro";
import { cp, glob, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const copyTemplates = (): AstroIntegration => {
  let output: string;

  return {
    name: "copy-templates",
    hooks: {
      "astro:config:done": ({ config }) => {
        output = fileURLToPath(new URL("templates/", config.root));
      },
      "astro:build:done": async ({ dir }) => {
        const dist = fileURLToPath(dir);

        await rm(output, { recursive: true, force: true });
        await mkdir(output, { recursive: true });

        for await (const file of glob("*/*/index.html", { cwd: dist })) {
          const [lang, type] = file.split("/");

          await cp(join(dist, file), join(output, type, `${lang}.html`));
        }
      },
    },
  };
};
