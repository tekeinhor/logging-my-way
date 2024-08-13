import Site from "lume/core/site.ts";

export default function image_display() {
  return (site: Site) => {
    site.process([".html"], (pages) => {
      for (const page of pages) {
        const { document } = page;
        if (!document) continue;

        const style = document.createElement("style");
        style.textContent = /* css */`
          .image-display {
            display: flex;
            align-items: center;
            flex-direction: column;
            gap: 1rem;
          }
          
          .image-display img[image-display] {
            max-width: 100%;
            object-fit: contain;
            border: 2px #e8e8e8 solid;
            border-radius: 10px;
          }

          .image-display__caption {
            font-style: italic;
            opacity: 0.5;
          }
        `;
        document.head.append(style);

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
