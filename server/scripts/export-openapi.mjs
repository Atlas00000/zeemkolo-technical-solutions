import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { openApiDocument } from "../src/openapi.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(root, "docs", "api");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "openapi.json");
fs.writeFileSync(outFile, `${JSON.stringify(openApiDocument, null, 2)}\n`);
console.log("Wrote", outFile);
