class Highscore extends Phaser.Scene { 
    constructor() {
        super("highscore");
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("enemyShip", "enemyGreen1.png");       // spaceship that runs along the path
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


        //spawn enemey fleet
        const centerX = this.cameras.main.width / 2;
        const start_Y = -50;                // start just above the top
        const rowCount = 5;                // number of rows in the triangle
        const spacingX = 64;               // horizontal spacing between ships
        const spacingY = 64;               // vertical spacing between rows
        this.enemies = this.physics.add.group();

        
        // Build a triangle: 1 ship in row 0, 2 in row 1, … up to rowCount
        for (let row = 0; row < rowCount; row++) {
            const shipsInRow = row + 1;
            // Calculate leftmost x so the row is centered
            const rowWidth = (shipsInRow - 1) * spacingX;
            const rowStartX = centerX - rowWidth / 2;

            for (let i = 0; i < shipsInRow; i++) {
                let x = rowStartX + i * spacingX;
                let y = start_Y - row * spacingY;
                let ship = this.enemies.create(x, y, "enemyShip").setScale(0.6);
                ship.setVelocityY(100);   // move down at 100px/sec
                ship.setOrigin(0.5);
            }
        }

        // When a ship goes off the bottom, wrap it back to top
        this.enemies.children.iterate(ship => {
            ship.checkWorldBounds = true;
            ship.outOfBoundsKill = false;
        });
        
        let button = this.add.image(320, 600, 'playButton').setInteractive();
        let playtxt = this.add.text(button.x, button.y, "GO BACK TO MENU", {
            fontSize: '25px',
            color: '#b03558'
        });
        playtxt.setOrigin(0.5, 0.5);

        // Load the top scores from localStorage (default to empty array if no scores are saved)
        let highScores = JSON.parse(localStorage.getItem("highScores")) || [];

        // Display the top 5 scores
        this.add.text(300, 100, "HIGHSCORES:", { fontSize: "50px", fontFamily: "Georgia", fill: "#1c1736", align: "center" }).setOrigin(.5, .5);

        // Display each score from the highScores array
        let leftX = 200;
        let rightX = 350;
        let startY = 140;
        let lineSpacing = 30;

        for (let i = 0; i < highScores.length; i++) {
            let column = i < 5 ? 0 : 1;
            let indexInColumn = i % 5;
            let x = column === 0 ? leftX : rightX;
            let y = startY + indexInColumn * lineSpacing;

            this.add.text(x, y, `${i + 1}. ${highScores[i]}`, {
                fontSize: "32px",
                fill: "#1c1736"
            }).setOrigin(0.5, 0.5);
        }
        
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

        const screenHeight = this.cameras.main.height;
        this.enemies.getChildren().forEach(ship => {
            if (ship.y - ship.displayHeight/2 > screenHeight) {
                // Move it back to just above the top, preserving its x
                ship.y = -ship.displayHeight / 2;
            }
        });
    }
}  

