import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { copyTemplates } from "./astro.plugin";

const DEV = import.meta.env.DEV;

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  devToolbar: {
    enabled: false,
  },
  build: {
    // The template is stored as a single HTML string, so every stylesheet must be inlined.
    inlineStylesheets: "always",
  },
  i18n: {
    locales: ["de", "fr", "it", "en"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [
    {
      name: "render-on-demand-in-dev",
      hooks: {
        "astro:route:setup": ({ route }) => {
          route.prerender = !DEV;
        },
      },
    },
    copyTemplates(),
  ],
});
