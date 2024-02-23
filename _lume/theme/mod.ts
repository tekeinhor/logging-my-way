import Site from "lume/core/site.ts";

import { walkSync } from "lume/deps/fs.ts";
import { relative } from "lume/deps/path.ts";

import nunjucks from "lume/plugins/nunjucks.ts";
import date from "lume/plugins/date.ts";
import read_info from "lume/plugins/reading_info.ts";
import shikiji from "https://deno.land/x/lume_shikiji/mod.ts";

export default () => {
  return (site: Site) => {
    const dirname = import.meta.dirname!;
    const entries = walkSync(dirname, {
      includeDirs: false,
      includeFiles: true,
      skip: [/mod\.ts/],
    });

    for (const entry of entries) {
      site.remoteFile(
        relative(dirname, entry.path),
        import.meta.resolve(entry.path),
      );
    }

    site.helper(
      "asset",
      async (name) => {
        return `/assets/${name}?v=1234`;
      },
      { type: "tag", async: true },
    );

    site.filter("take", (x, n) => x.slice(0, n));
    site.filter("drop", (x, n) => x.slice(n, x.length));

    site
      .copy("assets")
      .copy([
        ".jpg",
        ".png",
        ".webp",
        ".webm",
        ".avif",
        ".jxl",
        ".svg",
        ".pdf",
        ".json",
      ])
      .use(nunjucks())
      .use(date())
      .use(read_info())
      .use(shikiji({
        highlighter: {
          langs: ["javascript", "rust", "c", "bash", "python", "yaml"],
          themes: ["github-dark"],
        },
        theme: "github-dark",
      }));
  };
};
