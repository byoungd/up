import { rmSync } from "node:fs";
import { resolve } from "node:path";

function decodedPath(url) {
  return decodeURIComponent(url.split("?", 1)[0]).replaceAll("\\", "/");
}

function isPrivatePath(path) {
  return /(?:^|\/)assets\/session\.json(?:$|\/)/i.test(path);
}

function rejectPrivateReference(source, id = "") {
  // Vite's CSS and new URL() transforms can read and inline files without
  // invoking load(). Reject their static references before those transforms.
  const decoded = source
    .replace(/\\u\{([\da-f]{1,6})\}|\\u([\da-f]{4})|\\x([\da-f]{2})|\\([\da-f]{1,6})\s?|\\([/\\.])/gi,
      (_, unicode, shortUnicode, hex, css, literal) => {
        if (literal) return literal;
        const point = Number.parseInt(unicode || shortUnicode || hex || css, 16);
        return point <= 0x10ffff ? String.fromCodePoint(point) : "";
      })
    .replace(/%([\da-f]{2})/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/\/\.(?=\/)/g, "");
  const inAssets = /(?:^|\/)assets\//i.test(id.replaceAll("\\", "/"));
  if (/\bassets\/(?:[^\s"'`<>();]*\/)?session\.json\b/i.test(decoded)
      || (inAssets && /\bsession\.json\b/i.test(decoded))) {
    throw new Error("Private session assets cannot be referenced by site source files.");
  }
}

export function privateAssetGuard() {
  let outDir;
  const protectServer = (server) => {
    server.middlewares.use((req, res, next) => {
      let path;
      try {
        path = decodedPath(req.url || "");
      } catch {
        res.statusCode = 400;
        res.end("Bad request");
        return;
      }
      if (!isPrivatePath(path)) return next();
      res.statusCode = 404;
      res.end("Not found");
    });
  };

  return {
    name: "private-asset-guard",
    enforce: "pre",
    config(config) {
      // Register before Vite compiles its filesystem deny matcher. Preserve its
      // default patterns when the project has not supplied its own deny list.
      const deny = config.server?.fs?.deny ?? [".env", ".env.*", "*.{crt,pem}", "**/.git/**"];
      return { server: { fs: { deny: [...deny, "**/assets/session.json"] } } };
    },
    configResolved(config) {
      outDir = config.build.outDir;
    },
    configureServer: protectServer,
    configurePreviewServer: protectServer,
    load(id) {
      // Asset and raw imports otherwise receive hashed names and evade output cleanup.
      if (isPrivatePath(decodedPath(id))) {
        throw new Error("Private session assets cannot be imported into the site.");
      }
    },
    transform(source, id) {
      rejectPrivateReference(source, id);
    },
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        rejectPrivateReference(html);
      },
    },
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== "asset") continue;
        if ((output.originalFileNames || []).some((name) => isPrivatePath(decodedPath(name)))) {
          throw new Error("Private session assets cannot be emitted into the site.");
        }
      }
    },
    closeBundle() {
      if (outDir) rmSync(resolve(outDir, "assets/session.json"), { force: true });
    },
  };
}
