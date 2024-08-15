import Site from "lume/core/site.ts";

import { walkSync } from "lume/deps/fs.ts";
import { relative } from "lume/deps/path.ts";

import nunjucks from "lume/plugins/nunjucks.ts";
import date from "lume/plugins/date.ts";
import read_info from "lume/plugins/reading_info.ts";
import shiki from "https://deno.land/x/lume_shiki@0.0.14/mod.ts";
import shikiLang from "https://deno.land/x/lume_shiki@0.0.14/plugins/lang/mod.ts";
import shikiAttrib from "https://deno.land/x/lume_shiki@0.0.14/plugins/attribute/mod.ts";
import shikiCopy from "https://deno.land/x/lume_shiki@0.0.14/plugins/copy/mod.ts";
import shikiCSS from "https://deno.land/x/lume_shiki@0.0.14/plugins/css/mod.ts";
import toc from "https://deno.land/x/lume_markdown_plugins/toc.ts";
import image_display from "./_plugins/image-display.ts";
import taskLists from "npm:markdown-it-task-lists"

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
        import.meta.resolve(entry.path)
      );
    }

    site.helper(
      "asset",
      async (name) => {
        return `/assets/${name}?v=1234`;
      },
      { type: "tag", async: true }
    );

    site.filter("take", (x, n) => x.slice(0, n));
    site.filter("drop", (x, n) => x.slice(n, x.length));
    site.hooks.addMarkdownItPlugin(taskLists);

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
      .use(toc())
      .use(nunjucks())
      .use(date())
      .use(read_info())
      .use(image_display())
      .use(
        shiki({
          highlighter: {
            langs: ["bash", "python", "yaml", "c", "rust", "json", "terraform"],
            themes: ["light-plus", "github-dark"],
          },
          themes: {
            "light" : "light-plus",
            "dark" : "github-dark",
          },
          defaultColor: "light",
        })
      )
      .use(shikiCSS())
      .use(shikiLang())
      .use(shikiCopy())
      .use(shikiAttrib({ attribute: "filename" }));
  };
};
