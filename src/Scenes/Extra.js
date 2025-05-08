class Extra extends Phaser.Scene {
    
    constructor() {
        super("extra");
    }

    preload() {
        
         
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


        let screenWidth = this.sys.game.config.width;
        let screenHeight = this.sys.game.config.height;

        // Add a semi-transparent black rectangle that covers ~90% of the screen
        let overlay = this.add.rectangle(
            screenWidth / 2,   // x (centered)
            200,  // y (centered)
            screenWidth * 1, // width
            screenHeight * 0.4,// height
            0x000000,          // color (black)
            0.5                // alpha (0 = transparent, 1 = opaque)
        );

        

        let button = this.add.image(320, 600, 'playButton').setInteractive();
        let playtxt = this.add.text(button.x, button.y, "GO BACK TO MENU", {
            fontSize: '25px',
            color: '#b03558'
        });
        playtxt.setOrigin(0.5, 0.5);
        
        let akey = this.add.image(260, 180, 'aKey').setScale(3);
        let dkey = this.add.image(335, 180, 'dKey').setScale(3);
        this.add.text(300, 125, "PRESS A TO MOVE LEFT\nD TO MOVE RIGHT", {
            fontSize: '25px',
            color: '#f8f7fa',
            align: 'center'
        }).setOrigin(.5,.5);

        this.add.text(300, 235, "PRESS SPACEBAR\nTO SHOOT", {
            fontSize: '25px',
            color: '#f8f7fa',
            align: 'center'
        }).setOrigin(.5,.5);

        let space = this.add.image(300, 295, 'space').setScale(3);

        // 1) create your text
        let credits = this.add.text(300, -100, "Devolped by\nBRODY VANCE", {
            fontSize: "50px",
            color: "#0a0c12",
            fontFamily: "Georgia",
            align: "center"
        }).setOrigin(0.5);
        
        // 2) first tween: move up until y == 400
        this.tweens.add({
            targets: credits,
            y: 450,
            duration: 8000,    
            ease: 'Linear',
            onComplete: () => {
            // 3) pause for 5 seconds
            this.time.delayedCall(5000, () => {
                // 4) second tween: continue moving down
                this.tweens.add({
                targets: credits,
                y: '+=200',      // move down another 200px 
                duration: 7000,  // adjust speed
                ease: 'Linear'
                });
            });
            }
        });
        
        button.on('pointerdown', () => {
            this.scene.start('Menu'); // or whatever scene you want
        });
        button.on('pointerover', () => {
            button.setScale(1.1);
            playtxt.setScale(1.1);
        });
        button.on('pointerout', () => {
            button.setScale(1);
            playtxt.setScale(1);

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
        
    }
    
}  

