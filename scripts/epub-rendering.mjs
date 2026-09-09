// VitePress's fenced-code renderer emits Vue directives and a copy button that
// depend on the website runtime. EPUB content must remain usable without it.
export function configureEpubMarkdown(markdown) {
  markdown.renderer.rules.fence = (tokens, index) =>
    `<pre><code>${markdown.utils.escapeHtml(tokens[index].content)}</code></pre>\n`;
  markdown.renderer.rules.code_block = markdown.renderer.rules.fence;
  markdown.renderer.rules.th_open = (tokens, index, options, env, renderer) => {
    tokens[index].attrSet("scope", "col");
    return renderer.renderToken(tokens, index, options, env);
  };
}

export function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function makeXhtml({ lang, title, body, epubType = "chapter" }) {
  const safeBody = body
    .replace(/<a\b[^>]*class="header-anchor"[^>]*>[\s\S]*?<\/a>/gi, "")
    .replace(/\s+tabindex=(['"])-?\d+\1/gi, "")
    .replace(/&nbsp;/g, "&#160;")
    .replace(/&ZeroWidthSpace;/g, "&#8203;")
    .replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);)/gi, "&amp;")
    .replace(/<(img|br|hr)(\b[^>]*?)(?<!\/)\s*>/gi, "<$1$2 />");
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${lang}" xml:lang="${lang}">
<head>
  <meta charset="utf-8" />
  <title>${escapeXml(title)}</title>
  <link rel="stylesheet" type="text/css" href="../styles/book.css" />
</head>
<body epub:type="${epubType}">
<main>
${safeBody}
</main>
</body>
</html>
`;
}
