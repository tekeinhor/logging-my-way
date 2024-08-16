import Site from "lume/core/site.ts";

export default function image_display() {
  return (site: Site) => {
    site.process([".html"], (pages) => {
      for (const page of pages) {
        const { document } = page;
        if (!document) continue;

        const images = document.querySelectorAll("img[image-display]");
        for (const image of images) {
          const div = document.createElement("div");
          const span = document.createElement("span");
          span.setAttribute("class", "image-display__caption")
          const clonedImage = image.cloneNode();
          span.textContent = image.getAttribute("alt") ?? "";
          div.setAttribute("class", "image-display");
          div.append(clonedImage, span);
          image.replaceWith(div);
        }
      }
    });
  };
}
