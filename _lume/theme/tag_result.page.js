export const layout = "layouts/search_result.njk";

export default function* ({ search }) {
  for (const tag of search.values("tags")) {
    yield {
      url: `/tags/${tag}`,
      title: `Tag: ${tag}`,
      type: "tag",
      search_query: `${tag}`
    };
  }
}
