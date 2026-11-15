import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}
walk(root);
const failures = [];
let amazonLinks = 0;
for (const file of htmlFiles) {
  const source = fs.readFileSync(file, "utf8");
  const relFile = path.relative(root, file);
  if (!/<title>[^<]{8,}<\/title>/i.test(source)) failures.push(relFile + ": missing/short title");
  if (!/<meta\s+name="description"\s+content="[^"]{40,}"/i.test(source)) failures.push(relFile + ": missing SEO description");
  for (const match of source.matchAll(/\bhref\s*=\s*"([^"]+)"/gi)) {
    const href = match[1].replace(/&amp;/g, "&");
    if (/^https?:\/\/www\.amazon\.com\//i.test(href)) {
      amazonLinks++;
      if (!/[?&]tag=progamefinds-20(?:&|$)/i.test(href)) failures.push(relFile + ": Amazon link missing affiliate tag: " + href);
      const anchorStart = source.lastIndexOf("<a", match.index);
      const anchorEnd = source.indexOf("</a>", match.index) + 4;
      const anchor = source.slice(Math.max(0, anchorStart), anchorEnd > 3 ? anchorEnd : source.length);
      if (!/rel="[^"]*sponsored/i.test(anchor)) failures.push(relFile + ": Amazon link missing rel=sponsored: " + href);
      continue;
    }
    if (/^(?:[a-z]+:|\/\/|#)/i.test(href)) continue;
    const pathname = href.split(/[?#]/)[0];
    if (!pathname) continue;
    let target = path.resolve(path.dirname(file), pathname);
    if (pathname.endsWith("/")) target = path.join(target, "index.html");
    if (!path.extname(target)) target = path.join(target, "index.html");
    if (!target.startsWith(root + path.sep) && target !== path.join(root, "index.html")) {
      failures.push(relFile + ": local link escapes repository: " + href);
    } else if (!fs.existsSync(target)) {
      failures.push(relFile + ": broken local link: " + href);
    }
  }
}
const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
if (!home.includes("As an Amazon Associate I earn from qualifying purchases.")) failures.push("index.html: required Amazon associate statement missing");
if (!home.includes('id="guides"')) failures.push("index.html: guide hub missing");
if (!fs.existsSync(path.join(root, "blog", "index.html"))) failures.push("blog index missing");
if (amazonLinks < 18) failures.push("Expected at least 18 Amazon links, found " + amazonLinks);
if (home.includes("REPLACE_WITH_WEB3FORMS_ACCESS_KEY")) console.warn("WARN: contact form still contains an owner configuration placeholder; form delivery is not verified.");
console.log("HTML pages:", htmlFiles.length);
console.log("Amazon affiliate links checked:", amazonLinks);
if (failures.length) {
  console.error("QUALITY CHECK FAILED");
  for (const failure of failures) console.error("-", failure);
  process.exitCode = 1;
} else {
  console.log("QUALITY CHECK PASSED");
}
