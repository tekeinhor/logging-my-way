---
layout: layouts/home.njk
---

# Hello!

Hi, I'm <a href="/" rel="me">Tatiana</a> and I am an MLOps engineer. For those who don't know, it is software engineer in the ML (Machine Learning) / AI (Artificial Intelligence) 🤖 realm who loves automated deployment, hence the Ops part. I live in Lille, France 🇫🇷.
 
I love discussing software architecture, engineering best practices, and sometimes even workplace politics. The last decades have taught me that the main value of ML projects lies in your ability to actually build something, a product 👀, out of them (at least in the corporate world). However, most of the tutorials on the internet just talk about notebooks and model optimisation. But how do you actually deploy your project? We discuss this and more in the [blog](/blog) sections.

When I am not working, I am probably dancing 🩰, doing crossfit™️ 🏋️‍♂️, or sleeping 💤.

<style>
    .hello {
        display: flex;
        justify-content: center;
    }
    .hello a{
        background-color: var(--color-accent2);
        color: white;
        border-radius: 5px;
        position: relative;
        overflow: hidden;
        font-weight: 600;
    }

    .hello span{
        padding: 5px 40px;
        display: flex;
        justify-content: center;
    }
    .hello__hover{
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        transition: bottom 0.25s;
    }
    .hello__placeholder {
        visibility: hidden;
    }

    @media(hover:hover){
        .hello a:hover .hello__hover {
            bottom: -100%;
        }
    }
</style>
<div class="hello">
    <a href="mailto:tatia.dev@gmail.com">
        <div class="hello__placeholder">
            <span> tatia.dev@gmail.com</span>
        </div>
        <div class="hello__hover">
            <span>tatia.dev@gmail.com</span>
            <span>Say hi 👋 </span>
        </div>
    </a>
</div>
