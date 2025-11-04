/**
 * AI System for Computer-Controlled Tanks
 * Implements difficulty levels: easy, medium, hard
 */

import { simulateTrajectory } from './physics.js';

export class TankAI {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.lastShot = null;
        this.targetTank = null;
    }

    /**
     * Calculate AI's shot for this turn
     */
    calculateShot(aiTank, enemyTanks, terrain, stage, weapon, wind = 0) {
        // Store wind for trajectory calculations
        this.wind = wind;

        // Select target (closest alive enemy)
        this.targetTank = this.selectTarget(aiTank, enemyTanks);

        if (!this.targetTank) {
            return this.randomShot();
        }

        switch (this.difficulty) {
            case 'easy':
                return this.easyShot(aiTank, this.targetTank, terrain, stage, weapon);
            case 'medium':
                return this.mediumShot(aiTank, this.targetTank, terrain, stage, weapon);
            case 'hard':
                return this.hardShot(aiTank, this.targetTank, terrain, stage, weapon);
            default:
                return this.mediumShot(aiTank, this.targetTank, terrain, stage, weapon);
        }
    }

    /**
     * Select target tank
     */
    selectTarget(aiTank, enemyTanks) {
        let closestTank = null;
        let closestDist = Infinity;

        for (let tank of enemyTanks) {
            if (!tank.isAlive || tank === aiTank) continue;

            const dx = tank.x - aiTank.x;
            const dy = tank.y - aiTank.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < closestDist) {
                closestDist = dist;
                closestTank = tank;
            }
        }

        return closestTank;
    }

    /**
     * Easy AI - Random with some direction toward target
     */
    easyShot(aiTank, target, terrain, stage, weapon) {
        const dx = target.x - aiTank.x;
        const dy = target.y - aiTank.y;

        // Calculate rough angle toward target
        let angle = Math.atan2(dy, dx);

        // Add significant random error
        angle += (Math.random() - 0.5) * Math.PI / 3; // ±30 degrees

        // Random power between 40-80%
        const power = 40 + Math.random() * 40;

        return { angle, power };
    }

    /**
     * Medium AI - Uses basic trajectory simulation with some error
     */
    mediumShot(aiTank, target, terrain, stage, weapon) {
        // Try a few quick simulations to get close
        const bestShot = this.findBestTrajectory(
            aiTank,
            target,
            terrain,
            stage,
            weapon,
            8,  // Fewer angle steps
            6   // Fewer power steps
        );

        // Add moderate random error
        bestShot.angle += (Math.random() - 0.5) * Math.PI / 8; // ±22.5 degrees
        bestShot.power += (Math.random() - 0.5) * 15;

        bestShot.power = Math.max(20, Math.min(100, bestShot.power));

        return bestShot;
    }

    /**
     * Hard AI - Simulates shots to find best trajectory
     */
    hardShot(aiTank, target, terrain, stage, weapon) {
        const bestShot = this.findBestTrajectory(
            aiTank,
            target,
            terrain,
            stage,
            weapon,
            20,  // More angle steps
            12   // More power steps
        );

        // Add minimal random error
        bestShot.angle += (Math.random() - 0.5) * Math.PI / 20; // ±4.5 degrees
        bestShot.power += (Math.random() - 0.5) * 5;

        bestShot.power = Math.max(20, Math.min(100, bestShot.power));

        return bestShot;
    }

    /**
     * Find best trajectory through simulation
     */
    findBestTrajectory(aiTank, target, terrain, stage, weapon, angleSteps = 20, powerSteps = 12) {
        let bestAngle = 0;
        let bestPower = 50;
        let bestDistance = Infinity;

        // Calculate approximate angle range toward target
        const dx = target.x - aiTank.x;
        const dy = target.y - aiTank.y;
        const roughAngle = Math.atan2(dy, dx);
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Focus search around rough angle
        const angleRange = Math.PI * 0.6; // Search ±54 degrees from rough angle
        const minAngle = Math.max(-Math.PI, roughAngle - angleRange / 2);
        const maxAngle = Math.min(0, roughAngle + angleRange / 2);

        // Use distance to estimate power range
        const estimatedPower = Math.min(100, (distance / 8) + 20);
        const minPower = Math.max(20, estimatedPower - 30);
        const maxPower = Math.min(100, estimatedPower + 30);

        for (let a = 0; a < angleSteps; a++) {
            const angle = minAngle + (a / angleSteps) * (maxAngle - minAngle);

            for (let p = 0; p < powerSteps; p++) {
                const power = minPower + (p / powerSteps) * (maxPower - minPower);

                // Simulate trajectory with current wind
                const trajectory = simulateTrajectory(
                    aiTank.x,
                    aiTank.y,
                    angle,
                    power,
                    weapon,
                    stage.gravity,
                    this.wind || 0, // Account for wind
                    3.0
                );

                // Find closest point to target when trajectory is near ground
                let closestDist = Infinity;

                for (let i = 0; i < trajectory.length; i++) {
                    const point = trajectory[i];

                    // Only consider points that are near or in terrain
                    const terrainHeight = terrain.getHeightAt(point.x);
                    if (point.y >= terrainHeight - 30) {
                        const dx = point.x - target.x;
                        const dy = point.y - target.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < closestDist) {
                            closestDist = dist;
                        }
                    }
                }

                // Update best shot if this is closer
                if (closestDist < bestDistance) {
                    bestDistance = closestDist;
                    bestAngle = angle;
                    bestPower = power;
                }
            }
        }

        return { angle: bestAngle, power: bestPower };
    }

    /**
     * Random shot fallback
     */
    randomShot() {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
        const power = 30 + Math.random() * 50;
        return { angle, power };
    }

    /**
     * Record shot result for learning
     */
    recordShot(angle, power, hitDistance) {
        this.lastShot = {
            angle,
            power,
            missDistance: hitDistance
        };
    }

    /**
     * Choose weapon (always use current weapon for MVP)
     */
    chooseWeapon(availableWeapons) {
        // For MVP, just use the first weapon
        return availableWeapons[0];
    }
}
