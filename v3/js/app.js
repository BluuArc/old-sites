"use strict";

var jcccApp = jcccApp || new JCCCApp();

var debug = debug || {};

function JCCCApp(options = {}) {
    let self = {
        models: { //data goes here
            pageController: {
                activePage: "Home",
                pages: {
                    'Home': {
                        el: '.page#home',
                        isActive: true
                    },
                    'Projects': {
                        el: '.page#projects',
                        isActive: false
                    },
                    'Contact': {
                        el: '.page#contact',
                        isActive: false
                    },
                    'Error': {
                        el: '.page#error',
                        isHidden: true,
                        isActive: false
                    }
                }
            },
            home: {
                closestCard: ""
            },
            projects: {
                filters: {}
            },
            contact: {}
        },
        views: {},
        apps: {
            pageController: null,
            homePage: null,
            projects: null,
            contact: null   
        },
        debugMode: location.host === "127.0.0.1" || location.host.indexOf("localhost") > -1,
        log: (...args) => {
            if(self.debugMode){
                console.log(...args);
            }
        }
    };

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
    function appendScriptsIteratively(urls) {
        function recursive_append(fulfillFn, rejectFn) {
            if (urls.length === 0) {
                fulfillFn();
            } else {
                const url = urls.shift();
                return appendScript(url)
                    .then(() => recursive_append(fulfillFn, rejectFn))
                    .catch(rejectFn);
            }
        }

        return new Promise((fulfill, reject) => {
            recursive_append(fulfill, reject);
        });
    }

    function init() {
        const appDirectory = "js/apps";
        let scripts = [
            `${appDirectory}/pageController.js`, `${appDirectory}/home.js`, 
            `${appDirectory}/contact.js`, `${appDirectory}/projects.js`,
            `${appDirectory}/errorPage.js`
        ];
        initComponents();
        return appendScriptsIteratively(scripts) //append app scripts
            .then(initializeData)
            .then(initializeApps)
            .then(() => {
                if (self.debugMode) {
                    debug.setPageTo = self.apps.pageController.setPageTo;
                }

                // setup handlers for tab switching outside of pageController tabBar
                $('a[href^="./?"][href*="link="]').on('click', function (e) {
                    e.preventDefault();
                    self.log("Handling custom tab switch event",e);

                    let link = $(this).attr("href");
                    let parameters = link.slice(3).split("&");
                    let data = {};
                    for (let p of parameters) {
                        let [key, value, extra] = p.split('=').map(decodeURIComponent);
                        data[key] = value;
                    }
                    
                    if (data.link) {
                        self.apps.pageController.onPageLoad({customPage: data.link});
                    }
                });

                self.apps.pageController.onPageLoad();
            }).then(() => self.log("Finished full initialization"));
    }

    function initializeApps(params) {
        self.apps.pageController = new PageController({
            log: (...args) => self.log("[PageController]", ...args),
            models: self.models.pageController,
            appParams: {
                el: "section#nav-app",
                data: self.models.pageController
            }
        });

        self.apps.homePage = new HomeApp({
            log: (...args) => self.log("[HomePage]", ...args),
            models: self.models.home,
            appParams: {
                el: "#home.page",
                data: self.models.home
            }
        });

        self.apps.contactPage = new ContactApp({
            log: (...args) => self.log("[ContactPage]", ...args),
            models: self.models.contact,
            appParams: {
                el: "#contact.page",
                data: self.models.contact
            }
        });

        self.apps.projectPage = new ProjectsApp({
            log: (...args) => self.log("[ProjectPage]", ...args),
            models: self.models.projects,
            appParams: {
                el: "#projects.page",
                data: self.models.projects
            }
        });

        self.apps.errorPage = new ErrorPage({
            log: (...args) => self.log("[ErrorPage]", ...args),
            appParams: {
                el: "#error.page"
            }
        });
    }

    // for global components
    function initComponents() {
        self.log("Initializing components");
        let card = Vue.component('card', {
            template: `
                <div class="mdc-card mdc-card--theme-dark">
                    <slot>
                        <section class="mdc-card__primary">
                            <h1 class="mdc-card__title mdc-card__title--large">Card Component</h1>
                        </section>
                        <section class="mdc-card__supporting-text">
                            This card component has no content
                        </section>
                    </slot>
                </div>
            `
        });

        let languageSection = Vue.component("language-section", {
            props: ["project", "languages"],
            computed: {
                languageData: function(){
                    // convert size data to percentages
                    let languages = (this.languages) ? this.languages.slice() : this.project.languages.slice();
                    if(this.project)
                        this.log("project languages for", this.project.name , this.project.languages);
                    else{
                        this.log("project languages for given array", this.languages);
                    }
                    let maxSize = languages.reduce((acc, current) => acc + current.size, 0);
                    let cumulativeSize = 0.0; // used for "stacking" of bars
                    let languageData = languages
                        .sort((a, b) => b.size - a.size)
                        .map(d => {
                            let actualSize = d.size / maxSize;
                            let barSize = cumulativeSize + actualSize;
                            cumulativeSize += actualSize;
                            return {
                                actualSize,
                                barSize,
                                name: d.name,
                                color: d.color
                            }
                        }).reverse();
                    return languageData;
                }
            },
            methods: {
                scaleX: function (size) {
                    return `scaleX(${size})`;
                },
                toFixed: function(number){
                    return (number*100).toFixed(2);
                },
                showProjectsWithLanguage: function(language){
                    this.log("TODO: Implement language filtering for", language.name);
                },
                log: function (...args) {
                    self.log("[language-section]", ...args);
                }
            },
            template: `
                <span v-if="languageData.length > 0">
                    <div role="progressbar" class="mdc-linear-progress languageEntry">
                        <template v-for="lang in languageData">
                            <div class="mdc-linear-progress__bar" :style="{ transform: scaleX(lang.barSize) }" :language="lang.name">
                                <span class="mdc-linear-progress__bar-inner" :style="{ backgroundColor: lang.color }"></span>
                            </div>
                        </template>
                    </div>
                    <div class="mdc-layout-grid" id="languages">
                        <div class="mdc-layout-grid__inner">
                            <div v-for="lang in languageData.reverse()" class="mdc-layout-grid__cell mdc-layout-grid__cell--span-3 mdc-layout-grid__cell--span-4-tablet mdc-layout-grid__cell--span-4-phone">
                                <button @click="showProjectsWithLanguage(lang)" class="mdc-button languageEntry text-center">
                                    <span class="mdc-button__icon languageCircle" :style="{ backgroundColor: lang.color }"></span>
                                    <span class="languageText">
                                        {{ lang.name }} ({{ toFixed(lang.actualSize) }}%)
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </span>
                <span v-else>
                    <div class="languageEntry">
                        <div class="text-center">
                            No languages found for this project.
                        </div>
                    </div>
                </span>
            `
        });
    }

    function getData(url) {
        return new Promise((fulfill, reject) => {
            try {
                $.get(url, data => fulfill(data))
                    .fail(err => reject(err));
            } catch (err) {
                reject(err);
            }
        });
    }

    async function initializeData() {
        await loadProjectData();
        await loadJobData();
        await loadCourseData();
        await loadContactData();
        return;
    }

    function loadJobData() {
        self.log("Loading job data");
        return getData("jobs.json").then(data => {
            // convert all desc arrays to strings
            self.models.home.workData = data.map(d => {
                if(Array.isArray(d.desc)){
                    d.desc = d.desc.join(" ");
                }
                return d;
            });
            return;
        });
    }

    function loadCourseData() {
        self.log("Loading course data");
        return getData("courses.json").then(data => {
            self.models.home.courseData = data;
            return;
        });
    }

    function loadProjectData() {
        self.log("Loading project data");
        let projectData = { //used by projects page and home page for project statistics
            projects: {}, //keyed by "owner/project-name"
            overall: {
                languages: [],
                ownership: [],
                count: {
                    total: 0,
                    mine: 0
                }
            },
            user: {}
        };
        return getData("project-data.json").then(data => {
            // aggregation objects
            // TODO: implement techData aggregation
            let languageData = {}, techData = {}, ownershipData = {};
            
            // process data
            Object.keys(data)
                .sort((a, b) => new Date(data[b].lastPushedAt) - new Date(data[a].lastPushedAt)) //order by most recent first
                .map(k => { // add data in order of sorted keys

                    // save project data
                    projectData.projects[k] = data[k];

                    // keep track of languages over all projects
                    for (let lang of data[k].languages) {
                        if (!languageData[lang.name]) {
                            languageData[lang.name] = {
                                name: lang.name,
                                color: lang.color,
                                size: 0
                            };
                        }
                        languageData[lang.name].size += lang.size;
                    }

                    //count number of projects owned by that person
                    if (!ownershipData[data[k].owner]) {
                        ownershipData[data[k].owner] = 0;
                    }
                    ownershipData[data[k].owner]++;
                    
                    projectData.overall.count.total++;
                });

            //convert aggregated objects to arrays
            Object.keys(languageData)
                .sort((a, b) => languageData[b].size - languageData[a].size) //sort in descending order by size
                .map(lang => projectData.overall.languages.push(languageData[lang]));

            Object.keys(ownershipData)
                .sort((a, b) => ownershipData[b] - ownershipData[a]) // sort alphabetically
                .map(owner => {
                    projectData.overall.ownership.push({
                        name: owner,
                        count: ownershipData[owner]
                    });
                    if (owner === "BluuArc") {
                        projectData.overall.count.mine = ownershipData[owner];
                    }
                });

            // save data into models
            self.models.home.projectData = projectData.overall;
            self.models.projects.projectData = projectData;
            return;
        }).then(() => { //attempt to get GH user data
            return getData("https://api.github.com/users/BluuArc")
                .then((data) => {
                    projectData.user = data;
                }).catch((err) => {
                    console.error(err);
                    self.log("Deleting user field");
                    delete projectData.user;
                    return;
                })
        });
    }

    function loadContactData() {
        self.log("Loading contact data");

        self.models.contact.links = [
            {
                name: "GitHub",
                bgColor: "var(--mdc-theme-background-light)",
                icon: "img/GitHub-Mark-Light-120px-plus.png",
                link: "https://github.com/BluuArc"
            },
            {
                name: "LinkedIn",
                bgColor: "var(--mdc-theme-background-light)",
                icon: "img/In-White-128px-R.png",
                link: "https://www.linkedin.com/in/joshuacastor"
            },
            {
                name: "Email",
                bgColor: "var(--mdc-theme-background-light)",
                icon: "img/ic_email_white_48dp_2x.png",
                link: "mailto:jcasto3@uic.edu"
            },
            {
                name: "EVL",
                bgColor: "var(--mdc-theme-background-light)",
                icon: "img/evl.png",
                link: "https://www.evl.uic.edu/entry.php?id=2302"
            }
        ];

        return Promise.resolve();
    }

    return {
        init
    };
}
