import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";
import { createMarkdownRenderer } from "vitepress";
import { configureEpubMarkdown, makeXhtml } from "../scripts/epub-rendering.mjs";

const markdown = await createMarkdownRenderer(resolve("docs"), { config: configureEpubMarkdown });

test("EPUB worksheets preserve literal code and whitespace without website controls", () => {
  const template = 'Task: <audience> & "result"\n  Evidence: {{ draft }}\n\nDone: [ ]\n';
  const body = markdown.render(`\`\`\`markdown\n${template}\`\`\`\n`);
  assert.equal(body, `<pre><code>${markdown.utils.escapeHtml(template)}</code></pre>\n`);
  assert.doesNotMatch(body, /<button|v-pre|shiki|class="copy"/);
  const xhtml = makeXhtml({ lang: "en-US", title: "Worksheet & evidence", body });
  assert.match(xhtml, /<title>Worksheet &amp; evidence<\/title>/);
  assert.match(xhtml, /lang="en-US" xml:lang="en-US"/);
  assert.match(xhtml, /Task: &lt;audience&gt; &amp; &quot;result&quot;/);
  assert.match(xhtml, /\n  Evidence: \{\{ draft \}\}\n\nDone: \[ \]\n/);
});

test("EPUB indented code also preserves text without executable markup", () => {
  const body = markdown.render("    <script>alert('x')</script>\n    a && b\n");
  assert.equal(body, "<pre><code>&lt;script&gt;alert('x')&lt;/script&gt;\na &amp;&amp; b\n</code></pre>\n");
});

test("EPUB table headers identify their columns for assistive reading", () => {
  const body = markdown.render("| Task | Evidence |\n| --- | --- |\n| First attempt | Saved draft |\n");
  assert.equal((body.match(/<th scope="col">/g) || []).length, 2);
  assert.match(body, /<td>Saved draft<\/td>/);
});

test("EPUB preserves chapter link targets while removing heading permalink controls", () => {
  const body = markdown.render("# Reading guide\n\n[Next chapter](chapter-002.xhtml#practice)\n\n---\n");
  const xhtml = makeXhtml({ lang: "en-US", title: "Guide", body });
  assert.match(xhtml, /id="reading-guide"/);
  assert.match(xhtml, /href="chapter-002.xhtml#practice"/);
  assert.doesNotMatch(xhtml, /header-anchor|tabindex/);
  assert.match(xhtml, /<hr\s*\/>/);
});
