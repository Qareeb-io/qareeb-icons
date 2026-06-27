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
  {
    name: "qvision",
    inputDir: path.join(__dirname, "../assets/icons/qvision"),
    outputFile: path.join(__dirname, "../src/qvision/iconDefinitions.ts"),
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
  svgContent: string,
): [number, number, string[], string | string[], Record<string, string>] {
  const dom = new JSDOM(svgContent);
  const svg = dom.window.document.querySelector("svg")!;
  const viewBox = svg.getAttribute("viewBox")?.split(/\s+/).map(Number) || [];
  const width = parseFloat(
    svg.getAttribute("width") ?? String(viewBox[2] || 0),
  );
  const height = parseFloat(
    svg.getAttribute("height") ?? String(viewBox[3] || 0),
  );

  const pathData: string[] = [];

  // 1. Extract existing paths
  svg.querySelectorAll("path").forEach((p) => {
    const d = p.getAttribute("d")?.trim();
    if (d) pathData.push(d);
  });

  // 2. Convert polygons to paths
  svg.querySelectorAll("polygon").forEach((p) => {
    const points = p.getAttribute("points")?.trim();
    if (points) {
      // Converts "17,13 19,13 19,15" into "M17,13 L19,13 L19,15 Z"
      const d = "M" + points.split(/\s+/).join(" L") + " Z";
      pathData.push(d);
    }
  });

  // 3. Convert rects to paths (ignoring invisible bounding boxes)
  svg.querySelectorAll("rect").forEach((r) => {
    if (r.getAttribute("fill") === "none") return; // Skip transparent bounding boxes
    const x = parseFloat(r.getAttribute("x") || "0");
    const y = parseFloat(r.getAttribute("y") || "0");
    const w = parseFloat(r.getAttribute("width") || "0");
    const h = parseFloat(r.getAttribute("height") || "0");

    // Converts rect to path coordinates
    const d = `M${x},${y} H${x + w} V${y + h} H${x} Z`;
    pathData.push(d);
  });

  const data = pathData.length === 1 ? pathData[0] : pathData;

  const attrs: Record<string, string> = {};
  const firstShape = svg.querySelector(
    "path, polygon, rect:not([fill='none'])",
  );

  if (firstShape) {
    const names = [
      "stroke",
      "fill",
      "stroke-width",
      "stroke-linecap",
      "stroke-linejoin",
    ];
    for (const n of names) {
      const v = firstShape.getAttribute(n);
      if (v != null) {
        attrs[snakeToCamel(n)] =
          n === "stroke" || n === "fill" ? "currentColor" : v;
      }
    }
  }

  dom.window.close();

  
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
        : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
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
    try {
      const svg = fs.readFileSync(path.join(INPUT_DIR, file), "utf-8");

      // if (file.endsWith('.png')) {
      //   // delete the png file
      //   fs.unlinkSync(path.join(INPUT_DIR, file));
      //   return;
      // }

      const [w, h, ligatures, d, attrs] = extractIconData(svg);
      const name = path.basename(file, ".svg");
      const unicode = toUnicode(i);
      const iconArr = JSON.stringify(
        [w, h, ligatures, unicode, d, attrs],
        null,
        2,
      );
      lines.push(
        `export const qa${snakeToPascal(name)}: IconDefinition = {`,
        `  name: 'qa-${name}',`,
        `  icon: ${iconArr}`,
        `};`,
        ``,
      );
    } catch (error) {
      console.error("Failed:", file);
      throw error;
    }
  });

  fs.writeFileSync(OUTPUT_FILE, lines.join("\n"), "utf-8");
}
