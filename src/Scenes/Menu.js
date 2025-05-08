class Menu extends Phaser.Scene {
    constructor() {
        super("Menu");
    }

    preload() {

        this.load.setPath("./assets/");
                           

        this.load.image("avatar", "ship.png");                    
        this.load.image("playButton", "playbutt.png")
        // this.load.image("playButton", "wood.png")

        this.load.image("Beach_tiles", "tiles_sheet.png");    // tile sheet   
        this.load.tilemapTiledJSON("map", "BeachMap.json");                   // Load JSON of tilemap
        this.load.tilemapTiledJSON("map1", "BeachMap1.json"); 
        
        this.load.image("aKey", "Akey.png");                    
        this.load.image("dKey", "Dkey.png");                    
        this.load.image("space", "Space.png");
    }
    
    create() {
        
        // Load the tilemap and tileset once
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

        //title animation
        my.sprite.ship = this.physics.add.sprite( 300, 725, "avatar").setFlipY(true).setScale(.6);
        my.sprite.ship.setVelocityY(-100);

        // play button
        let button = this.add.image(320, 270, 'playButton').setInteractive();
        let playtxt = this.add.text(button.x, button.y, "PLAY", {
            fontSize: '32px',
            color: '#b03558'
        });
        playtxt.setOrigin(0.5, 0.5);

        let Highbutton = this.add.image(320, 330, 'playButton').setInteractive();
        let Hightxt = this.add.text(Highbutton.x, Highbutton.y, "HIGHSCORES", {
            fontSize: '32px',
            color: '#b03558'
        });
        Hightxt.setOrigin(0.5, 0.5);

        let ex = this.add.image(320, 390, 'playButton').setInteractive();
        let extxt = this.add.text(ex.x, ex.y, "Credits & Controls", {
            fontSize: '20px',
            color: '#b03558'
        });
        extxt.setOrigin(0.5, 0.5);

        this.add.text(165, 100, "PIRATE\nDEFENSE", { fontSize: "65px", fontFamily: "Georgia", fill: "#1c1736", align: "center" });

        // action of playing game on click
        button.on('pointerdown', () => {
            this.scene.start('mygame'); // or whatever scene you want
        });
        button.on('pointerover', () => {
            button.setScale(1.1);
            playtxt.setScale(1.1);
        });
        button.on('pointerout', () => {
            button.setScale(1);
            playtxt.setScale(1);

        });

        // action of going to high score screen
        Highbutton.on('pointerdown', () => {
            this.scene.start('highscore'); // or whatever scene you want
        });
        Highbutton.on('pointerover', () => {
            Highbutton.setScale(1.1);
            Hightxt.setScale(1.1);
        });
        Highbutton.on('pointerout', () => {
            Highbutton.setScale(1);
            Hightxt.setScale(1);

        });

        // action extras
        ex.on('pointerdown', () => {
            this.scene.start('extra'); // or whatever scene you want
        });
        ex.on('pointerover', () => {
            ex.setScale(1.1);
            extxt.setScale(1.1);
        });
        ex.on('pointerout', () => {
            ex.setScale(1);
            extxt.setScale(1);

        });
        
    }

    update() {
        const scrollSpeed = 1;

        // Move all layers of both maps down
        [this.l1_1, this.l1_2, this.l1_3, this.l2_1, this.l2_2, this.l2_3].forEach(layer => {
            layer.y += scrollSpeed;

            // If this layer is fully offscreen, move it back to top
            if (layer.y >= this.map1.heightInPixels) {
                layer.y -= this.map1.heightInPixels * 2;
            }
        });

        if(my.sprite.ship.y < 625) {
            my.sprite.ship.setVelocityY(0);
        }
    }

}