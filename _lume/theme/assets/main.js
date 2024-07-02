import "./components/wave.js";
import "./components/toc-highlighter.js"

globalThis.addEventListener("DOMContentLoaded", () => {
    // autosync copyright year
    const copyright = document.getElementById("copyright");
    if (copyright) copyright.textContent = `©${new Date().getFullYear()}`;

    // add zoom support on image with image-display attribute
    mediumZoom("[image-display]");
});
