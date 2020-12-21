"use strict";

//globals for statcounter tracker
var sc_project = sc_project || 11034084;
var sc_invisible = sc_invisible || 1;
var sc_security = sc_security || "3e7dba9f";
var scJsHost = scJsHost || (("https:" == document.location.protocol) ? "https://secure." : "http://www.");

var jccc = jccc || new JCCC_App();

function JCCC_App(){
    let self = {
        components: {},
        debugMode: document.location.href.indexOf("github.io") === -1,
        data: {}
    };

    let public_vars = {};

    function debugLog(...args){
        if(self.debugMode){
            console.log('[DEBUG]',...args);
        }
    }

    function init(currentPageName, options = {}, afterLoadFn){
        self.currentPageName = currentPageName;
        self.afterLoadFn = afterLoadFn;
        self.options = options;
        self.pageDivs = options.pageDivs || [];
        self.errorDiv = options.errorDiv;
        return setupPage(currentPageName).then(() => {
            if(typeof(afterLoadFn) === 'function')
                return afterLoadFn();
        });
    }

    //pure javascript version of appending a script
    //based off of https://howchoo.com/g/mmu0nguznjg/learn-the-slow-and-fast-way-to-append-elements-to-the-dom
    function appendScript(url) {
        return new Promise(function (fulfill, reject) {
            let e = document.createElement('script');
            e.src = url;
            e.onload = () => { fulfill(); };
            e.onerror = reject;
            document.body.appendChild(e);
        });
    }

    // given an array of script urls, append them in order
    function appendScriptsIteratively(urls){
        function recursive_append(fulfillFn,rejectFn){
            if(urls.length === 0){
                fulfillFn();
            }else{
                const url = urls.shift();
                return appendScript(url)
                    .then(() => recursive_append(fulfillFn,rejectFn))
                    .catch(rejectFn);
            }
        }

        return new Promise((fulfill,reject) => {
            recursive_append(fulfill, reject);
        });
    }

    //load common scripts and trackers
    function setupPage(currentPageName){
        let setupOptions = self.options || {};
        const scripts = {
            jQuery: ["https://code.jquery.com/jquery-3.2.1.min.js"],
            bootstrap: ["https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js", "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-beta/js/bootstrap.min.js" ],
            other: [
                "https://cdnjs.cloudflare.com/ajax/libs/d3/4.2.6/d3.min.js",
                "https://cdnjs.cloudflare.com/ajax/libs/vue/2.4.4/vue.min.js",
                "js/custom-components.js"
            ]   

        };

        let body;

        //load jQuery first
        let curPromise = appendScript(scripts.jQuery[0])
            .then(() => {
                //load other scripts
                let loadPromises = [];
                for(let s in scripts){
                    if(s !== 'jQuery'){
                        loadPromises.push(appendScriptsIteratively(scripts[s]));
                    }
                }

                return Promise.all(loadPromises)
                    .then(() => { 
                        debugLog("Finished loading lib scripts");
                    }); //wait for all scripts to load
            }).then(() => {
                if(setupOptions.initHeader){
                    initHeader();
                }
                if(setupOptions.attachTrackers)  {
                    attachTrackers();
                }
                initBody();
            }).then(() => {
                if (typeof setupOptions.initCustomVueComponents === "function") { // allow for loading of custom components
                    return Promise.resolve(setupOptions.initCustomVueComponents());
                }else{
                    return Promise.resolve();
                }
            }).then(() =>{
                //create default page app
                debugLog("initializing app")
                self.components.default_app = new Vue({
                    el: self.options.header || "#pageApp",
                    data: self.data //updating self.data should update this as well
                });  
            }).then(() => {
                debugLog("Finished page initialization");
            });

        return curPromise;
    }

    function initBody(){
        debugLog("initializing body");

        // auto create a div with an offset from the nav header
        let body_content = Vue.component("jccc-body-content", {
            template:   `<div class="body-content">
                            <slot>No content found.</slot>
                        </div>`
        });
    }

    function changeHighlightedHeaderTab(newActiveName){
        $('#mainNavbarContainer #mainNavbar ul li')
            .each((i,d) => {
                let name = $(d).text();
                name === newActiveName ? $(d).addClass('active') : $(d).removeClass('active');
            });
    }

    function changeDisplayedPage(newActivePageName, doNotPush){
        debugLog("Changing displayed page to",newActivePageName);
        changeHighlightedHeaderTab(newActivePageName);
        if(!doNotPush){
            window.history.pushState('pagechange', `JCCC - ${newActivePageName}`, `./?link=${newActivePageName}`); // from https://stackoverflow.com/questions/824349/modify-the-url-without-reloading-the-page
        }
        $('title').text(`JCCC - ${newActivePageName}`);
        let isValid = false;
        let elemsToShow = [];
        let animLen = 250;
        for(let d of self.pageDivs){
            let elem = $(d.selector);
            isValid = isValid || (d.name === newActivePageName);
            (d.name === newActivePageName) ? elemsToShow.push(elem) : elem.fadeOut(animLen);
        }

        if (self.errorDiv) {
            isValid ? $(self.errorDiv).fadeOut(animLen) : elemsToShow.push($(self.errorDiv));
        }

        $("div#mainNavbar.navbar-collapse").collapse("hide");

        //wait for other animations to finish before showing new elements
        setTimeout(() => {
            scroll(0, 0); //go to top of page
            elemsToShow.map((d) => d.fadeIn(animLen));
        },animLen);

    }

    function initHeader(){
        debugLog("initializing header");
        let header_bar = Vue.component("jccc-nav-header",{
            data: function(){ 
                let data = {
                    brand: "JCCC",
                    brand_title: "Joshua Castor's Code Compendium",
                    links: {
                        Home: "/",
                        Projects: "/?link=Projects",
                        // Projects: "https://bluuarc.github.io/projects.html",
                        // "About Me": "https://bluuarc.github.io/about.html",
                        // Contact: "https://bluuarc.github.io/contact.html"
                        Contact: "/?link=Contact"
                    },
                    navlinks: []
                };

                for(let a in data.links){
                    data.navlinks.push({
                        class: {
                            'nav-item': true,
                            'active': a === self.currentPageName
                        },
                        href: data.links[a],
                        text: a,
                        click: (function(e) {
                            e.preventDefault();
                            changeDisplayedPage($(this).text());
                        })
                    });
                }

                return data;
            },
            computed: {
                lastUpdated: function () {
                    return new Date(self.data.lastUpdated || "1970-01-01").toDateString();
                }
            },
            template:   `<nav class="navbar navbar-toggleable-md navbar-inverse bg-primary fixed-top" id="mainNavbarContainer">
                            <button class="navbar-toggler navbar-toggler-right collapsed border-secondary" type="button" data-toggle="collapse" data-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
                                <span class="navbar-toggler-icon"></span>
                            </button>
                            <a class="navbar-brand" href="https://bluuarc.github.io" :title="brand_title">{{ brand }}</a>

                            <div class="collapse navbar-collapse" id="mainNavbar">
                                <ul class="navbar-nav mr-auto">
                                    <jccc-nav-link 
                                        v-for="link in navlinks"
                                        :info="link"
                                    ></jccc-nav-link>
                                </ul>
                                <hr class=".sm-only">
                                <!--<span class="navbar-text text-muted">Updated {{ lastUpdated }}</span>-->
                                <div id="contact-links" class="text-center">
                                    <a href="https://github.com/BluuArc/" target="_blank" title="GitHub Profile" class="navicon"><img style="max-height: 32px" src="img/GitHub-Mark-Light-32px.png"></a>
                                    <a href="https://www.linkedin.com/in/joshuacastor" target="_blank" title="LinkedIn Profile" class="navicon"><img style="max-height: 32px" src="img/In-White-34px-R.png"></a>
                                    <a href="https://www.evl.uic.edu/entry.php?id=2302" target="_blank" title="Electronics Visualization Laboratory Profile" class="navbar-text navicon">EVL</a>


                                </div>
                            </div>
                        </nav>`,
            
        });

        let header_link = Vue.component("jccc-nav-link", {
            props: ['info'],
            template:   `<li :class="info.class">
                            <a class="nav-link" :href="info.href">{{ info.text }}</a>
                        </li>`,
            mounted: function(){
                $(this.$el).on('click', this.info.click);
            }


        });
    }

    function attachTrackers(){
        debugLog("initializing tracker");
        let attachedScript = false;
        function addStatCounterScript(){
            if(!attachedScript){ //run only once
                attachedScript = true;
                return appendScript(`${scJsHost}statcounter.com/counter/counter.js`);
            }else{
                return Promise.resolve();
            }
        }

        let footer = Vue.component('jccc-tracker',{
            template: `<noscript><div class="statcounter"><a title="shopify site analytics" target="_blank" href="http://statcounter.com/shopify/"><img class="statcounter" alt="shopify site analytics" src="//c.statcounter.com/11034084/0/3e7dba9f/1/"></a></div></noscript>`,
            mounted: function(){
                addStatCounterScript();
                return;
            }
        });
    }

    function addApplication(app,name){
        self.components[name] = app;
    }

    public_vars.init = init;
    public_vars.addApplication = addApplication;
    public_vars.changeDisplayedPage = changeDisplayedPage;
    // if(self.debugMode){
    //     public_vars.components = self.components;
    // }
    return public_vars;
}
