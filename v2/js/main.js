"use strict";

var jccc = jccc || new JCCC_App();

(function (postLoadFn) {
    let customComponents = function(){
        let table = Vue.component("bs-table", {
            props: ["thead-class","rows","names"],
            template:   `<table>
                            <thead class="bg-secondary">
                                <tr>
                                    <th class="text-center" v-for="name in names">{{ name }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-for="row in rows">
                                    <tr>
                                        <td class="align-middle" v-for="column in row" v-html="column"></td>
                                    </tr>
                                </template>
                            </tbody>
            
                        </table>`
        });

        let job_entry = Vue.component("job-entry", {
            props: ["job"],
            template:   `<div class="card-block">  
                            <div class="row">
                                <div class="col">
                                    <h4 class="card-title row">{{ job.name }}</h4>
                                    <h5 class="card-title row">{{ job.company }} | {{ job.location }}</h5>
                                </div>
                                <div class="col text-right">
                                    <h5 class="text-muted">{{ job.time }}</h5>
                                </div>
                            </div>
                            <div class="row">
                                <div class="card-block">
                                    <div class="card-text" v-html="job.desc">
                                    </div>
                                </div>
                            </div>
                            

                        </div>`
        });

        let job_list = Vue.component("job-list", {
            props: ["jobs"],
            template:   `<ul class="list-group list-group-flush job-list">
                            <template v-for="job in jobs">
                                <li class="list-group-item border-primary border-left-0 border-right-0 border-bottom-0">
                                    <job-entry :job="job"></job-entry>
                                </li>
                            </template>
                        </ul>`,
        });

        // separate applications are necessary to separate data; may refactor in future
        let courseworkApp = new Vue({
            el: "#courseworkCard",
            data: {
                courses: [
                    ["Program Design I (CS111)", "Java", "Fall 2015"],
                    ["Program Design II (CS141)", "C, C++", "Spring 2016"],
                    ["Mathematical Foundations of Computing (CS151)", "Tarski's World", "Spring 2016"],
                    ["Programming Practicum (CS211)", "C, Java", "Fall 2016"],
                    ["Data Structures (CS251)", "C, C++", "Fall 2016"],
                    ["Machine Organization (CS261)", "C, y86", "Fall 2016"],
                    ["Languages and Automata (CS301)", "JFLAP", "Spring 2017"],
                    ["Programming Language Design and Implementation (CS341)", "C++, F#, C#, SQL", "Spring 2017"],
                    ["Software Design (CS342)", "Java, Raspberry Pi, Node.js, design patterns", "Spring 2017"],
                    ["Computer Systems (CS361)", "C, pipelining, threading", "Spring 2017"],
                    ["Computer Design (CS362)", "C, Arduino", "Fall 2017"],
                    ["Communication and Ethical Issues in Computing (CS377)", "", "Fall 2017"],
                    ["Software Engineering I (CS440)", "Requirements Analysis, UML Diagrams", "Fall 2017"],
                    ["Computer Algorithms I (CS401)", "Algorithm Analysis", "Fall 2017"],
                    ["Undergraduate Research (CS398)", "JavaScript, D3.js, Leaflet", "Fall 2017"]
                ],
                columnNames: ["Course Name", "Languages/Technologies/Techniques", "Semester"]
            }
        }); 
        jccc.addApplication(courseworkApp,"coursework");

        let jobEntryApp = new Vue({
            el: "#workExperienceCard",
            data: {
                jobs: [ //in reverse chronological order
                    { 
                        name: "Research Experience Undergraduate",
                        location: "Chicago, IL",
                        company: "University of Illinois at Chicago",
                        time: "May 2017 - Dec 2017",
                        desc: `Designed a web-based tool to submit as an entry to VAST Challenge 2017. 
                            Collaborated with a group of 4 to develop and deploy a web-based service for Englewood. 
                            Learned how to develop and deploy Unity applications for CAVE2.<br>
                            <b>Relevant Projects</b>
                            <ul>
                                <li>VAST Challenge 2017: <a target="_blank" href="https://github.com/BluuArc/vast-challenge-2017">Repo</a> | <a target="_blank" href="https://bluuarc.github.io/vast-challenge-2017/challenge-2/">Demo</a></li>
                                <li>Bubbles TacTile Demo: <a target="_blank" href="https://github.com/BluuArc/bubbles-tactile-demo">Repo</a> | <a target="_blank" href="https://bluuarc.github.io/bubbles-tactile-demo/">Demo</a></li>
                                <li>Three.js Point Cloud Project: <a target="_blank" href="https://github.com/BluuArc/three.js-point-cloud-project">Repo</a> | <a target="_blank" href="https://bluuarc.github.io/three.js-point-cloud-project/">Demo</a></li>
                            </ul>` 
                    },
                    {
                        name: "Research Intern",
                        location: "Chicago, IL",
                        company: "University of Illinois at Chicago",
                        time: "Summer 2016",
                        desc: `Tested multiple websites to see which accessible web-commands are necessary for normal usage by disabling certain web standards and elements. 
                            Saved and analyzed data with Google Sheets.`
                    },
                    {
                        name: "Sophomore Level Student Peer Tutor",
                        location: "Chicago, IL",
                        company: "University of Illinois at Chicago",
                        time: "Jan 2017 - May 2017",
                        desc: `Tutored an average of 5 students per week in classes of Programming Practicum, Data Structures, and Machine Organization; included material in C and Java.`
                    },
                    {
                        name: "Freshman Level Student Peer Tutor",
                        location: "Chicago, IL",
                        company: "University of Illinois at Chicago",
                        time: "Aug 2016 - Dec 2016",
                        desc: `Tutored students in classes of Intro to Programming and Program Design; included material in C and Python.`
                    },
                ]
            }
        });
        jccc.addApplication(jobEntryApp, "jobEntries");

        function getDateDifference(earliest,latest) {
            const difference = new Date(latest - earliest);
            let attributes = {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                ms: 0
            };

            //conversion from this to milliseconds
            const constants = {
                ms: 1,
                seconds: 1000,
                minutes: 1000 * 60,
                hours: 1000 * 60 * 60,
                days: 1000 * 60 * 60 * 24
            };

            let divide = function (numerator, denominator) {
                return {
                    quotient: parseInt(numerator / denominator),
                    remainder: numerator % denominator
                };
            };

            //convert time in ms to various attributes
            let total = difference.getTime();
            for (const a in attributes) {
                if (total > constants[a]) {
                    let results = divide(total, constants[a]);
                    attributes[a] = results.quotient;
                    total = results.remainder;
                }
            }

            let msg = "";
            msg += (attributes.days !== 0) ? (attributes.days.toString() + ((attributes.days !== 1) ? " days " : " day ")) : "";
            if(attributes.days < 1){
                msg += (attributes.hours !== 0) ? (attributes.hours.toString() + ((attributes.hours !== 1) ? " hours " : " hour ")) : "";
                if(attributes.hours < 1){
                    msg += (attributes.minutes !== 0) ? (attributes.minutes.toString() + ((attributes.minutes !== 1) ? " minutes " : " minute ")) : (attributes.seconds + " seconds");
                }
            }
            // msg += (attributes.seconds !== 0) ? (attributes.seconds.toString() + ((attributes.seconds !== 1) ? " seconds, " : " second, ")) : "";
            // msg += attributes.ms.toString() + ((attributes.ms !== 1) ? " milliseconds" : " millisecond");

            return msg;
        };

        let languageSection = Vue.component("language-section", {
            props: ["project"],
            computed: {
                languageData: function () {
                    // convert size data to percentages
                    let maxSize = this.project.languages.reduce((acc, current) => acc + current.size, 0);
                    let languageData = this.project.languages.map((d) => {
                        d.barSize = ((d.size / maxSize) * 100).toFixed(2);
                        return d;
                    });
                    return languageData;
                }
            },
            template: `
                <span v-if="languageData.length > 0">
                    <div class="progress">
                        <template v-for="lang in languageData">
                            <div class="progress-bar" role="progressbar" :style="{ backgroundColor: lang.color, width: lang.barSize + '%' }" :aria-valuenow="lang.barSize" aria-valuemin="0" aria-valuemax="100"></div>                            
                        </template>
                    </div>
                    <div class="row" id="languages">
                        <template v-for="lang in languageData">
                            <div class="col-12 col-md-4 col-lg-3 languageEntry">
                                <div class="row">
                                    <div class="col-1">
                                        <div class="languageCircle" :style="{ backgroundColor: lang.color }"></div>
                                    </div>
                                    <div class="col text-center">
                                        {{ lang.name }} ({{ lang.barSize }}%)
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </span>
                <span v-else>
                    <div class="languageEntry">
                        <div class="row">
                            <div class="col text-center">
                                No languages found for this project.
                            </div>
                        </div>
                    </div>
                </span>
            `
        })

        let project_entry = Vue.component("project-entry", {
            props: ["project"],
            computed: {
                name: function () {
                    let name = this.project.name;
                    if(this.project.name !== this.project.repoName){
                        name += `(${this.project.repoName})`;
                    }
                    return name;
                },
                creationDate: function () {
                    let creationDate = new Date(this.project.createdAt);
                    return creationDate.toDateString() + ` (${getDateDifference(creationDate,new Date())} ago)`;
                },
                commitDate: function () {
                    let commitDate = new Date(this.project.lastPushedAt);
                    return commitDate.toDateString() + ` (${getDateDifference(commitDate, new Date())} ago)`;
                },
                description: function () {
                    return this.project.description || "No description specified.";
                },
                authorLink: function () {
                    return this.project.authorURL || `https://github.com/${this.project.owner}/`;
                },
            },
            template: `
                <card class="projectEntry border-primary">
                    <div class="card-header">
                        <div class="container">
                            <div class="row">
                                <div class="col-md-9 col-12" id="repoURLContainer">
                                    <a :href="project.repoURL" id="repoURL">
                                        <h4 id="name">{{ name }}</h4>
                                    </a>
                                </div>
                                <div v-if="project.homepageURL" class="col-md-3 col-12 text-right">
                                    <a :href="project.homepageURL" id="homepageURL" class="btn btn-outline-success text-center">
                                        <h6><span>Project Page</span> <i class="fa fa-external-link" aria-hidden="true"></i></h6>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-block">
                        <div class="container">
                            <div class="row">
                                <div class="col-md-6 col-xs-12 card-text">
                                    <p id="description">
                                        {{ description }}
                                    </p>
                                </div>
                                <div class="col-md-6 col-xd-12 card-text" id="project-statistics">
                                    <p id="owner-entry"><b>Owner: </b><a :href="authorLink"><span id="owner">{{ project.owner }}</span></a></p>
                                    <p id="creation-entry"><b>Created: </b><span id="createdAt">{{ creationDate }}</span></p>
                                    <p id="pushed-entry"><b>Last Commit: </b><span id="pushedAt">{{ commitDate }}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="project.topics.length > 0" class="card-block" id="topic-block">
                        <div class="container">
                            <div class="row">
                                <h6><b>Relevant Topics</b></h6>
                            </div>
                            <div class="row">
                                <template v-for="t in project.topics">
                                    <a :href="t.url" class="col-6 col-md-3"> {{ t.name }}</a>
                                </template>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <language-section :project="project"></language-section>
                    </div>
                </card>
            `
        })
        let projectData = {
            projects: {},
            overall: {},
            user: {}
        };

        let projectEntryApp;
        let getData = function(url){
            return new Promise((fulfill,reject) => {
                try {
                    $.get(url, (data) => {
                        fulfill(data);
                    });
                } catch (err) {
                    reject(err);
                }
            });
        }
        //load project data
        return getData("project-data.json").then((data) => {
            //order by most recent first
            let sortedKeys = Object.keys(data)
                .sort((a,b) => new Date(data[b].lastPushedAt) - new Date(data[a].lastPushedAt));
            // TODO: implement techData aggregation
            let languageData = {}, techData = {}, ownershipData = {};
            for(let k of sortedKeys){
                projectData.projects[k] = data[k];
                for(let lang of data[k].languages){
                    if(!languageData[lang.name]){
                        languageData[lang.name] = {
                            name: lang.name,
                            color: lang.color,
                            size: 0
                        };
                    }
                    languageData[lang.name].size += lang.size;
                }

                if(!ownershipData[data[k].owner]){
                    ownershipData[data[k].owner] = 0;
                }
                ownershipData[data[k].owner]++;
            }

            projectData.overall = {
                languages: [],
                ownership: [],
                count: {
                    total: sortedKeys.length,
                    mine: 0
                }
            };

            //convert aggregated objects to arrays
            let langKeys = Object.keys(languageData)
                .sort((a,b) => languageData[b].size - languageData[a].size); //sort in descending order by size
            for(let lang of langKeys){
                projectData.overall.languages.push(languageData[lang]);
            }

            let ownerKeys = Object.keys(ownershipData)
                .sort((a,b) => ownershipData[b] - ownershipData[a]);
            for(let owner of ownerKeys){
                projectData.overall.ownership.push({
                    name: owner,
                    count: ownershipData[owner]
                });
                if(owner === "BluuArc"){
                    projectData.overall.count.mine = ownershipData[owner];
                }
            }

            return;
        }).then(() => { //attempt to get GH user data
            return getData("https://api.github.com/users/BluuArc")
                .then((data) => {
                    projectData.user = data;
                }).catch((err) => {
                    console.error(err);
                    console.log("Deleting user field");
                    delete projectData.user;
                    return;
                })
        }).then(() => { //create overview data
            let [creationDate, updateDate] = [new Date(projectData.user.created_at), new Date(projectData.user.updated_at)];
            let currentDate = new Date();

            projectData.overview = {
                creationText: creationDate.toDateString() + ` (${getDateDifference(creationDate, currentDate)} ago)`,
                updateText: updateDate.toDateString() + ` (${getDateDifference(updateDate, currentDate)} ago)`,
            };

            return;
        }).then(() => {
            // console.log(projectData)
            projectEntryApp = new Vue({
                el: "#ProjectsPage",
                data: projectData
            });
            jccc.addApplication(projectEntryApp, "projectEntries");

            let projectStatsApp = new Vue({
                el: "#projectStatsCard",
                data: projectData
            });
            jccc.addApplication(projectStatsApp, "projectStats");
            return;
        });
    }


    jccc.init('Home',
        {
            initHeader: true,
            attachTrackers: true,
            initCustomVueComponents: () => { return initCommonCustomVueComponents(customComponents); },
            pageDivs: [
                {
                    name: "Home",
                    selector: ".page#HomePage"
                },
                {
                    name: "Projects",
                    selector: ".page#ProjectsPage"
                },
                {
                    name: "Contact",
                    selector: ".page#ContactPage"
                },   
            ],
            errorDiv: ".page#ErrorPage"
        },
        postLoadFn
    );
})(function(){ //run this after loading page
    let pageLoader = function (evt) {
        let doNotPushState = location.origin.indexOf(location.host) > -1 || evt;
        if(window.location.search.indexOf("?") > -1){ //auto set page based on url
            let parameters = window.location.search.slice(1).split("&");
            let data = {};
            for(let p of parameters){
                let [key,value,extra] = p.split('=').map(decodeURIComponent);
                data[key] = value;
            }
            // console.log(data);
            if(data.link){
                jccc.changeDisplayedPage(data.link, doNotPushState);
            }else{
                jccc.changeDisplayedPage('Home', doNotPushState); //default to home
            }
        } else {
            jccc.changeDisplayedPage('Home', doNotPushState); //default to home
        }
    };

    pageLoader();

    $(window).on("popstate",pageLoader);

    $('a[href^="/?"][href*="link="]').on('click', function (e){
        e.preventDefault();
        let link = $(this).attr("href");
        let parameters = link.slice(2).split("&");
        let data = {};
        for (let p of parameters) {
            let [key, value, extra] = p.split('=').map(decodeURIComponent);
            data[key] = value;
        }
        // console.log(data);
        if (data.link) {
            jccc.changeDisplayedPage(data.link);
        } else {
            jccc.changeDisplayedPage('Home'); //default to home
        }
    })

    console.log("Ready");
});