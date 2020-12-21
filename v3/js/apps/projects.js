"use strict";
function ProjectsApp(options = {}) {
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
                self.log("initialized project page");
                self.log(this);
            },
            methods: {
                search: function() {
                    self.log("filters", this.filters);
                },
                setFilterBool: function(){
                    this.filters.hasFilters = (this.filters.name && this.filters.name.length > 0) || (this.filters.language && Object.keys(this.filters.language).length > 0);
                },
                setNameFilter: function(name) {
                    self.log("Setting name filter to", name);
                    this.filters.name = name;
                    this.setFilterBool();
                },
                addLanguageFilter: function(language) {
                    self.log("Adding language filter for", language);
                    if(!this.filters.language){
                        this.filters.language = {};
                    }
                    this.filters.language[language] = true;
                    this.setFilterBool();
                },
                removeLanguageFilter: function(language) {
                    self.log("Removing language filter for", language);
                    if(!this.filters.language){
                        return;
                    }

                    delete this.filters.language[language];
                    if(Object.keys(this.filters.language).length === 0){
                        delete this.filters.language;
                    }
                    this.setFilterBool();
                },
                getDateDifference: function (earliest, latest) {
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
                    if (attributes.days < 1) {
                        msg += (attributes.hours !== 0) ? (attributes.hours.toString() + ((attributes.hours !== 1) ? " hours " : " hour ")) : "";
                        if (attributes.hours < 1) {
                            msg += (attributes.minutes !== 0) ? (attributes.minutes.toString() + ((attributes.minutes !== 1) ? " minutes " : " minute ")) : (attributes.seconds + " seconds");
                        }
                    }
                    // msg += (attributes.seconds !== 0) ? (attributes.seconds.toString() + ((attributes.seconds !== 1) ? " seconds, " : " second, ")) : "";
                    // msg += attributes.ms.toString() + ((attributes.ms !== 1) ? " milliseconds" : " millisecond");

                    return msg;
                },
                getFormattedDate: function(date){
                    let dateObj = new Date(date);
                    return dateObj.toDateString() + ` (${this.getDateDifference(dateObj, new Date())} ago)`;
                }
            },
            components: self.components
        });

        self.log(self.models);
    }

    function initComponents() {
        let nameSearch, languageBoxes = {}, nameButtons = {};
        self.components["name-search"] = {
            template: `
                <div class="mdc-form-field name-search">
                    <div class="mdc-text-field">
                        <input type="text" id="name-field" v-on:input="input" class="mdc-text-field__input">
                        <label class="mdc-text-field__label" for="name-field">Project Name</label>
                        <div class="mdc-text-field__bottom-line"></div>
                    </div>
                </div>
            `,
            mounted: function(){
                nameSearch = new mdc.textField.MDCTextField(this.$el);
                self.log("[name-search]",nameSearch);
            },
            methods: {
                input: _.debounce(function(e) {
                    self.log("[name-search]", "input detected", nameSearch.value);
                    this.$emit("namechange", nameSearch.value);
                }, 500),
            }
        };

        self.components["language-checkbox"] = {
            props: ['language'],
            template: `
                <div class="language-checkbox mdc-form-field">
                    <div class="mdc-checkbox">
                        <input @change="input" type="checkbox" :id="language" class="mdc-checkbox__native-control"/>
                        <div class="mdc-checkbox__background">
                            <svg class="mdc-checkbox__checkmark"
                                viewBox="0 0 24 24">
                                <path class="mdc-checkbox__checkmark__path"
                                    fill="none"
                                    stroke="white"
                                    d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
                            </svg>
                            <div class="mdc-checkbox__mixedmark"></div>
                        </div>
                    </div>

                    <label :for="language">{{ language }}</label>
                </div>
            `,
            created: function() {
                // self.log(this);
            },
            methods: {
                input: function(e){
                    self.log("[language-checkbox]", e.target.checked, this.language);
                    this.$emit(e.target.checked ? "addlanguage" : "removelanguage", this.language);
                }
            }
        };

        self.components["radio-button"] = {
            props: ['value', 'groupname', 'actualname'],
            template: `
                <div class="mdc-form-field">
                    <div class="mdc-radio">
                        <input class="mdc-radio__native-control" type="radio" :id="value" v-bind:name="groupname" :value="value">
                        <div class="mdc-radio__background">
                            <div class="mdc-radio__outer-circle"></div>
                            <div class="mdc-radio__inner-circle"></div>
                        </div>
                    </div>
                    <label :for="value">{{ actualname }}</label>
                </div>
            `,
            mounted: function() {
                nameButtons[`${this.groupname}/${this.actualname}`] = new mdc.radio.MDCRadio(this.$el);
                
                self.log("[radio-button]",this,nameButtons);
            }
        };
    }

    return {};
}