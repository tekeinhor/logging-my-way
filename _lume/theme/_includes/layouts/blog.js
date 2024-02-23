// https://github.com/lumeland/lume/issues/357

export const layout = "layouts/blog.njk";

export default function ({ page, content }) {
  page.data.renderedContent = content;
  return content;
}
