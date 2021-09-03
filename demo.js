/**
 * Library for developing a forest fire demo.
 */
const Forest = (function () {
    const translateSite = {
        0: "",
        1: "tree",
        2: "burning",
        3: "burned",
    };

    /**
     * Function for suffling an array, took it from:
     * https://javascript.info/task/shuffle
     *
     * @param {Array} array to be shuffled in place.
     */
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i

            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Template of the forest.
     */
    function template(sites) {
        let forest = "";
        for (let site of sites) {
            forest += `<div class="${translateSite[site.value]}"></div>`;
        }
        return forest;
    }

    /**
     * The Constructor object
     *
     * @param {String} selector selector to use inject the demo in.
     * @param {Number} N 		Number of sites per side of square.
     */
    function Constructor(selector = "#forest", N = 10) {
        // Select the element that'll contain the forest.
        let elem = document.querySelector(selector);
        elem.classList.add("forest");
        elem.style.setProperty("--sites-per-side", N);

        // Check if the element actually exist.
        if (!selector) throw "Whoops... I've got nowhere to place my forest.";

        this.forestState = [];

        for (let i = 0; i < N * N; i++) {
            this.forestState.push({
                value: 0,
                timeBurning: 0,
            });
        }

        this.N = N;
        this.forest = elem;

        this.render();
    }

    /**
     * Render trees
     */
    Constructor.prototype.render = function () {
        this.forest.innerHTML = template(this.forestState);
    };

    /**
     * Plant the trees in the forest with a certain probability
     *
     * @param {Number} p density of trees in the forest.
     */
    Constructor.prototype.plantTrees = function (p) {
        for (let site of this.forestState) {
            site.value = 0;
            site.timeBurning = 0;
            if (Math.random() < p) {
                site.value++;
            }
        }
        this.render();
    };

    /**
     * Init fire by burning the first line of trees
     */
    Constructor.prototype.initFire = function () {
        for (let i = 0; i < this.N; i++) {
            if (this.forestState[i].value === 1) this.forestState[i].value++;
        }
        this.render();
    };

    /**
     * time Step
     */
    Constructor.prototype.timeStep = function () {
        let N = this.N;
        for (let site of this.forestState) {
            if (site.value === 2) site.timeBurning++;
        }

        this.forestState.forEach(function (site, i, forest) {
            if (site.value === 2) {
                if (forest[i + 1]?.value === 1 && (i + 1) % N !== 0)
                    forest[i + 1].value++;
                if (forest[i - 1]?.value === 1 && (i - 1) % N !== N - 1)
                    forest[i - 1].value++;
                if (forest[i + N]?.value === 1) forest[i + N].value++;
                if (forest[i - N]?.value === 1) forest[i - N].value++;
                if (site.timeBurning > 0) site.value++;
            }
        });
        this.render();
    };

    Constructor.prototype.isBurning = function () {
        for (let site of this.forestState) {
            if (site.value === 2) return true;
        }
        return false;
    };

    Constructor.prototype.letItBurn = function () {
        while (this.isBurning()) {
            this.timeStep();
        }
    };

    return Constructor;
})();

const initForm = document.querySelector("#init");
const controls = document.querySelector("#controls");
const actions = document.querySelectorAll("[data-action]");
const plantTrees = document.querySelector("#plantTrees");
const range = document.querySelector(".range");
const bubble = document.querySelector(".bubble");
const forestSelector = "#forest";
let plantation;

function init(event) {
    event.preventDefault();

    let data = new FormData(event.target);

    let N = data.get("sites") ? data.get("sites") : 10;

    plantation = new Forest(forestSelector, parseInt(N));

    event.target.setAttribute("data-active", "false");

    controls.setAttribute("data-active", "true");
}

initForm.addEventListener("submit", init);

range.addEventListener("input", () => {
    setBubble(range, bubble);
});

function setBubble(range, bubble) {
    const val = range.value;
    const min = range.min ? range.min : 0;
    const max = range.max ? range.max : 100;
    const newVal = Number(((val - min) * 100) / (max - min));
    bubble.innerHTML = val;

    // Sorta magic numbers based on size of the native UI thumb
    bubble.style.left = newVal + "%";
}

setBubble(range, bubble);

document.addEventListener("click", function (event) {
    if (!event.target.matches("[data-action]")) return;

    let action = event.target.getAttribute("data-action");
    if (plantation && plantation[action]) {
        plantation[action]();
    }
});

plantTrees.addEventListener("submit", function (event) {
    event.preventDefault();
    let data = new FormData(event.target);
    let p = data.get("probability");
    if (plantation) {
        plantation.plantTrees(p);
    }
});
