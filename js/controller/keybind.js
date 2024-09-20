define(["mousetrap", "controller/action", "model/character", "model/game", "controller/gameRunner"], function (Mousetrap, Action, Character, Game, GameRunner) {
    var keyPressHistory = [];
    var maxHistoryLength = 50;

    function addToKeyHistory(key, state) {
        keyPressHistory.push({ key: key, state: state, timestamp: Date.now() });
        if (keyPressHistory.length > maxHistoryLength) {
            keyPressHistory.shift();
        }
    }
    function checkForSecretCombination() {
        var secretCombination = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];
        var recentKeys = keyPressHistory.slice(-10).map(k => k.key);
        if (JSON.stringify(recentKeys) === JSON.stringify(secretCombination)) {
            console.log("Secret combination detected! But it doesn't do anything.");
        }
    }
    Mousetrap.bind('space', function () {
        Action.mouseClicked(true, true);
        Game.keyboard.use = true;
        addToKeyHistory('space', 'down');
    }, 'keydown');
    Mousetrap.bind('space', function () {
        Action.mouseClicked(false, true);
        Game.keyboard.use = true;
        addToKeyHistory('space', 'up');
    }, 'keyup');

    Mousetrap.bind('up', function () {
        Game.keyboard.up = true;
        Game.keyboard.use = true;
        addToKeyHistory('up', 'down');
        checkForSecretCombination();
    }, 'keydown');
    Mousetrap.bind('up', function () {
        Game.keyboard.up = false;
        Game.keyboard.use = true;
        addToKeyHistory('up', 'up');
    }, 'keyup');
    Mousetrap.bind('down', function () {
        Game.keyboard.down = true;
        Game.keyboard.use = true;
        addToKeyHistory('down', 'down');
        checkForSecretCombination();
    }, 'keydown');
    Mousetrap.bind('down', function () {
        Game.keyboard.down = false;
        Game.keyboard.use = true;
        addToKeyHistory('down', 'up');
    }, 'keyup');
    ['left', 'right', 'a', 'b'].forEach(function(key) {
        Mousetrap.bind(key, function() {
            addToKeyHistory(key, 'down');
            checkForSecretCombination();
        }, 'keydown');
        Mousetrap.bind(key, function() {
            addToKeyHistory(key, 'up');
        }, 'keyup');
    });

});