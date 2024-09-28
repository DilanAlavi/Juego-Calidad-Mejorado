define(["model/game", "model/character", "model/inPlay", "model/canvas", "model/sounds", "model/images", "controller/localStorageManager"], function (Game, Character, InPlay, Canvas, Sounds, Images, LSM) {
    let timerInterval;
    const resetTimer = function resetTimer() {
        Game.timer = 0;
    };

    const clone = function(obj) {
        return Object.create(obj);
    };
    const startTimer = function startTimer() {
        setInterval(function () {
            if (Game.levelStarted) {
                Game.timer += 0.01;  
                GameLogic.addScore(2);  
            }
        }, 10);
    };

    const addScore = function addScore(add) {
        Character.ship.player.score += add;
    };

    const stopTimer = function stopTimer() {
        clearInterval(timerInterval);
    };

    const getTimer = function getTimer() {
        return Game.timer;
    };

    const timer = {
        reset: resetTimer,
        start: startTimer,
        stop: stopTimer,
        get: getTimer
    };

    const startLevel = function startLevel() {
        setTimeout(function () {
            if (!Game.muteSFX) {
                Sounds.levelUp.play();
            }
            Game.levelStarted = true;
            GameLogic.timer.start();
            GameLogic.addEnemies();
        }, 3000);
    };

    const checkEnemiesDead = function checkEnemiesDead() {
        let alive = 0;
        let enemies = InPlay.enemies;
        let i;
        if (enemies.length > 0 && !Game.gameOver) {
            for (i = 0; i < enemies.length; i++) {
                if (enemies[i].alive) {
                    alive++;
                }
            }
            if (alive === 0) {
                GameLogic.timer.stop();
                enemies.length = 0;
                Game.level++;
                Game.levelStarted = false;
                GameLogic.level.start();
            }
        }
    };

    const handlePlayerBulletCollision = function(bullet, enemies) {
        for (let enemy of enemies) {
            if (enemy.alive) {
                if (
                    bullet.x >= enemy.x &&
                    bullet.x <= enemy.x + enemy.width &&
                    bullet.y >= (enemy.y - 9) &&
                    bullet.y <= enemy.y + enemy.height
                ) {
                    bullet.alive = false;
                    enemy.hp -= bullet.damage;
                    if (enemy.hp <= 0) {
                        handleEnemyDeath(enemy);
                    }
                }
            }
        }
    };
    

    const handleEnemyDeath = function(enemy) {
        if (!Game.muteSFX) {
            Sounds.death.play();
        }
        enemy.alive = false;
        GameLogic.addScore(enemy.score);
    
        switch (enemy.name) {
            case "transport":
                GameLogic.dropPickUp(enemy.x, enemy.y);
                Game.transport += 1;
                break;
            case "scout":
                Game.scout += 1;
                break;
            case "fighter":
                Game.fighter += 1;
                break;
            case "interceptor":
                Game.interceptor += 1;
                break;
            case "tank":
                Game.tank += 1;
                break;
        }
    };

    const handleEnemyBulletCollision = function(bullet, playerPos) {
        if (
            bullet.x >= playerPos.x - 13 &&
            bullet.x <= playerPos.x + Character.ship.player.width &&
            bullet.y >= playerPos.y - Character.ship.player.height / 2 &&
            bullet.y <= playerPos.y + Character.ship.player.height / 2
        ) {
            if (!Game.muteSFX) {
                Sounds.playerHit.play();
            }
            bullet.alive = false;
            Character.ship.player.hp -= bullet.damage;
            if (Character.ship.player.hp <= 0) {
                if (!Game.muteSFX) {
                    Sounds.explosion.play();
                }
                GameLogic.gameOver();
            }
        }
    };

    const checkBulletCollision = function checkBulletCollision() {
        const enemyBullets = InPlay.enemyBullets;
        const playerPos = Character.ship.player.pos;
        const playerBullets = InPlay.playerBullets;
        const enemies = InPlay.enemies;
        for (let bullet of playerBullets) {
            if (bullet.alive) {
                handlePlayerBulletCollision(bullet, enemies);
            }
        }

        for (let bullet of enemyBullets) {
            if (bullet.alive) {
                handleEnemyBulletCollision(bullet, playerPos);
            }
        }
    };

        
    const getRandomInt = (max) => {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return (array[0] % max) + 1; 
    };

    const dropPickUp = (x, y) => {
        const selector = getRandomInt(3);

        const pickUp = {
            x: x,
            y: y + 45,
            alive: true
        };
        switch (selector) {
            case 1:
                pickUp.type = "health";
                pickUp.icon = Images.pickUpHealth;
                break;
            case 2:
                pickUp.type = "fireRate";
                pickUp.icon = Images.pickUpFireRate;
                break;
            case 3:
                pickUp.type = "damage";
                pickUp.icon = Images.pickUpDamage;
                break;
            default:
                throw new Error('Selector fuera de rango');
        }
        InPlay.powerUps.push(pickUp);
    };


    const isInPickupArea = (powerUp, player) => {
        return (powerUp.x >= player.pos.x && powerUp.x <= (player.pos.x + player.width)) &&
               (powerUp.y >= (player.pos.y - player.height) && powerUp.y <= player.pos.y + player.height / 2);
    };

    const applyPowerUp = (powerUp, player) => {
        switch (powerUp.type) {
            case "health":
                player.hp += 20;
                break;
            case "fireRate":
                player.fireRate -= 0.09;
                GameLogic.fRate = true;
                break;
            case "damage":
                player.damage += 1;
                break;
        }
    };

    const checkPickUp = function() {
        const powerUps = InPlay.powerUps;
        const player = Character.ship.player;
    
        for (const powerUp of powerUps) {
            if (powerUp.alive && isInPickupArea(powerUp, player)) {
                if (!Game.muteSFX) {
                    Sounds.powerUp.play();
                }
                applyPowerUp(powerUp, player);
                powerUp.alive = false;
            }
        }
    };
    
    const checkShipCollision = function checkShipCollision() {
        let enemies = InPlay.enemies;
        let player = Character.ship.player;
        let playerPos = Character.ship.player.pos;
        
        enemies.forEach(enemy => {
            if (player.hp > 0 && enemy.alive) {
                if (isColliding(playerPos, player.width, enemy)) {
                    handleCollision(player, enemy);
                }
            }
        });
    };

    const isColliding = function (playerPos, playerWidth, enemy) {
        const isXColliding = (enemy.x >= playerPos.x && enemy.x <= (playerPos.x + playerWidth)) ||
                             (enemy.x + enemy.width >= playerPos.x && enemy.x + enemy.width <= (playerPos.x + playerWidth));
        
        const isYColliding = (enemy.y >= (playerPos.y - Character.ship.player.height) && enemy.y <= (playerPos.y + Character.ship.player.height / 2)) ||
                             ((playerPos.y - Character.ship.player.height / 2) >= enemy.y && (playerPos.y - Character.ship.player.height / 2) <= (enemy.y + enemy.height));
        
        return isXColliding && isYColliding;
    };
    
    const handleCollision = function (player, enemy) {
        if (!Game.muteSFX) {
            Sounds.playerHit.play();
            Sounds.death.play();
        }
        
        enemy.alive = false;
        player.hp -= enemy.hp;
    
        if (player.hp <= 0) {
            if (!Game.muteSFX) {
                Sounds.explosion.play();
            }
            GameLogic.gameOver();
        }
    };

    const gameOver = function gameOver() {
        let isHighscore = false;
        let enemies = InPlay.enemies;
        GameLogic.timer.stop();
        enemies.length = 0;
        Game.levelStarted = false;
        Game.gameOver = true;
        if (Game.highscore < Character.ship.player.score) {
            isHighscore = true;
            Game.highscore = Character.ship.player.score;
        }
        GameLogic.uploadStats(isHighscore);
        Game.screen = "game_over";
    };

    const uploadStats = function uploadStats(isHighscore) {
        if (isHighscore) {
            LSM.set("highscore", Game.highscore);
            Game.isHighscore = true;
        } else {
            Game.isHighscore = false;
        }
        LSM.set("scout", Game.scout);
        LSM.set("fighter", Game.fighter);
        LSM.set("interceptor", Game.interceptor);
        LSM.set("tank", Game.tank);
        LSM.set("transport", Game.transport);
    };

    const resetStats = function resetStats() {
        Game.highscore = 0;
        Game.scout = 0;
        Game.fighter = 0;
        Game.interceptor = 0;
        Game.tank = 0;
        Game.transport = 0;
        LSM.set("highscore", 0);
        LSM.set("scout", 0);
        LSM.set("fighter", 0);
        LSM.set("interceptor", 0);
        LSM.set("tank", 0);
        LSM.set("transport", 0);
    };

    const checkCollisions = function checkCollisions() {
        GameLogic.checkShipCollision();
        GameLogic.checkBulletCollision();
        GameLogic.checkEnemiesDead();
        GameLogic.checkPickUp();
    };

    const spawnCheck = function spawnCheck(newShip, spawnTime) {
        let  i, enemies, spawningY, verdict, time;
        verdict = true;
        time = spawnTime;
        spawningY = newShip;
        enemies = InPlay.enemies;
        if (enemies.length >= 1) {
            for (i = 0; i < enemies.length; i++) {
                if (time < enemies[i].time + 1) {
                    if (spawningY > enemies[i].y - 104 && spawningY < enemies[i].y + 104) {
                        verdict = false;
                    }
                }
            }
        }
        return verdict;
    };

    const addEnemies = function addEnemies() {
        const baseEnemies = 5; 
        const maxEnemies = 30;
        const enemyIncreaseRate = 2; 
    
        const noEnemies = Math.min(baseEnemies + (Game.level - 1) * enemyIncreaseRate, maxEnemies);
        
        const lvlSelector = Math.min(Game.level, 5);
        const rate = Math.max(0.5, 1 - (Game.level * 0.05)); 
        let time = 0;
        GameLogic.level.startTime = Game.timer;
    
        let enemiesSpawned = 0;
        while (enemiesSpawned < noEnemies) {
            const enemy = selectEnemy(lvlSelector);
            const y = Math.floor(Math.random() * (Canvas.canvasHeight - 90)) + 1;
            
            if (GameLogic.spawnCheck(y, time)) {
                spawnEnemy(enemy, y, time);
                time += rate;
                enemiesSpawned++;
            }
        }
    };
    function selectEnemy(lvlSelector) {
        const selector = Math.floor(Math.random() * lvlSelector) + 1;
        const enemyTypes = [
            Character.ship.enemy.scout,
            Character.ship.enemy.fighter,
            Character.ship.enemy.scout, 
            Character.ship.enemy.tank,
            Character.ship.enemy.interceptor
        ];
        
        let selectedEnemy = enemyTypes[selector - 1] || Character.ship.enemy.scout;
        
        
        if (Game.level % 3 === 0 && Math.random() < 0.2) { 
            selectedEnemy = Character.ship.enemy.transport;
        }
        
        return GameLogic.clone(selectedEnemy);
    }
    
    function spawnEnemy(enemy, y, time) {
        enemy.y = y;
        enemy.x = Canvas.canvasWidth + 100;

        const hpIncrease = Math.floor(Math.sqrt(Game.level)) - 1;
        enemy.hp += Math.max(0, hpIncrease);
        
        enemy.time = time;
        InPlay.enemies.push(enemy);
    }

    const level = {
        //functions
        start: startLevel,
        //variables
        startTime: 0
    };

    const GameLogic = {
        //functions
        clone: clone,
        spawnCheck: spawnCheck,
        addEnemies: addEnemies,
        checkBulletCollision: checkBulletCollision,
        checkShipCollision: checkShipCollision,
        checkPickUp: checkPickUp,
        checkCollisions: checkCollisions,
        checkEnemiesDead: checkEnemiesDead,
        dropPickUp: dropPickUp,
        addScore: addScore,
        gameOver: gameOver,
        uploadStats: uploadStats,
        resetStats: resetStats,
        //variables
        paused: false,
	fRate: false,
        level: level,
        timer: timer
    };
    return GameLogic;
});
