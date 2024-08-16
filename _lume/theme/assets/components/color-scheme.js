const toggle_switch = document.querySelector(".switch");
const html = document.querySelector("html")

if (toggle_switch){
    toggle_switch.classList.toggle("active", localStorage.getItem("color-scheme") === "dark")
    toggle_switch.addEventListener("click", ()=> {
        toggle_switch.classList.toggle("active")
        html.classList.toggle("dark-mode")
        globalThis.dispatchEvent(new CustomEvent("onChangeColorScheme"))
        
        const is_dark_mode = html.classList.contains("dark-mode")
        if (is_dark_mode){
            localStorage.setItem("color-scheme", "dark")
            document.documentElement.setAttribute("data-color", "dark");
        }else{
            localStorage.setItem("color-scheme", "light")
            document.documentElement.setAttribute("data-color", "light");
        }
    })
}