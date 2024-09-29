define(["model/game"], function (Game) {
    const init = function init() {
        if (typeof (Storage) !== "undefined") {
            const initializeStorageItem = (key, defaultValue) => {
                if (localStorage.getItem(key) === null) {
                    localStorage.setItem(key, defaultValue);
                }
            };
    
            initializeStorageItem("music", "true");
            initializeStorageItem("sfx", "true");
            initializeStorageItem("scout", "0");
            initializeStorageItem("fighter", "0");
            initializeStorageItem("interceptor", "0"); 
            initializeStorageItem("tank", "0");
            initializeStorageItem("transport", "0");
            initializeStorageItem("highscore", "0");
        } else {
            console.log("No local storage support");
        }
    };    

    const load = function load() {
        if (localStorage.getItem("music") === "true") {
            Game.muteMusic = false;
        } else {
            Game.muteMusic = true;
        }
        if (localStorage.getItem("sfx") === "true") {
            Game.muteSFX = false;
        } else {
            Game.muteSFX = true;
        }
        Game.highscore = parseInt(localStorage.getItem("highscore"));
        Game.scout = parseInt(localStorage.getItem("scout"));
        Game.fighter = parseInt(localStorage.getItem("fighter"));
        Game.interceptor = parseInt(localStorage.getItem("interceptor"));
        Game.tank = parseInt(localStorage.getItem("tank"));
        Game.transport = parseInt(localStorage.getItem("transport"));
    };

    const set = function set(k, v) {
        var key = String(k);
        var value = String(v);
        localStorage.setItem(key, value);
    };

    const get = function get(k) {
        var key = String(k);
        var value;
        value = localStorage.getItem(key);
        return value;
    };

    const LSM = {
        set: set,
        get: get,
        init: init,
        load: load
    };
    return LSM;
});