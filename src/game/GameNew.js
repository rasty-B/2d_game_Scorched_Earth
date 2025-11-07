/**
 * Game - Rebuilt with Energy System Integration
 * Main game controller integrating all new systems
 */

import { ConfigLoader } from '../core/ConfigLoader.js';
import { WeaponSystem } from '../core/WeaponSystem.js';
import { LevelManager } from '../core/LevelManager.js';
import { Tank } from '../entities/Tank.js';
import { Projectile } from '../entities/Projectile.js';
import { Renderer } from '../renderer.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);

        // Core systems
        this.configLoader = new ConfigLoader();
        this.weaponSystem = new WeaponSystem();
        this.levelManager = new LevelManager();

        // Game state
        this.state = 'loading'; // loading, menu, playing, animating, gameOver
        this.tanks = [];
        this.currentTankIndex = 0;
        this.projectile = null;
        this.wind = 0;

        // Aiming
        this.isAiming = false;
        this.aimStartX = 0;
        this.aimStartY = 0;
        this.aimPower = 0;

        // Animation
        this.lastTime = 0;
        this.fixedTimestep = 0.01666667; // 60 Hz

        this.init();
    }

    /**
     * Initialize game systems
     */
    async init() {
        console.log('=== Initializing Game Systems ===');

        // Load configurations
        await this.configLoader.loadAll();
        await this.weaponSystem.loadWeapons();
        await this.levelManager.loadMVPStage01();

        this.fixedTimestep = this.configLoader.getFixedTimestep();

        console.log('All systems initialized');
        this.state = 'menu';
        this.showMenu();
        this.setupEventListeners();

        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * Show menu
     */
    showMenu() {
        const menu = document.getElementById('game-menu');
        if (menu) {
            menu.classList.remove('hidden');
        }
        this.updateHUDVisibility(false);
    }

    /**
     * Hide menu
     */
    hideMenu() {
        const menu = document.getElementById('game-menu');
        if (menu) {
            menu.classList.add('hidden');
        }
        this.updateHUDVisibility(true);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Start game button
        const startBtn = document.getElementById('start-game');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                const tankCount = 2; // Fixed for MVP
                this.startGame(tankCount);
            });
        }

        // Canvas mouse events
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.state !== 'playing') return;

            const currentTank = this.getCurrentTank();
            if (!currentTank || currentTank.isAI) return;

            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                    currentTank.angle -= 0.05;
                    this.updateUI();
                    break;
                case 'ArrowRight':
                case 'd':
                    currentTank.angle += 0.05;
                    this.updateUI();
                    break;
                case ' ':
                    if (!this.isAiming && !this.projectile) {
                        this.fireWeapon(currentTank.angle, 50);
                    }
                    break;
                case '1':
                case '2':
                    this.selectWeapon(parseInt(e.key) - 1);
                    break;
            }
        });
    }

    /**
     * Start new game
     */
    startGame(tankCount) {
        console.log('Starting game with', tankCount, 'tanks');
        this.hideMenu();

        // Get configurations
        const energyConfig = this.configLoader.getEnergyConfig();
        const level = this.levelManager.getCurrentLevel();

        if (!energyConfig || !level) {
            console.error('Failed to load required configurations');
            return;
        }

        // Setup wind
        const windRange = this.levelManager.getWindRange();
        this.wind = windRange[0] + Math.random() * (windRange[1] - windRange[0]);

        // Create tanks
        this.tanks = [];
        const colors = ['#4ecca3', '#e74c3c', '#f39c12', '#9b59b6'];

        for (let i = 0; i < tankCount; i++) {
            const spawnPos = this.levelManager.getSpawnPosition(i, tankCount);
            if (!spawnPos) continue;

            const tank = new Tank(
                i,
                spawnPos.x,
                spawnPos.y,
                colors[i % colors.length],
                energyConfig,
                i >= 1 // Second tank is AI for testing
            );

            // Give starting weapons
            const startingWeapons = this.weaponSystem.getStartingWeapons();
            tank.availableWeapons = startingWeapons.map(w => w.id);
            tank.currentWeaponId = tank.availableWeapons[0];

            // Update position on terrain
            tank.updatePosition((x) => this.levelManager.getTerrainHeightAt(x));

            this.tanks.push(tank);
        }

        // Setup game state
        this.currentTankIndex = 0;
        this.state = 'playing';

        // Start first turn
        this.startTurn();

        console.log('Game started');
    }

    /**
     * Start turn
     */
    startTurn() {
        const currentTank = this.getCurrentTank();
        if (!currentTank) return;

        // Regenerate energy and cool heat
        const turnResult = currentTank.startTurn(1.0, 1.0, 1.0);
        console.log(`Turn ${this.currentTankIndex}: Energy +${turnResult.energyRegen.toFixed(1)}, Heat -${turnResult.heatCooled}`);

        // Update weapon cooldowns
        this.weaponSystem.processTurn();

        // Update UI
        this.updateUI();

        // TODO: AI turn if needed
    }

    /**
     * End turn
     */
    endTurn() {
        console.log('Ending turn');

        // Check for game over
        const aliveTanks = this.tanks.filter(t => t.isAlive);
        if (aliveTanks.length <= 1) {
            this.endGame(aliveTanks[0]);
            return;
        }

        // Move to next tank
        do {
            this.currentTankIndex = (this.currentTankIndex + 1) % this.tanks.length;
        } while (!this.getCurrentTank().isAlive);

        // Generate new wind
        const windRange = this.levelManager.getWindRange();
        this.wind = windRange[0] + Math.random() * (windRange[1] - windRange[0]);

        this.state = 'playing';
        this.projectile = null;

        this.startTurn();
    }

    /**
     * End game
     */
    endGame(winner) {
        this.state = 'gameOver';
        const winnerText = winner ? `Tank ${winner.id + 1} Wins!` : 'Draw!';
        console.log('Game Over:', winnerText);
        alert(winnerText); // TODO: Better game over screen
    }

    /**
     * Main game loop
     */
    gameLoop(currentTime = 0) {
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        if (this.state !== 'menu' && this.state !== 'loading') {
            this.update(dt);
            this.render();
        } else if (this.state === 'menu') {
            // Render menu background
            this.renderMenuBackground();
        }

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * Update game state
     */
    update(dt) {
        // Update projectile
        if (this.projectile && this.projectile.active) {
            this.projectile.update(dt * 60, this.levelManager, this.tanks);

            if (!this.projectile.active) {
                console.log('Projectile impact');

                const explosion = this.projectile.onImpact(
                    this.projectile.x,
                    this.projectile.y,
                    this.levelManager,
                    this.tanks
                );

                // Spawn particles
                if (explosion) {
                    this.renderer.addParticles(explosion.x, explosion.y, 20, explosion.color);
                }

                // End turn after delay
                setTimeout(() => {
                    this.endTurn();
                }, 1000);
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

        const level = this.levelManager.getCurrentLevel();
        if (!level) return;

        // Draw sky
        const background = this.levelManager.getBackground();
        this.renderer.drawLevelSky(background);

        // Draw terrain
        this.renderer.drawLevelTerrain(this.levelManager);

        // Draw cave ceiling
        this.renderer.drawCaveCeiling(this.levelManager.getCaveCeiling());

        // Draw hazards
        this.renderer.drawHazards(this.levelManager.getHazards());

        // Draw tanks
        const currentTank = this.getCurrentTank();
        for (const tank of this.tanks) {
            this.renderer.drawTank(tank, tank === currentTank);
        }

        // Draw projectile
        if (this.projectile && this.projectile.active) {
            this.renderer.drawProjectile(this.projectile);
        }

        // Draw aim line
        if (this.isAiming && currentTank) {
            this.renderer.drawAimLine(currentTank, currentTank.angle, this.aimPower);
        }
    }

    /**
     * Render menu background
     */
    renderMenuBackground() {
        this.renderer.clear();
        // TODO: Nice background
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

        // Check if clicking on tank
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

        // Calculate power
        const dragDist = Math.sqrt(
            (x - this.aimStartX) ** 2 + (y - this.aimStartY) ** 2
        );
        this.aimPower = Math.min(100, dragDist / 2);

        this.updateUI();
    }

    /**
     * Mouse up handler
     */
    onMouseUp(e) {
        if (!this.isAiming) return;

        this.isAiming = false;

        const currentTank = this.getCurrentTank();
        if (!currentTank) return;

        if (this.aimPower > 10) {
            this.fireWeapon(currentTank.angle, this.aimPower);
        }

        this.aimPower = 0;
    }

    /**
     * Fire weapon
     */
    fireWeapon(angle, power) {
        const currentTank = this.getCurrentTank();
        if (!currentTank) return;

        const weaponId = currentTank.currentWeaponId;
        const weapon = this.weaponSystem.getWeapon(weaponId);

        if (!weapon) {
            console.error('No weapon selected');
            return;
        }

        // Try to fire (checks energy, cooldowns, etc.)
        if (!this.weaponSystem.fireWeapon(weaponId, currentTank.energyManager)) {
            console.warn('Cannot fire weapon');
            return;
        }

        // Create projectile
        const gravity = this.levelManager.getGravity();
        this.projectile = new Projectile(
            currentTank.x,
            currentTank.y,
            angle,
            power,
            weapon,
            gravity,
            this.wind
        );

        this.state = 'animating';
        this.updateUI();

        console.log(`Fired ${weapon.name}`);
    }

    /**
     * Select weapon
     */
    selectWeapon(index) {
        const currentTank = this.getCurrentTank();
        if (!currentTank) return;

        if (index < currentTank.availableWeapons.length) {
            currentTank.currentWeaponId = currentTank.availableWeapons[index];
            this.updateUI();
        }
    }

    /**
     * Get current tank
     */
    getCurrentTank() {
        return this.tanks[this.currentTankIndex];
    }

    /**
     * Update UI
     */
    updateUI() {
        const currentTank = this.getCurrentTank();
        if (!currentTank) return;

        const tankState = currentTank.getState();
        const weapon = this.weaponSystem.getWeapon(currentTank.currentWeaponId);

        // Update player info
        this.updateElement('current-player', `Tank ${currentTank.id + 1}`);
        this.updateElement('current-weapon', weapon?.name || 'None');

        // Update energy bar
        this.updateBar('energy-fill', tankState.energy.energyPercent);
        this.updateElement('energy-value', `${Math.round(tankState.energy.energy)}/${tankState.energy.maxEnergy}`);

        // Update heat bar
        this.updateBar('heat-fill', tankState.energy.heatPercent);
        this.updateElement('heat-value', `${Math.round(tankState.energy.heat)}/${tankState.energy.maxHeat}`);

        // Update HP bar
        this.updateBar('hp-fill', tankState.hpPercent);
        this.updateElement('hp-value', `${Math.round(tankState.hp)}/${tankState.maxHp}`);

        // Update wind
        this.updateElement('wind-value', this.wind.toFixed(1));
        this.updateElement('wind-arrow', this.wind > 0 ? '→' : '←');

        // Update angle
        this.updateElement('angle-value', tankState.angleDegrees + '°');

        // Update power
        this.updateElement('power-value', Math.round(this.aimPower) + '%');
        this.updateBar('power-fill', this.aimPower);
    }

    /**
     * Update element text content
     */
    updateElement(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    /**
     * Update bar width
     */
    updateBar(id, percent) {
        const el = document.getElementById(id);
        if (el) el.style.width = Math.max(0, Math.min(100, percent)) + '%';
    }

    /**
     * Update HUD visibility
     */
    updateHUDVisibility(visible) {
        const hud = document.getElementById('hud');
        if (hud) {
            hud.style.display = visible ? 'block' : 'none';
        }
    }
}
