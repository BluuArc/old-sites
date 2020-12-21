"use strict";
function HomeApp(options = {}) {
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
                self.log("initialized home page");
            },
            methods: {
                setToolbarTitle
            },
            components: self.components
        });
    }

    function setToolbarTitle(title = "") {
        let toolbar = $("#titleBar");
        let animPromise = Promise.resolve();
        if(self.models.closestCard.length === 0 && title.length > 0){
            toolbar.fadeIn(250);
        }else if(self.models.closestCard.length > 0 && title.length === 0){
            animPromise = (() => {
                return new Promise((fulfill, reject) => { toolbar.fadeOut(250, fulfill); } );
            })();
        }

        animPromise.then(() => {
            self.models.closestCard = title;
        });
    }

    function initComponents() {
        let cardTitles, startCard, endCard;
        self.components["floating-title-toolbar"] = {
            props: ['title'],
            data: function(){
                return {
                    page: $("section.pages").get(0)
                };
            },
            template: `
                <header class="mdc-toolbar mdc-toolbar--fixed" id="titleBar" v-show="title.length > 0">
                    <div class="mdc-toolbar__row" :startCard="getStartCard()" :endCard="getEndCard()">
                        <section class="mdc-toolbar__section mdc-toolbar__section--align-start">
                            <button class="mdc-button"><i class="material-icons mdc-button__icon" v-show="title != getStartCard()" @click="scrollToPrev">keyboard_arrow_up</i></button>
                        </section>
                        <section class="mdc-toolbar__section">
                            <span class="mdc-toolbar__title">{{ title }}</span>
                        </section>
                        <section class="mdc-toolbar__section mdc-toolbar__section--align-end">
                            <button class="mdc-button"><i class="material-icons mdc-button__icon" v-show="title != getEndCard()" @click="scrollToNext">keyboard_arrow_down</i></button>
                        </section>
                    </div>
                </header>
            `,
            methods: {
                handleScroll: function(e) {
                    if(!cardTitles){
                        return;
                    }

                    let scrollPosition = this.page.scrollTop;
                    let activeCard = "";
                    Object.keys(cardTitles).forEach((title) => {
                        if(scrollPosition >= cardTitles[title]){
                            activeCard = title;
                        }
                    });
                    this.$emit("changecard", activeCard);
                },
                setCardTitles: function () {
                    self.log("Setting card titles");
                    cardTitles = {};
                    let cardSelections = $(".page#home .mdc-card");
                    cardSelections.each(function () {
                        let curCard = $(this);
                        let title = curCard.find(".mdc-card__primary .mdc-card__title").text();
                        cardTitles[title] = curCard.get(0).offsetTop;
                    });
                },
                getStartCard: function() {
                    if (!cardTitles) return "a";
                    if (startCard) return startCard;

                    startCard = Object.keys(cardTitles)[0];
                    return startCard;
                },
                getEndCard: function () {
                    if (!cardTitles) return "a";
                    if (endCard) return endCard;

                    let titles = Object.keys(cardTitles);
                    self.log("cardTitles", titles);
                    endCard = titles[titles.length - 1];
                    return endCard;
                },
                scrollToPrev: function () {
                    if(this.title.length === 0){
                        return;
                    }

                    let keys = Object.keys(cardTitles);

                    let index = keys.findIndex(v => v === this.title);
                    if(index <= 0){
                        this.scrollTo(0);
                    }else{
                        this.scrollTo(cardTitles[keys[index - 1]]+1);
                    }
                },
                scrollToNext: function () {
                    let keys = Object.keys(cardTitles);

                    let index = keys.findIndex(v => v === this.title);
                    if (index < 0) {
                        this.scrollTo(cardTitles[keys[0]]);
                    }else if(index >= keys.length - 1){
                        this.scrollTo(cardTitles[keys[keys.length - 1]]+1);
                    }else {
                        this.scrollTo(cardTitles[keys[index + 1]]+1);
                    }
                },
                scrollTo: function (position = 0) {
                    $(this.page).animate({
                        scrollTop: +position
                    }, 250);
                    self.log("Scrolling to",position);
                }
            },
            mounted: function(){
                this.setCardTitles();
                $("#titleBar .mdc-button").each(function(){
                    mdc.ripple.MDCRipple.attachTo(this);
                });
            },
            created: function () {
                window.addEventListener('scroll', this.handleScroll, true);
                window.addEventListener('resize', this.setCardTitles, true);
            },
            destroyed: function () {
                window.removeEventListener('scroll', this.handleScroll, true);
                window.removeEventListener('resize', this.setCardTitles, true);
            },
        };
    }

    return {};
}