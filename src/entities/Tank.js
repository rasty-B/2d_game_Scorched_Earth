/**
 * Tank
 * Enhanced tank entity with energy management, heat tracking, and movement
 */

import { EnergyManager } from '../core/EnergyManager.js';

export class Tank {
    constructor(id, x, y, color, energyConfig, isAI = false) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.color = color;
        this.isAI = isAI;

        // Physical properties
        this.angle = -Math.PI / 4; // Default 45 degrees up
        this.radius = 12;
        this.hp = 100;
        this.maxHp = 100;
        this.isAlive = true;

        // Energy system
        this.energyManager = new EnergyManager(energyConfig);

        // Hover properties
        this.hoverHeight = 0.5; // 0.3 to 0.7
        this.groundY = y; // Current ground level

        // Movement
        this.movementSteps = 0; // Steps moved this turn
        this.maxStepsPerTurn = 5;

        // Available weapons (weapon IDs)
        this.availableWeapons = [];
        this.currentWeaponId = null;
    }

    /**
     * Take damage
     */
    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
            this.isAlive = false;
        }
    }

    /**
     * Set angle (clamped to reasonable range)
     */
    setAngle(angle) {
        this.angle = Math.max(-Math.PI, Math.min(0, angle));
    }

    /**
     * Update position (settle on terrain)
     */
    updatePosition(terrainHeightFunc) {
        const groundY = terrainHeightFunc(this.x);
        this.groundY = groundY;
        this.y = groundY - this.radius - this.hoverHeight;
    }

    /**
     * Move horizontally
     */
    move(dx, terrainHeightFunc, energyManager) {
        if (!this.isAlive) return false;
        if (this.movementSteps >= this.maxStepsPerTurn) return false;

        // Calculate movement cost
        const terrainType = 'flat'; // TODO: Get from terrain analysis
        const slopeAngle = 0; // TODO: Calculate from terrain
        const cost = energyManager.getMovementCost(
            this.movementSteps + 1,
            terrainType,
            slopeAngle,
            this.hoverHeight
        );

        // Check if can afford
        if (!energyManager.canAfford(cost)) {
            return false;
        }

        // Consume energy
        if (!energyManager.consumeEnergy(cost)) {
            return false;
        }

        // Move
        this.x += dx;
        this.movementSteps++;

        // Update position on terrain
        this.updatePosition(terrainHeightFunc);

        return true;
    }

    /**
     * Set hover height
     */
    setHoverHeight(height) {
        this.hoverHeight = Math.max(0.3, Math.min(0.7, height));
    }

    /**
     * Process turn start
     */
    startTurn(stageModifier = 1.0, terrainModifier = 1.0, environmentModifier = 1.0) {
        // Reset movement
        this.movementSteps = 0;

        // Process energy regeneration and heat cooling
        return this.energyManager.processTurn(stageModifier, terrainModifier, environmentModifier);
    }

    /**
     * End turn
     */
    endTurn() {
        // Nothing to do for now
    }

    /**
     * Get render position (accounting for hover)
     */
    getRenderPosition() {
        return {
            x: this.x,
            y: this.y,
            groundY: this.groundY,
            hoverHeight: this.hoverHeight
        };
    }

    /**
     * Get state for UI
     */
    getState() {
        return {
            id: this.id,
            hp: this.hp,
            maxHp: this.maxHp,
            hpPercent: (this.hp / this.maxHp) * 100,
            isAlive: this.isAlive,
            energy: this.energyManager.getState(),
            angle: this.angle,
            angleDegrees: (this.angle * 180 / Math.PI).toFixed(1),
            movementSteps: this.movementSteps,
            maxStepsPerTurn: this.maxStepsPerTurn,
            hoverHeight: this.hoverHeight
        };
    }

    /**
     * Reset for new game
     */
    reset() {
        this.hp = this.maxHp;
        this.isAlive = true;
        this.movementSteps = 0;
        this.energyManager.reset();
    }
}
