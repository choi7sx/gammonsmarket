import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "parse5";
import YAML from "yaml";

const pageNames = [
  "index",
  "market",
  "cafe",
  "csa",
  "about",
  "visit",
  "contact",
  "gift-baskets",
];
const content = (name) =>
  YAML.parse(
    readFileSync(`src/content/pages/${name}.md`, "utf8").split("---")[1],
  );
const output = (name) =>
  name === "index" ? "dist/index.html" : `dist/${name}/index.html`;
const attrs = (node) =>
  Object.fromEntries((node.attrs || []).map((a) => [a.name, a.value]));
const text = (node) =>
  node.nodeName === "#text"
    ? node.value
    : (node.childNodes || []).map(text).join("");
const normalize = (value) => String(value).replace(/\s+/g, " ").trim();
function all(node) {
  return [node, ...(node.childNodes || []).flatMap(all)];
}

function resolve(expression, scope) {
  const file = expression.match(/^@file\[([^\]]+)\](?:\.(.*))?$/);
  if (file) {
    scope = JSON.parse(readFileSync(file[1], "utf8"));
    expression = file[2] || "";
  }
  return expression
    ? expression.split(".").reduce((value, key) => value?.[key], scope)
    : scope;
}

for (const name of pageNames) {
  test(`${name}: content, links, images, metadata, and editable bindings`, () => {
    const html = readFileSync(output(name), "utf8");
    const doc = parse(html);
    const nodes = all(doc);
    const data = content(name);
    assert.equal(nodes.filter((n) => n.tagName === "h1").length, 1);
    assert.ok(
      text(nodes.find((n) => n.tagName === "title")).includes(
        "Gammon’s Market",
      ),
    );
    assert.ok(
      attrs(
        nodes.find(
          (n) => n.tagName === "meta" && attrs(n).name === "description",
        ),
      ).content,
    );
    assert.match(
      attrs(
        nodes.find((n) => n.tagName === "link" && attrs(n).rel === "canonical"),
      ).href,
      /^https:\/\/www\.gammonsmarket\.com\//,
    );
    assert.doesNotMatch(
      html,
      /chatgpt\.site|tiny-jackal\.cloudvent|Astro Minimal Starter|\/images\/logos\/logo-wordmark/,
    );
    assert.ok(
      nodes.some(
        (n) =>
          n.tagName === "a" &&
          attrs(n).href === "https://gammonsmarket.square.site/",
      ),
    );
    assert.ok(
      nodes.some((n) => n.tagName === "dialog" && attrs(n)["aria-labelledby"]),
    );
    assert.ok(nodes.some((n) => attrs(n).id === "main"));
    const ids = new Set(nodes.map((n) => attrs(n).id).filter(Boolean));
    for (const node of nodes) {
      const a = attrs(node);
      if (node.tagName === "img")
        assert.ok(a.alt?.trim(), `${name}: image needs alt text`);
      for (const url of [a.src, node.tagName === "a" ? a.href : undefined]) {
        if (!url || /^(?:https?:|mailto:|tel:|data:)/.test(url)) continue;
        if (url.startsWith("#")) {
          assert.ok(ids.has(url.slice(1)), `${name}: missing anchor ${url}`);
          continue;
        }
        const pathname = url.split(/[?#]/)[0];
        assert.ok(
          pathname.startsWith("/"),
          `${name}: unexpected relative URL ${url}`,
        );
        const local = join("dist", decodeURIComponent(pathname));
        assert.ok(
          existsSync(local) || existsSync(join(local, "index.html")),
          `${name}: missing destination ${url}`,
        );
      }
    }

    let bindings = 0;
    function walk(node, scope, array) {
      const a = attrs(node);
      let nextScope = scope;
      let nextArray = array;
      if (node.tagName === "editable-component") {
        if (a["data-prop"]) nextScope = resolve(a["data-prop"], scope);
        else
          nextScope = Object.fromEntries(
            Object.entries(a)
              .filter(([k]) => k.startsWith("data-prop-"))
              .map(([k, v]) => [k.slice(10), resolve(v, scope)]),
          );
        assert.ok(nextScope, `${name}: missing component data`);
        nextArray = undefined;
      }
      if (a["data-editable"] === "array-item") {
        assert.ok(array, `${name}: array item has no parent array`);
        nextScope = array.items[array.index++];
        assert.ok(nextScope, `${name}: array item has no source data`);
        nextArray = undefined;
      }
      if (a["data-editable"] === "array") {
        const items = resolve(a["data-prop"], nextScope);
        assert.ok(
          Array.isArray(items),
          `${name}: invalid array path ${a["data-prop"]}`,
        );
        nextArray = { items, index: 0 };
      }
      if (a["data-editable"] === "text") {
        const value = resolve(a["data-prop"], nextScope);
        assert.notEqual(
          value,
          undefined,
          `${name}: missing text path ${a["data-prop"]}`,
        );
        assert.equal(
          normalize(text(node)),
          normalize(value),
          `${name}: text mismatch ${a["data-prop"]}`,
        );
        bindings++;
      }
      if (a["data-editable"] === "image") {
        assert.equal(
          a.src,
          resolve(a["data-prop-src"], nextScope),
          `${name}: image source binding`,
        );
        assert.equal(
          a.alt,
          resolve(a["data-prop-alt"], nextScope),
          `${name}: image alt binding`,
        );
        bindings++;
      }
      for (const child of node.childNodes || [])
        walk(child, nextScope, nextArray);
      if (a["data-editable"] === "array")
        assert.equal(
          nextArray.index,
          nextArray.items.length,
          `${name}: array rendering mismatch`,
        );
    }
    walk(doc, data);
    assert.ok(
      bindings >= 45,
      `${name}: expected editable page and shared fields`,
    );
  });
}

test("CloudCannon schemas and redirects are valid", () => {
  const config = YAML.parse(readFileSync("cloudcannon.config.yml", "utf8"));
  for (const name of pageNames)
    assert.ok(config.collections_config.pages.schemas[content(name)._schema]);
  assert.equal(config.paths.uploads, "public/images");
  const routing = JSON.parse(readFileSync(".cloudcannon/routing.json", "utf8"));
  for (const [old, target] of [
    ["locations-1", "visit"],
    ["hendersonville", "visit"],
    ["copy-of-about", "gift-baskets"],
  ]) {
    for (const trailing of ["", "/"])
      assert.ok(
        routing.routes.some(
          (r) =>
            r.from === `/${old}${trailing}` &&
            r.to === `/${target}/` &&
            r.status === 301,
        ),
      );
  }
});

test("sitemap, feed, and public output exclude starter drafts", () => {
  const sitemap = readFileSync("dist/sitemap.xml", "utf8");
  for (const name of pageNames)
    assert.ok(
      sitemap.includes(
        name === "index"
          ? "https://www.gammonsmarket.com/<"
          : `https://www.gammonsmarket.com/${name}/<`,
      ),
    );
  for (const name of [
    "search",
    "seo",
    "optimized-images",
    "tailwind",
    "markdown",
    "paginated-collection",
    "lighthouse-scores",
    "data-files",
  ])
    assert.equal(existsSync(`dist/blog/${name}/index.html`), false);
  assert.doesNotMatch(readFileSync("dist/feed.xml", "utf8"), /<item>/);
  assert.ok(
    readFileSync("dist/robots.txt", "utf8").includes(
      "https://www.gammonsmarket.com/sitemap.xml",
    ),
  );
  assert.ok(
    readFileSync("dist/404.html", "utf8").includes("noindex, nofollow"),
  );
});
