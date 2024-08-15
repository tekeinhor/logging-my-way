const toggle_switch = document.querySelector(".switch");
const html = document.querySelector("html")

if (toggle_switch){
    toggle_switch.addEventListener("click", ()=> {
        toggle_switch.classList.toggle("active")
        html.classList.toggle("dark-mode")
        globalThis.dispatchEvent(new CustomEvent("onChangeColorScheme"))
    })
}