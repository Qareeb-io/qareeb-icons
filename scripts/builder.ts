import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";
import inquirer from "inquirer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const paths = [
  {
    name: "wizabot",
    inputDir: path.join(__dirname, "../assets/icons/wizabot"),
    outputFile: path.join(__dirname, "../src/wizabot/iconDefinitions.ts"),
  },
  {
    name: "qfarm",
    inputDir: path.join(__dirname, "../assets/icons/qfarm"),
    outputFile: path.join(__dirname, "../src/qfarm/iconDefinitions.ts"),
  },
];

const types = paths.map((p) => p.name);
const answers = await inquirer.prompt([
  {
    type: "list",
    name: "type",
    message: "Select icon set to build:",
    choices: types,
  },
]);

const selected = paths.find((p) => p.name === answers.type);
const INPUT_DIR = selected?.inputDir;
const OUTPUT_FILE = selected?.outputFile;

if (INPUT_DIR && OUTPUT_FILE) {
  generateIconDefinitions();
} else {
  console.error(`Invalid icon set type. Use ${types.join(", ")}`);
  process.exit(1);
}

function toUnicode(index: number): string {
  return "e" + (index + 1).toString(16).padStart(3, "0");
}

function extractIconData(
  svgContent: string
): [number, number, string[], string | string[], Record<string, string>] {
  const dom = new JSDOM(svgContent);
  const svg = dom.window.document.querySelector("svg")!;
  const viewBox = svg.getAttribute("viewBox")?.split(/\s+/).map(Number) || [];
  const width = parseFloat(
    svg.getAttribute("width") ?? String(viewBox[2] || 0)
  );
  const height = parseFloat(
    svg.getAttribute("height") ?? String(viewBox[3] || 0)
  );

  const paths = Array.from(svg.querySelectorAll("path"));
  const pathData = paths
    .map((p) => p.getAttribute("d")!.trim())
    .filter(Boolean);
  const data = pathData.length === 1 ? pathData[0] : pathData;

  const first = paths[0];
  const attrs: Record<string, string> = {};
  const names = [
    "stroke",
    "fill",
    "stroke-width",
    "stroke-linecap",
    "stroke-linejoin",
  ];
  for (const n of names) {
    const v = first.getAttribute(n);
    if (v != null) {
      attrs[snakeToCamel(n)] =
        n === "stroke" || n === "fill" ? "currentColor" : v;
    }
  }

  return [width, height, [], data, attrs];
}

function snakeToPascal(input: string): string {
  return input
    .split(/[_-]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join("");
}

function snakeToCamel(input: string): string {
  return input
    .split(/[_-]/)
    .map((s, i) =>
      i === 0
        ? s.toLowerCase()
        : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
    )
    .join("");
}

function generateIconDefinitions() {
  if (!INPUT_DIR || !OUTPUT_FILE) return;

  const files = fs.readdirSync(INPUT_DIR).filter((f) => f.endsWith(".svg"));
  const lines: string[] = [
    `// auto-generated icon definitions`,
    `export type IconDefinition = {`,
    `  name: string;`,
    `  icon: [number, number, string[], string, string | string[], Record<string,string>];`,
    `};`,
    ``,
  ];

  files.forEach((file, i) => {
    const svg = fs.readFileSync(path.join(INPUT_DIR, file), "utf-8");
    const [w, h, ligatures, d, attrs] = extractIconData(svg);
    const name = path.basename(file, ".svg");
    const unicode = toUnicode(i);
    const iconArr = JSON.stringify(
      [w, h, ligatures, unicode, d, attrs],
      null,
      2
    );
    lines.push(
      `export const qa${snakeToPascal(name)}: IconDefinition = {`,
      `  name: 'qa-${name}',`,
      `  icon: ${iconArr}`,
      `};`,
      ``
    );
  });

  fs.writeFileSync(OUTPUT_FILE, lines.join("\n"), "utf-8");
}
