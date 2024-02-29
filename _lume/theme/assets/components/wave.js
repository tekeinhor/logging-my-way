globalThis.customElements.define(
  "fu-wave",
  class FuWave extends HTMLElement {
    static get observedAttributes() {
      return ["height", "style"];
    }

    /**
     * @type {HTMLCanvasElement}
     */
    #canvas;

    /**
     * @type {CanvasRenderingContext2D}
     */
    #ctx;

    /**
     * @type {ResizeObserver}
     */
    #resizeObserver;

    /**
     * @type {HTMLDivElement}
     */
    #placeholder;

    properties = {
      repeat: 2,
      "shape-height": 20,
      "fg-color": "red",
      "bg-color": "blue",
      "stroke-color": "black",
      "stroke-width": 10,
      "offset-x": 0,
      "offset-y": 0,
    };

    constructor() {
      super();
      const root = this.attachShadow({ mode: "open" });

      const style = document.createElement("style");
      style.textContent = `
      :host {
        display: block;
        position: relative;
        overflow: hidden;
      }
      :host div {
        max-width: 100%:
        max-height: 100%;
      }
      :host canvas {
        width: 100%;
        height: 100%;
        position: absolute;
        inset: 0;
      }
      `;
      root.append(style);

      const div = document.createElement("div");
      this.#placeholder = div;
      root.append(div);

      this.#canvas = document.createElement("canvas");
      this.#ctx = this.#canvas.getContext("2d");
      root.append(this.#canvas);
      this.draw();

      this.#resizeObserver = new ResizeObserver(() => {
        this.draw();
      });
    }

    connectedCallback() {
      this.#resizeObserver.observe(this);
    }

    disconnectedCallback() {
      this.#resizeObserver.unobserve(this);
    }

    /**
     *
     * @param {string} name
     * @param {string} oldValue
     * @param {string} newValue
     */
    attributeChangedCallback(name, _oldValue, newValue) {
      switch (name) {
        case "height": {
          this.#placeholder.style.height = `${newValue}px`;
          break;
        }
        case "style": {
          this.#updateProperties();
          break;
        }
      }
      this.draw();
    }

    #updateProperties() {
      Object.entries(this.properties).forEach(([key, oldValue]) => {
        const newValue = this.style.getPropertyValue(`--${key}`);
        console.log(key, newValue);
        if (!newValue) return;
        this.properties[key] =
          typeof oldValue === "number" ? parseFloat(newValue) : newValue;
      });
    }

    draw() {
      const pixelRatio = globalThis.devicePixelRatio ?? 1;
      this.#canvas.width = this.offsetWidth * pixelRatio;
      this.#canvas.height = this.offsetHeight * pixelRatio;

      const width = this.#canvas.width;
      const height = this.#canvas.height;

      const offsetY = height * 0.5 + this.properties["offset-y"];

      this.#ctx.fillStyle = this.properties["bg-color"];
      this.#ctx.fillRect(0, 0, width, height);

      const path = new Path2D();
      path.moveTo(0, 0);

      for (let i = 0; i < width; i++) {
        const t = i / width;
        const x = Math.cos(
          t * Math.PI * this.properties.repeat + this.properties["offset-x"]
        );
        const y =
          Math.sin(t * Math.PI * this.properties.repeat + this.properties["offset-x"]) *
          this.properties["shape-height"];
        path.lineTo(x + i, y + offsetY);
      }

      path.lineTo(width, 0);
      path.closePath();

      if (this.properties["stroke-width"] > 0) {
        this.#ctx.fillStyle = this.properties["stroke-color"];
        this.#ctx.fill(path);
        this.#ctx.setTransform(1, 0, 0, 1, 0, -this.properties["stroke-width"]);
      }

      this.#ctx.fillStyle = this.properties["fg-color"];
      this.#ctx.fill(path);
      this.#ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }
);
