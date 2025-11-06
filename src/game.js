/**
 * Main Game Logic
 * Manages game state, turns, and coordination between systems
 */

import { Terrain } from './terrain.js';
import { Projectile, simulateTrajectory, generateWind } from './physics.js';
import { Renderer } from './renderer.js';
import { TankAI } from './ai.js';
import { getStage } from './stages.js';
import { getWeapon, getStartingWeapons } from './weapons.js';
import { UI } from './ui.js';

class Tank {
    constructor(id, x, y, color, isAI = false, aiDifficulty = 'medium') {
        this.id = id;
        this.x = x;
        this.y = y;
        this.color = color;
        this.angle = -Math.PI / 4; // Default 45 degrees up
        this.radius = 12;
        this.hp = 100;
        this.maxHp = 100;
        this.isAlive = true;
        this.isAI = isAI;
        this.ai = isAI ? new TankAI(aiDifficulty) : null;
    }

    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
            this.isAlive = false;
        }
    }

    setAngle(angle) {
        // Clamp angle to reasonable range
        this.angle = Math.max(-Math.PI, Math.min(0, angle));
    }

    updatePosition(terrain) {
        // Settle tank onto terrain
        const groundY = terrain.getHeightAt(this.x);
        if (this.y < groundY - this.radius) {
            this.y = groundY - this.radius;
        }
    }
}

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.ui = new UI();

        this.state = 'menu'; // menu, playing, animating, gameOver
        this.terrain = null;
        this.tanks = [];
        this.currentTankIndex = 0;
        this.projectile = null;
        this.explosions = [];

        // Game settings
        this.stage = null;
        this.wind = 0;
        this.currentWeapon = null;
        this.availableWeapons = getStartingWeapons();
        this.selectedStage = 'lunaCrater'; // Default selected stage

        // Aiming
        this.isAiming = false;
        this.aimStartX = 0;
        this.aimStartY = 0;
        this.aimPower = 0;
        this.trajectoryPoints = [];

        // Animation
        this.lastTime = 0;

        console.log('Game initialized');
        this.setupEventListeners();
        this.ui.showMenu();
        console.log('Menu should be visible now');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Canvas mouse events
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));

        // Stage selection buttons (must be set up before start button)
        const stageButtons = document.querySelectorAll('.stage-btn');
        stageButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                stageButtons.forEach(b => b.style.background = '#1a1a2e');
                btn.style.background = '#4ecca3';
                this.selectedStage = btn.dataset.stage;
                console.log('Selected stage:', this.selectedStage);
            });

            // Highlight default selected stage
            if (btn.dataset.stage === this.selectedStage) {
                btn.style.background = '#4ecca3';
            }
        });

        // Menu events
        document.getElementById('start-game').addEventListener('click', () => {
            const tankCount = parseInt(document.getElementById('tank-count').value);
            const aiCount = parseInt(document.getElementById('ai-count').value);

            console.log('Starting game with:', this.selectedStage, tankCount, 'tanks,', aiCount, 'AI');
            this.startGame(this.selectedStage, tankCount, aiCount);
        });

        // Tank count slider
        document.getElementById('tank-count').addEventListener('input', (e) => {
            this.ui.updateTankCountDisplay(e.target.value);
        });

        // AI count slider
        document.getElementById('ai-count').addEventListener('input', (e) => {
            this.ui.updateAICountDisplay(e.target.value);
        });

        // Play again button
        document.getElementById('play-again').addEventListener('click', () => {
            this.ui.hideGameOver();
            this.ui.showMenu();
        });

        // Weapon selection
        this.ui.setupWeaponListeners((weaponId) => {
            this.selectWeapon(weaponId);
        });

        this.ui.setupWeaponKeys((weaponId) => {
            this.selectWeapon(weaponId);
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.state !== 'playing') return;

            const currentTank = this.getCurrentTank();
            if (!currentTank || currentTank.isAI) return;

            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                    currentTank.angle -= 0.05;
                    this.updateTrajectoryPreview();
                    break;
                case 'ArrowRight':
                case 'd':
                    currentTank.angle += 0.05;
                    this.updateTrajectoryPreview();
                    break;
                case ' ':
                    if (!this.isAiming && !this.projectile) {
                        this.fireWeapon(currentTank.angle, 50);
                    }
                    break;
            }
        });
    }

    /**
     * Start new game
     */
    startGame(stageKey, tankCount, aiCount) {
        console.log('startGame called with:', stageKey, tankCount, aiCount);
        this.ui.hideMenu();

        // Setup stage
        this.stage = getStage(stageKey);
        console.log('Stage loaded:', this.stage.name);

        this.terrain = new Terrain(this.canvas.width, this.canvas.height, this.stage.terrainProfile);
        console.log('Terrain generated');

        // Setup wind
        this.wind = generateWind(this.stage.windRange);

        // Setup tanks
        this.tanks = [];
        const colors = ['#4ecca3', '#e74c3c', '#f39c12', '#9b59b6', '#3498db', '#e67e22'];

        for (let i = 0; i < tankCount; i++) {
            const pos = this.terrain.getSafeSpawnPosition(i, tankCount);
            const isAI = i >= (tankCount - aiCount);
            const tank = new Tank(
                i,
                pos.x,
                pos.y,
                colors[i % colors.length],
                isAI,
                'medium'
            );
            console.log(`Tank ${i}: isAI=${isAI}, color=${colors[i % colors.length]}`);
            this.tanks.push(tank);
        }
        console.log('Tanks created:', this.tanks.length);

        // Setup game state
        this.currentTankIndex = 0;
        this.currentWeapon = this.availableWeapons[0];
        this.state = 'playing';

        // Update UI
        this.updateUI();

        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop();
        console.log('Game loop started');

        // Check if first tank is AI
        const firstTank = this.getCurrentTank();
        if (firstTank && firstTank.isAI) {
            setTimeout(() => {
                this.executeAITurn(firstTank);
            }, 1500);
        }
    }

    /**
     * Main game loop
     */
    gameLoop(currentTime = 0) {
        if (this.state === 'menu') return;

        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        // Update
        this.update(dt);

        // Render
        this.render();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * Update game state
     */
    update(dt) {
        // Update projectile
        if (this.projectile && this.projectile.active) {
            this.projectile.update(dt * 60, this.terrain, this.tanks);

            if (!this.projectile.active) {
                console.log('Projectile became inactive - impact detected');

                // Projectile hit something
                const explosion = this.projectile.onImpact(
                    this.projectile.x,
                    this.projectile.y,
                    this.terrain,
                    this.tanks
                );

                if (explosion) {
                    console.log('Creating explosion');
                    this.explosions.push({
                        ...explosion,
                        age: 0,
                        maxAge: 0.5
                    });

                    this.renderer.addParticles(
                        explosion.x,
                        explosion.y,
                        20,
                        explosion.color
                    );
                }

                // Update tank positions after terrain deformation
                for (let tank of this.tanks) {
                    if (tank.isAlive) {
                        tank.updatePosition(this.terrain);
                    }
                }

                // End turn after short delay
                console.log('Will call endTurn in 1000ms');
                setTimeout(() => {
                    this.endTurn();
                }, 1000);
            }
        }

        // Update explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].age += dt;
            if (this.explosions[i].age >= this.explosions[i].maxAge) {
                this.explosions.splice(i, 1);
            }
        }

        // Update particles
        this.renderer.updateParticles(dt);
    }

    /**
     * Render game
     */
    render() {
        this.renderer.clear();

        // Only render game elements if we have terrain and stage (not in menu)
        if (!this.terrain || !this.stage) {
            return;
        }

        this.renderer.drawSky(this.stage);
        this.renderer.drawTerrain(this.terrain, this.stage);

        // Draw tanks
        const currentTank = this.getCurrentTank();
        for (let tank of this.tanks) {
            this.renderer.drawTank(tank, tank === currentTank);
        }

        // Draw trajectory preview
        if (this.isAiming && this.trajectoryPoints.length > 0) {
            this.renderer.drawTrajectory(this.trajectoryPoints, this.currentWeapon.color);
        }

        // Draw aim line
        if (this.isAiming && currentTank) {
            this.renderer.drawAimLine(currentTank, currentTank.angle, this.aimPower);
        }

        // Draw projectile
        if (this.projectile) {
            this.renderer.drawProjectile(this.projectile);
        }

        // Draw explosions
        for (let explosion of this.explosions) {
            this.renderer.drawExplosion(explosion);
        }
    }

    /**
     * Mouse down handler
     */
    onMouseDown(e) {
        if (this.state !== 'playing') return;
        if (this.projectile) return;

        const currentTank = this.getCurrentTank();
        if (!currentTank || currentTank.isAI) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicking on current tank
        const dx = x - currentTank.x;
        const dy = y - currentTank.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < currentTank.radius + 20) {
            this.isAiming = true;
            this.aimStartX = x;
            this.aimStartY = y;
        }
    }

    /**
     * Mouse move handler
     */
    onMouseMove(e) {
        if (!this.isAiming) return;

        const currentTank = this.getCurrentTank();
        if (!currentTank) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate angle
        const dx = x - currentTank.x;
        const dy = y - currentTank.y;
        currentTank.angle = Math.atan2(dy, dx);

        // Calculate power from drag distance
        const dragDist = Math.sqrt(
            (x - this.aimStartX) ** 2 + (y - this.aimStartY) ** 2
        );
        this.aimPower = Math.min(100, (dragDist / 2));

        // Update UI
        this.ui.updateAngle(currentTank.angle);
        this.ui.updatePower(this.aimPower);

        // Update trajectory preview
        this.updateTrajectoryPreview();
    }

    /**
     * Mouse up handler
     */
    onMouseUp(e) {
        if (!this.isAiming) return;

        this.isAiming = false;

        const currentTank = this.getCurrentTank();
        if (!currentTank) return;

        // Fire if power is sufficient
        if (this.aimPower > 10) {
            this.fireWeapon(currentTank.angle, this.aimPower);
        }

        this.aimPower = 0;
        this.trajectoryPoints = [];
    }

    /**
     * Update trajectory preview
     */
    updateTrajectoryPreview() {
        const currentTank = this.getCurrentTank();
        if (!currentTank) return;

        this.trajectoryPoints = simulateTrajectory(
            currentTank.x,
            currentTank.y,
            currentTank.angle,
            this.aimPower,
            this.currentWeapon,
            this.stage.gravity,
            this.wind
        );
    }

    /**
     * Fire weapon
     */
    fireWeapon(angle, power) {
        const currentTank = this.getCurrentTank();
        if (!currentTank) {
            console.error('fireWeapon: No current tank!');
            return;
        }

        console.log(`Firing weapon: Tank ${currentTank.id}, angle=${angle.toFixed(2)}, power=${power.toFixed(1)}`);

        this.projectile = new Projectile(
            currentTank.x,
            currentTank.y,
            angle,
            power,
            this.currentWeapon,
            this.stage.gravity,
            this.wind
        );

        this.state = 'animating';
        console.log('State changed to animating');
    }

    /**
     * Execute AI turn
     */
    executeAITurn(tank) {
        console.log('executeAITurn called for tank', tank.id);
        console.log('Current state:', this.state);
        console.log('Projectile exists:', !!this.projectile);

        if (this.projectile) {
            console.log('Skipping AI turn - projectile already exists');
            return;
        }

        if (this.state !== 'playing') {
            console.log('Skipping AI turn - state is not playing:', this.state);
            return;
        }

        console.log('AI calculating shot...');
        const enemyTanks = this.tanks.filter(t => t !== tank);
        const shot = tank.ai.calculateShot(
            tank,
            enemyTanks,
            this.terrain,
            this.stage,
            this.currentWeapon
        );

        console.log('AI shot calculated:', shot);
        tank.angle = shot.angle;
        this.ui.updateAngle(shot.angle);
        this.ui.updatePower(shot.power);

        // Fire after short delay
        console.log('AI will fire in 500ms...');
        setTimeout(() => {
            console.log('AI firing now!');
            this.fireWeapon(shot.angle, shot.power);
        }, 500);
    }

    /**
     * End current turn
     */
    endTurn() {
        console.log('endTurn called');

        // Check for game over
        const aliveTanks = this.tanks.filter(t => t.isAlive);
        console.log('Alive tanks:', aliveTanks.length);

        if (aliveTanks.length <= 1) {
            console.log('Game over!');
            this.endGame(aliveTanks[0]);
            return;
        }

        // Move to next tank
        do {
            this.currentTankIndex = (this.currentTankIndex + 1) % this.tanks.length;
        } while (!this.getCurrentTank().isAlive);

        const currentTank = this.getCurrentTank();
        console.log('Next turn: Tank', currentTank.id, 'isAI:', currentTank.isAI);

        // Generate new wind
        this.wind = generateWind(this.stage.windRange);

        this.state = 'playing';
        this.projectile = null; // Clear projectile
        console.log('State set to playing, projectile cleared');

        this.updateUI();

        // Check if next tank is AI and trigger its turn
        if (currentTank && currentTank.isAI) {
            console.log('Next tank is AI, will execute turn in 1500ms');
            setTimeout(() => {
                this.executeAITurn(currentTank);
            }, 1500);
        } else {
            console.log('Next tank is human player');
        }
    }

    /**
     * End game
     */
    endGame(winner) {
        this.state = 'gameOver';

        if (winner) {
            const winnerName = winner.isAI ? `AI Tank ${winner.id + 1}` : `Player ${winner.id + 1}`;
            this.ui.showGameOver(winnerName, winner.color);
        } else {
            this.ui.showGameOver('Draw!', '#fff');
        }
    }

    /**
     * Get current tank
     */
    getCurrentTank() {
        return this.tanks[this.currentTankIndex];
    }

    /**
     * Select weapon
     */
    selectWeapon(weaponId) {
        if (this.state !== 'playing') return;

        const weapon = getWeapon(weaponId);
        if (weapon) {
            this.currentWeapon = weapon;
            this.ui.updateWeapon(weapon.name);
            this.updateTrajectoryPreview();
        }
    }

    /**
     * Update UI
     */
    updateUI() {
        const currentTank = this.getCurrentTank();
        if (currentTank) {
            const playerName = currentTank.isAI ?
                `AI Tank ${currentTank.id + 1}` :
                `Player ${currentTank.id + 1}`;
            this.ui.updatePlayer(playerName, currentTank.color);
        }

        this.ui.updateWind(this.wind);
        this.ui.updateWeapon(this.currentWeapon.name);
        this.ui.updateAngle(currentTank.angle);
        this.ui.updatePower(0);
    }
}
