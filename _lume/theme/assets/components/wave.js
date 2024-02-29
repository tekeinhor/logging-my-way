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

    #needsUpdate = true;

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

    /**
     * Observe element size when added to the DOM
     */
    connectedCallback() {
      this.#resizeObserver.observe(this);
    }

    /**
     * Unobserve element size when removed to the DOM
     */
    disconnectedCallback() {
      this.#resizeObserver.unobserve(this);
    }

    /**
     * Listen attribute changes
     *
     * Properties are updated from CSS variables
     * for easier customization
     *
     * @param {string} name
     * @param {string} oldValue
     * @param {string} newValue
     */
    attributeChangedCallback(name, _oldValue, newValue) {
      switch (name) {
        case "height": {
          this.#placeholder.style.height = `${newValue}px`;
          this.#needsUpdate = true;
          break;
        }
        case "style": {
          this.#updateProperties();
          break;
        }
      }
      this.draw();
    }

    /**
     * Fetch properties from CSS variables
     */
    #updateProperties() {
      Object.entries(this.properties).forEach(([key, oldValue]) => {
        const propertyValue = this.style.getPropertyValue(`--${key}`);
        if (!propertyValue) return;

        const newValue =
          typeof oldValue === "number"
            ? parseFloat(propertyValue)
            : propertyValue;

        if (newValue === oldValue) return;

        this.properties[key] = newValue;
        this.#needsUpdate = true;
      });
    }

    /**
     * Draw sinusoidal wave
     *
     * Perform a redraw only when needsUpdate = true
     */
    draw() {
      if (!this.#needsUpdate) return;

      // Enhance canvas resolution based on device pixel ratio
      const pixelRatio = globalThis.devicePixelRatio ?? 1;
      this.#canvas.width = this.offsetWidth * pixelRatio;
      this.#canvas.height = this.offsetHeight * pixelRatio;

      // Initialize variable
      const { width, height } = this.#canvas;
      const offsetY = height * 0.5 + this.properties["offset-y"];

      let progress = 0
      let angle = 0
      let x = 0
      let y = 0

      // Create path which will be used to draw the wave
      const path = new Path2D();
      path.moveTo(0, 0);

      for (let i = 0; i < width; i++) {
        progress = i / width;
        angle = progress * Math.PI * this.properties.repeat;
        angle += this.properties["offset-x"];
        x = Math.cos(angle);
        y = Math.sin(angle) * this.properties["shape-height"];
        path.lineTo(x + i, y + offsetY);
      }

      path.lineTo(width, 0);
      path.closePath();

      // Fill the entire canvas with a background color
      this.#ctx.fillStyle = this.properties["bg-color"];
      this.#ctx.fillRect(0, 0, width, height);

      // Draw wave path with a offset
      if (this.properties["stroke-width"] > 0) {
        this.#ctx.fillStyle = this.properties["stroke-color"];
        this.#ctx.fill(path);
        this.#ctx.setTransform(1, 0, 0, 1, 0, -this.properties["stroke-width"]);
      }

      // Draw the wave a second time without offset
      this.#ctx.fillStyle = this.properties["fg-color"];
      this.#ctx.fill(path);
      this.#ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Reset needsUpdate
      this.#needsUpdate = false;
    }
  }
);
