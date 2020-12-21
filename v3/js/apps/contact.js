"use strict";
function ContactApp(options = {}) {
    let self = {
        models: null,
        app: null,
        components: {}
    };

    init();
    function init() {
        self.log = options.log;

        initComponents();

        self.models = options.models;
        self.views = options.views || {};
        self.app = new Vue({
            el: options.appParams.el,
            data: options.appParams.data,
            created: function () {
                self.log("initialized contact page");
            },
            methods: {},
            components: self.components
        });
    }

    function initComponents() {
    }

    return {};
}