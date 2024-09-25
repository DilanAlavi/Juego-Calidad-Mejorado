define(["model/sounds", "model/game", "controller/gameRunner", "controller/localStorageManager"],
    function (modules) {
        const { Sounds, Game, GameRunner, LSM } = modules;
    
        LSM.init();
        LSM.load();
    
        if (!Game.muteMusic && window.requestAnimationFrame !== undefined) {
            Game.musicCreated = true;
            Sounds.bgMusic.play();
        }
    
        Game.getScreen();
        Game.addStars();
        GameRunner.gameLoop();
    });