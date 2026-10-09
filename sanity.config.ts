"use client";
// Sanity Studio, the content dashboard, served at /studio on the website.
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";

export default defineConfig({
  name: "lvt",
  title: "Lakewood Village Tavern",
  basePath: "/studio",
  projectId,
  dataset,
  apiVersion,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.documentTypeListItem("special").title("Specials"),
            S.documentTypeListItem("event").title("Events"),
          ]),
    }),
  ],
});
