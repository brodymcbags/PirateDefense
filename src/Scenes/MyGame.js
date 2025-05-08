class MyGame extends Phaser.Scene {    

    constructor(){
        super("mygame");
        this.my = {sprite: {}};  
        this.shipmoveSpeed = 20;

    }

    preload() {
        this.load.setPath("./assets/");                        // Set load path
        this.load.image("x-mark", "numeralX.png");             // x marks the spot
        this.load.image("enemyShip", "enemyGreen1.png");       // spaceship that runs along the path

        this.load.image("avatar", "ship.png"); 
        this.load.image("foam","waterfoam.png");
                
        this.load.image("shipD1", "shipD1.png");                 
        this.load.image("shipD2", "shipD2.png");                 
        this.load.image("shipD3", "brokenShip.png");                 

        this.load.image("cannonball", "cannonBall.png"); // spaceship that runs along the path
        this.load.image("explosion","explosion2.png");


        this.load.image("enemy1","playerShip1_red.png"); // enemy ship 
        this.load.image("rock","meteorGrey_big1.png");
        this.load.image("heart","heart.png");
        this.load.image("emptyHeart","MTHeart.png");
        this.load.image("laser","laserRed.png");

        // score board
        this.load.image("0","0.png");
        this.load.image("1","1.png");
        this.load.image("2","2.png");
        this.load.image("3","3.png");
        this.load.image("4","4.png");
        this.load.image("5","5.png");
        this.load.image("6","6.png");
        this.load.image("7","7.png");
        this.load.image("8","8.png");
        this.load.image("9","9.png");

        //people falling out of ship 
        this.load.image("person1","crew1.png");
        this.load.image("person2","crew2.png");

        //audio 
        this.load.audio("pewpew","laserSmall_004.ogg")
        this.load.audio("cannonNoise","avatarshoot.ogg")
        for (let i = 0; i <= 9; i++) {
            this.load.image(`digit_${i}`, `${i}.png`);
        }
        

    }

    create() {
        this.shipWrecked = false
        // MAP SCROLL
        this.map1 = this.make.tilemap({ key: "map" });
        this.tileset = this.map1.addTilesetImage("BeachTiles", "Beach_tiles");

        // First tilemap layers
        this.l1_1 = this.map1.createLayer("LAY0", this.tileset, 0, 0);
        this.l1_2 = this.map1.createLayer("LAY1", this.tileset, 0, 0);
        this.l1_3 = this.map1.createLayer("LAY2", this.tileset, 0, 0);

        // Clone second tilemap manually (use same tilemap object)
        this.map2 = this.make.tilemap({ key: "map" });
        this.l2_1 = this.map2.createLayer("LAY0", this.tileset, 0, -this.map1.heightInPixels);
        this.l2_2 = this.map2.createLayer("LAY1", this.tileset, 0, -this.map1.heightInPixels);
        this.l2_3 = this.map2.createLayer("LAY2", this.tileset, 0, -this.map1.heightInPixels);

        let my = this.my;
        // avatar health
        // Add in create() after avatar sprite setup
        
        this.playerScore = 0; // Players score

        this.digitSprites = [];
        let startX = 400;  // x-position of first digit
        let y = 30;        // y-position of score

        for (let i = 0; i < 6; i++) {  // 6 digits, zero-padded
            let digitSprite = this.add.image(startX + i * 32, y, 'digit_0').setScale(2);
            this.digitSprites.push(digitSprite);
        }

        this.playerHealth = 3;  // start with 3 health

        this.shipsToSpawn = 1;  // Start by spawning 1 ship

        this.rockSpeed = 35 //starting rock speed

        this.hearts = [];
        for (let i = 0; i < 3; i++) {
            let heart = this.add.image(25 + i * 40, 25, 'heart').setScale(3);
            this.hearts.push(heart);
        }
        
        // avatar sprite
        //my.sprite.foam = this.physics.add.sprite( 300, 640, "foam").setScale(5); //foamy water

        my.sprite.ship = this.physics.add.sprite( 300, 625, "avatar").setFlipY(true).setScale(.6);

        // bullet list
        this.my.sprite.INeedBullets = this.physics.add.group();

        // rock list
        this.my.sprite.RockList = this.physics.add.group();

        // enemey bullet list
        this.enemyProj = this.physics.add.group();

        // enemey ship list
        this.enemyShips = this.physics.add.group(); 

        // adjust rock speed
        this.time.addEvent({
            delay: 7000,
            callback: () => {
                this.rockSpeed += 10;
            },
            loop: true
        });

        // spawn rocks
        this.time.addEvent({
            delay: 2200,          
            callback: () => this.spawnRocks(),
            loop: true
        });

        this.time.addEvent({
            delay: 16000,          // Every 30 seconds
            callback: () => {
                this.shipsToSpawn++;  // Increase how many ships are spawned
            },
            callbackScope: this,
            loop: true
        });
        
        // spawn enemy ships
        this.time.addEvent({
            delay: 8000, // How often to spawn enemies
            callback: () => {
                for (let i = 0; i < this.shipsToSpawn; i++) {
                    this.spawnRandomPathShip();
                }
            },
            callbackScope: this,
            loop: true
        });
        

        // if player hits a rock
        this.physics.add.overlap(
            my.sprite.ship,
            my.sprite.RockList,
            this.HPDown,
            null,
            this
        );
        
        // if bullet hits a rock
        this.physics.add.overlap(
            this.my.sprite.INeedBullets,
            this.my.sprite.RockList,
            this.bulletHitsRock,
            null,
            this
        );
        
        
        // when enemy ship hits player
        this.physics.add.overlap(
            this.enemyProj,
            this.my.sprite.ship,
            this.enemyBulletHitsPlayer,
            null,
            this
        );
        

        // keys pressed
        this.keys = this.input.keyboard.addKeys({
            spaceKey: Phaser.Input.Keyboard.KeyCodes.SPACE,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            D: Phaser.Input.Keyboard.KeyCodes.D
        });
    }


    update() {
        
        const scrollSpeed = 2.5;

        // Move all layers of both maps down
        [this.l1_1, this.l1_2, this.l1_3, this.l2_1, this.l2_2, this.l2_3].forEach(layer => {
            layer.y += scrollSpeed;

            // If this layer is fully offscreen, move it back to top
            if (layer.y >= this.map1.heightInPixels) {
                layer.y -= this.map1.heightInPixels * 2;
            }
        });

        let my = this.my;

        if (!this.shipWrecked) {
            if (this.keys.A.isDown && my.sprite.ship.x > 110) {
                my.sprite.ship.setVelocityX(-this.shipmoveSpeed * 10);
                //my.sprite.foam.setVelocityX(-this.shipmoveSpeed * 10);
            } else if (this.keys.D.isDown && my.sprite.ship.x < 490) {
                my.sprite.ship.setVelocityX(this.shipmoveSpeed * 10);
                //my.sprite.foam.setVelocityX(this.shipmoveSpeed * 10);
            } else {
                my.sprite.ship.setVelocityX(0); // stop when no key is pressed
                //my.sprite.foam.setVelocityX(0);
            }
        } 
        // bullets spawn with a max of 4
        if (Phaser.Input.Keyboard.JustDown(this.keys.spaceKey) && this.my.sprite.INeedBullets.getLength() <= 3) {
            this.sound.play("cannonNoise", { volume: 0.5 }); 
            let proj = this.physics.add.sprite(my.sprite.ship.x, my.sprite.ship.y-30, "cannonball").setScale(1.5);            
            this.my.sprite.INeedBullets.add(proj);
            proj.setCollideWorldBounds(false); // allow bullet to go off-screen
            proj.setVelocityY(-300);
            console.log(this.my.sprite.INeedBullets);

            
        }
        for (let p of this.my.sprite.INeedBullets.getChildren()){ 
            // Move projectile upward if it's firing and delete sprite to save memory                
            // Stop if it goes off-screen
            if (p.y <= 0) {
                p.destroy();
            }
        }


    }

    fireEnemyProj(x, y) {
        this.sound.play("pewpew", { volume: 0.5 }); 

        let proj = this.enemyProj.create(x, y + 10, 'laser').setScale(.8).setFlipY(true);
        proj.setVelocityY(200);
        proj.setCollideWorldBounds(false);
    }    

    spawnRandomPathShip() {
        const numPoints = 5;
        const points = [];
    
        for (let i = 0; i < numPoints; i++) {
            let x = Phaser.Math.Between(50, this.game.config.width - 50);
            let y = (i / (numPoints - 1)) * this.game.config.height;
            points.push(new Phaser.Math.Vector2(x, y));
        }
    
        const curve = new Phaser.Curves.Spline(points);
    
        const enemyShip = this.add.follower(curve, points[0].x, points[0].y, "enemyShip").setScale(0.7);
        this.physics.add.existing(enemyShip);
        enemyShip.body.setAllowGravity(false);
    
        // Add ship to your group
        this.enemyShips.add(enemyShip);
    
        enemyShip.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 7000,
            ease: 'Sine.easeInOut',
            repeat: 0,
            yoyo: false,
            rotateToPath: false,
            onComplete: () => {
                enemyShip.destroy(); // Destroy if it reaches end of path
            }
        });
    
        // Fire bullets from enemy
        enemyShip.fireTimer = this.time.addEvent({
            delay: 1200,
            callback: () => {
                if (enemyShip.active) {
                    this.fireEnemyProj(enemyShip.x, enemyShip.y);
                }
            },
            callbackScope: this,
            loop: true
        });
    
        // Clean up when destroyed
        enemyShip.on('destroy', () => {
            if (enemyShip.fireTimer) enemyShip.fireTimer.remove(false);
        });
    
        // Bullet collision
        this.physics.add.overlap(
            this.my.sprite.INeedBullets,
            enemyShip,
            this.bulletHitsEnemy,
            null,
            this
        );
    }
    
    
    
    
         
    
    spawnRocks() {
        let x = Phaser.Math.Between(110, 490);  // Random X within screen bounds
        let y = 0;                             // Top of the screen
        let rock = this.physics.add.sprite(x, y, 'rock').setScale(.5);
        this.my.sprite.RockList.add(rock);
        rock.setVelocityY(this.rockSpeed);  // rock speed
        rock.rockHP = 4         // rock HP
        


        // remove rock once off screen
        for (let rock of this.my.sprite.RockList.getChildren()) {
            if (rock.y > 700) {
                rock.destroy();
            }
        }
    }

    // player gets hit by bollat
    enemyBulletHitsPlayer(player, bullet) {
        let explosion = this.add.sprite(player.x, player.y, 'explosion').setScale(0.5);
        this.time.delayedCall(400, () => explosion.destroy());

        bullet.destroy();
        this.HPDown(player, null); // Reuse HP system
    }
    
    // what happens when the ship is hit
    HPDown(ship, rock) {
        if (!ship) return; // If there's no ship, do nothing.
    
        if (rock && rock.destroy) {
            // If rock exists and has a destroy method, destroy it.
            rock.destroy();
        }
        // Decrease health
        if (this.playerHealth > 0) {
            this.playerHealth--;
    
            // Update heart UI
            this.hearts[this.playerHealth].setTexture('emptyHeart');
    
            // Swap ship sprite based on health
            let newTexture = '';
            switch (this.playerHealth) {

                case 2:
                    newTexture = 'shipD2';
                    break;
                case 1:
                    newTexture = 'shipD1';
                    break;
            }
    
            if (newTexture !== '') {
                ship.setTexture(newTexture);
            }
        }
    
        // End game if health is 0
        if (this.playerHealth <= 0) {

            this.shipWrecked = true;

            this.my.sprite.ship.setTexture("shipD3");

            my.sprite.person1 = this.physics.add.sprite( this.my.sprite.ship.x + 30, 625, "person1").setFlipY(true);
            my.sprite.person2 = this.physics.add.sprite( this.my.sprite.ship.x - 30, 625, "person2");
            
            my.sprite.person1.setVelocityY(75);
            my.sprite.person2.setVelocityY(75);
            this.my.sprite.ship.setVelocityX(0);
            this.my.sprite.ship.setVelocityY(75);
        
            this.time.delayedCall(3000, () => {
                this.endGame();
            }, [], this);
        }
    }
    
    // What happens when a bollat hits a rock
    bulletHitsRock(bullet, rock) {
        if (!bullet || !rock) return;
    
        rock.rockHP -= 1;
    
        // Create explosion at bullet's position
        let explosion = this.add.sprite(bullet.x, bullet.y, 'explosion').setScale(0.5);
    
        // Destroy explosion after a short delay
        this.time.delayedCall(400, () => {
            explosion.destroy();
        });
    
        // Destroy bullet
        if (bullet.destroy) bullet.destroy();
    
        // If rock HP reaches 0, destroy the rock
        if (rock.rockHP <= 0 && rock.destroy) {
            rock.destroy();
            this.playerScore += 25;
            this.displayScore(this.playerScore);
        }
    }
    bulletHitsEnemy(bullet, enemyship) {
        let explosion = this.add.sprite(bullet.x, bullet.y, 'explosion').setScale(0.5);
    
        // Destroy explosion after a short delay
        this.time.delayedCall(400, () => {
            explosion.destroy();
        });

        // Destroy bullet
        if (bullet.destroy) bullet.destroy();

        // destroy enemy ship
        if (enemyship && enemyship.destroy) enemyship.destroy();

        this.playerScore += 50;
        this.displayScore(this.playerScore);

    }
    displayScore(score) {
        let scoreStr = score.toString().padStart(6, '0');
    
        for (let i = 0; i < scoreStr.length; i++) {
            let digitValue = scoreStr[i];
            this.digitSprites[i].setTexture(`digit_${digitValue}`);
        }
    }
    endGame() {
        // Retrieve existing high scores from localStorage, or create an empty list if none exists
        let highScores = JSON.parse(localStorage.getItem("highScores")) || [];
    
        // Add the current score to the list
        highScores.push(this.playerScore);
    
        // Sort the scores in descending order (highest score first)
        highScores.sort((a, b) => b - a);
    
        // Keep only the top 10 scores
        highScores = highScores.slice(0, 10);
    
        // Save the updated list back to localStorage
        localStorage.setItem("highScores", JSON.stringify(highScores));
    
        // Go back to menu scene
        this.scene.start("Menu");
    }
    
    
    
}

