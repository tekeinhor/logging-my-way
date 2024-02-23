import lume from "lume/mod.ts";

import createSlugifier from "lume/core/slugifier.ts";

import anchor from "npm:markdown-it-anchor@8.6.5";
import ins from "npm:markdown-it-ins@3.0.1";

import theme from "./theme/mod.ts";

const site = lume({}, {
  markdown: {
    options: {
      typographer: true,
    },
    useDefaultPlugins: true,
    plugins: [[anchor, {
      permalink: anchor.permalink.headerLink({ safariReaderFix: true }),
      slugify: createSlugifier(),
    }], ins],
  },
});

site.use(theme());

export default site;