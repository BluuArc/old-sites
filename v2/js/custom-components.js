"use strict";

/* global Vue */

// loads common Vue components; allows definition of customLoadFn to load non-default Vue components
let initCommonCustomVueComponents = function(customLoadFn){
    let container = Vue.component("container", {
        template: `<div class="container">
                            <slot>No container content found.</slot>
                        </div>`
    });

    let container_fluid = Vue.component("container-fluid", {
        template: `<div class="container-fluid">
                            <slot>No container content found.</slot>
                        </div>`
    });

    let card = Vue.component("card", {
        template: `<div class="card">
                            <slot>No card content found.</slot>
                        </div>`
    });

    let filler_image = Vue.component("filler-image", {
        props: ['width', 'height', 'class', 'style'],
        computed: {
            createImage: function () {
                // originally from https://getbootstrap.com/docs/4.0/content/images/
                let width = +this.width || 200;
                let height = +this.height || 200;
                console.log(width, height);
                return `data:image/svg+xml;charset=UTF-8,<svg%20width%3D"${width}"%20height%3D"${height}"%20xmlns%3D"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg"%20viewBox%3D"0%200%20${width}%20${height}"%20preserveAspectRatio%3D"none"><defs><style%20type%3D"text%2Fcss">%23holder_15ec8c963ad%20text%20%7B%20fill%3Argba(255%2C255%2C255%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3B<%2Fstyle><%2Fdefs><g%20id%3D"holder_15ec8c963ad"><rect%20width%3D"${width}"%20height%3D"${height}"%20fill%3D"%23777"><%2Frect><g><text%20x%3D"${width * 0.1}"%20y%3D"${height * 0.25}">Filler Image<%2Ftext><%2Fg><%2Fg><%2Fsvg>`;
            }
        },
        template: `<img :src="createImage" alt="filler image"></img>`,
        mounted: function () {
            console.log("Mounted image");
        }
    });

    if(typeof customLoadFn === "function"){
        return Promise.resolve(customLoadFn());
    }else{
        return Promise.resolve();
    }
};