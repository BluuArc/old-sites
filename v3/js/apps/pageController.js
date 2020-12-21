"use strict";

var debug = debug || {};

function PageController(options = {}) {
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
        self.views = options.views;
        self.app = new Vue({
            el: options.appParams.el,
            data: options.appParams.data,
            created: function () {
                self.log("initialized page controller");
                $(window).on("popstate", onPageLoad);
            },
            methods: {
                setPageTo: setPageTo
            },
            components: self.components
        });
    }

    function initComponents() {
        self.components['jccc-nav-header'] = {
            props: ['pages'],
            template: `
                <div class="mdc-toolbar">
                    <div class="mdc-toolbar__row sm-plus">
                        <div class="mdc-toolbar__section mdc-toolbar__section--shrink-to-fit mdc-toolbar__section--align-start">
                            <h2 class="mdc-toolbar__title"><a href="./?link=Home">JCCC</a></h2>
                        </div>
                        <div class="mdc-toolbar__section mdc-toolbar__section--align-end">
                            <nav id="page-tab-bar" class="mdc-tab-bar" role="tablist">
                                <a role="tab" v-for="(page,key) in pages" 
                                    :class="{ 'mdc-tab':true, 'mdc-tab--active': page.isActive, 'hidden': page.isHidden }"
                                    @click="setPageTo(key)"    
                                >
                                    {{ key }}
                                </a>
                                <span class="mdc-tab-bar__indicator"></span>
                            </nav>
                        </div>
                    </div>
                    <div class="mdc-toolbar__row xs-only" id="mobile-header">
                        <div class="mdc-toolbar__section">
                            <h2 class="mdc-toolbar__title"><a href="./?link=Home">JCCC</a></h2>
                        </div>
                    </div>
                    <div class="mdc-toolbar__row xs-only">
                        <div class="mdc-toolbar__section mdc-toolbar__section--align-start">
                            <nav id="page-tab-bar-mobile" class="mdc-tab-bar" role="tablist">
                                <a role="tab" v-for="(page,key) in pages" 
                                    :class="{ 'mdc-tab':true, 'mdc-tab--active': page.isActive, 'hidden': page.isHidden }"
                                    @click="setPageTo(key)"    
                                >
                                    {{ key }}
                                </a>
                                <span class="mdc-tab-bar__indicator"></span>
                            </nav>
                        </div>
                    </div>
                </div>
                `,
            methods: {
                setPageTo: function (newPage) {
                    // emit changes to parent
                    this.$emit("pagechange", newPage);
                }
            },
            mounted: function () {
                self.log("Mounted navbar");
                let tabBars = [];
                $(this.$el).find(".mdc-tab-bar").each(function () {
                    let tabBar = new mdc.tabs.MDCTabBar(this);
                    tabBars.push(tabBar);
                });
                self.tabBars = tabBars;

                self.log("tabBars", self.tabBars);
            }
        };
    }

    // change view of page
    function setPageTo(pageName, doNotPushState = false) {
        let pages = $(".pages");
        let delay = 100, fadePromises = [];
        let activeIndex = -1;
        for(let p in self.models.pages){
            self.models.pages[p].isActive = p === pageName;

            if(p === pageName){
                activeIndex = Object.keys(self.models.pages).indexOf(p);
            }
            
            // toggle page sections based on isActive
            let pageSection = pages.find(self.models.pages[p].el);
            fadePromises.push(new Promise((fulfill,reject) => {
                pageSection.fadeOut(delay, () => fulfill());
            }));
        }

        if(activeIndex === -1){
            pageName = "Error";
            activeIndex = Object.keys(self.models.pages).indexOf(pageName); //default to error page on invalid tab
        }

        self.log("activeIndex", activeIndex);
        self.tabBars.forEach(tabBar => tabBar.activeTabIndex = activeIndex);
        
        if(!doNotPushState){
            window.history.pushState('pagechange', `JCCC - ${pageName}`, `./?link=${pageName}`); // from https://stackoverflow.com/questions/824349/modify-the-url-without-reloading-the-page
        }

        $('title').text(`JCCC - ${pageName}`);

        return Promise.all(fadePromises)
            .then(() => {
                return new Promise((fulfill,reject) => {
                    if(self.models.pages[pageName]){
                        pages.find(self.models.pages[pageName].el)
                            .animate({ scrollTop: 0 }, 0)
                            .fadeIn(delay, () => fulfill());
                    }else{
                        fulfill(); //don't do anything --> may change to showing error page?
                    }
                });
            }).then(() => self.log("Set page to",pageName));
    }

    function onPageLoad(evt){
        let doNotPushState = location.origin.indexOf(location.host) > -1 || evt;

        if(evt && evt.customPage){
            self.log("Local tab switch to", evt.customPage);
            setPageTo(evt.customPage, false);
        }else if (window.location.search.indexOf("?") > -1) { //auto set page based on url
            let parameters = window.location.search.slice(1).split("&"); // parameters split by &
            let data = {};
            for (let p of parameters) { // parse values from parameters
                let [key, value, extra] = p.split('=').map(decodeURIComponent);
                data[key] = value;
            }
            if (data.link) {
                self.log("Changing page to", data.link, doNotPushState);
                setPageTo(data.link, doNotPushState);
            } else {
                self.log("Going to home by default", data, doNotPushState);
                setPageTo('Home', doNotPushState);
            }
        } else {
            self.log("No parameters found. Going to home by default.", doNotPushState);
            setPageTo('Home', doNotPushState);
        }
    }

    return {
        setPageTo,
        onPageLoad
    };
}
