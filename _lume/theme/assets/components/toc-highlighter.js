globalThis.customElements.define(
  "fu-toc-highlighter",
  class TOCHighlighterElement extends HTMLElement {
    constructor() {
      super();

      this.elements = [];
      this.observer = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        for (const [link, element] of this.elements) {
          link.classList.toggle("active", element === e.target);
        }
      });
    }

    connectedCallback() {
      const links = document.querySelectorAll("nav.toc a");
      for (const link of links) {
        const element = document.querySelector(link.getAttribute("href"));
        if (element) {
          link.addEventListener("click", this._onClick);
          this.observer.observe(element);
          this.elements.push([link, element]);
        }
      }
    }

    disconnectedCallback() {
      for (const [link, element] of this.elements) {
        link.removeEventListener("click", this._onClick);
        this.observer.unobserve(element);
      }
    }

    _onClick = (e) => {
      for (const [link] of this.elements) {
        link.classList.toggle("active", link === e.currentTarget);
      }
    };
  },
);
