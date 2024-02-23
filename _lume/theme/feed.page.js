export const url = "/feed.json";

export default async function (
  { site, search },
  { md, njk, url, date, htmlUrl },
) {
  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: site.feedTitle,
    home_page_url: url("", true),
    feed_url: url("feed.json", true),
    // description: site.desc,
    icon: url(site.pfp, true),
    favicon: url(site.pfp, true),
    authors: [{
      name: site.author,
      url: url("", true),
      avatar: url(site.pfp, true),
    }],
    language: "en",
    items: await Promise.all(
      search.pages("type=post", "date=desc").map(async (post) => ({
        id: url(post.url, true),
        url: url(post.url, true),
        title: post.title,
        summary: post.desc,
        content_html: htmlUrl(
          md(await njk(post.content, { inFeed: true })),
          true,
        ),
        date_published: date(post.date, "ATOM"),
      })),
    ),
  };

  return JSON.stringify(feed, null, 2);
}
