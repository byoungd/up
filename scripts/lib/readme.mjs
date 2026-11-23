// Keep the rendered homepage and the repository README on the same source.
export function repositoryReadmeFromDocs(source) {
  return source
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n+/, "")
    .replace("中文 | [English](en/)", "中文 | [English](docs/en/README.md)")
    .replace(/\]\((?:\.\/)?(assets|threads|templates|reference|public|topics)\//g, "](docs/$1/")
    .replace(/src="\.\/assets\//g, 'src="./docs/assets/')
    .replace(/src="\.\/((?:threads|templates|reference)\/[^"]+)"/g, 'src="./docs/$1"')
    .replace(/href="\.\/public\/downloads\//g, 'href="./docs/public/downloads/')
    .replace(/href="\.\/downloads\//g, 'href="./docs/public/downloads/')
    .replace(/href="\.\/book-downloads"/g, 'href="./docs/book-downloads.md"')
    .replace(/\]\(en\/\)/g, "](docs/en/README.md)")
    .replace(/\]\(\.\/(projects|practice|resources)(?:\.md)?([#?][^)]*)?\)/g, "](docs/$1.md$2)")
    .replace(/\]\((projects|practice|resources)\.md([#?][^)]*)?\)/g, "](docs/$1.md$2)")
    .replace(/href="\.\/((?:threads|templates|reference)\/[^"#?]+|(?:projects|practice)(?:\.md)?)([?#][^"]*)?"/g, (_match, pathname, suffix = "") => {
      return `href="./docs/${pathname.replace(/\.md$/, "")}.md${suffix}"`;
    });
}
