/**
 * EnergyManager
 * Manages tank energy pool, heat generation, regeneration, and cooling
 * Based on energy_system.json specifications
 */

export class EnergyManager {
    constructor(config) {
        this.config = config;

        // Energy system
        this.maxEnergy = config.energyEconomy.baseEnergy.maximum;
        this.currentEnergy = config.energyEconomy.baseEnergy.startingAmount;
        this.minReserve = config.energyEconomy.baseEnergy.minimumReserve;
        this.baseRegen = config.energyEconomy.regeneration.baseRegenPerTurn;

        // Heat system
        this.maxHeat = config.heatSystem.heatPool.maximum;
        this.currentHeat = config.heatSystem.heatPool.startingHeat;
        this.passiveCooling = config.heatSystem.heatDissipation.passiveCoolingPerTurn;
        this.overheatThreshold = config.heatSystem.heatPool.overheatThreshold;
        this.criticalThreshold = config.heatSystem.heatPool.criticalThreshold;
        this.warningThreshold = config.heatSystem.heatPool.warningThreshold;

        // State
        this.isOverheated = false;
        this.overheatTurnsRemaining = 0;
    }

    /**
     * Regenerate energy at start of turn
     * Heat reduces regeneration efficiency
     */
    regenerateEnergy(stageModifier = 1.0, terrainModifier = 1.0) {
        if (this.isOverheated) {
            return 0;
        }

        const heatFactor = this.currentHeat / this.maxHeat;
        const heatPenalty = this.config.energyEconomy.regeneration.heatEfficiencyModifier.heatPenaltyFactor;
        const efficiency = 1.0 - (heatFactor * heatPenalty);

        const actualRegen = this.baseRegen * efficiency * stageModifier * terrainModifier;
        this.currentEnergy = Math.min(this.maxEnergy, this.currentEnergy + actualRegen);

        return actualRegen;
    }

    /**
     * Consume energy (for weapons, movement, abilities)
     */
    consumeEnergy(amount) {
        if (this.isOverheated) {
            return false;
        }

        if (this.currentEnergy - amount < this.minReserve) {
            return false; // Not enough energy
        }

        this.currentEnergy -= amount;
        return true;
    }

    /**
     * Generate heat (from weapon usage)
     */
    generateHeat(amount) {
        this.currentHeat = Math.min(this.maxHeat, this.currentHeat + amount);

        // Check for overheat
        if (this.currentHeat >= this.overheatThreshold && !this.isOverheated) {
            this.triggerOverheat();
        }
    }

    /**
     * Cool heat passively at start of turn
     */
    coolHeat(environmentModifier = 1.0) {
        if (this.isOverheated) {
            // Emergency cooling during overheat
            const emergencyCooling = this.config.heatSystem.overheat.emergencyCoolingRate;
            this.currentHeat = Math.max(0, this.currentHeat - emergencyCooling);

            // Check if recovered from overheat
            if (this.currentHeat < this.overheatThreshold * 0.5) {
                this.recoverFromOverheat();
            }
        } else {
            const cooling = this.passiveCooling * environmentModifier;
            this.currentHeat = Math.max(0, this.currentHeat - cooling);
        }
    }

    /**
     * Active cooling - spend energy to cool faster
     */
    activeCool(heatAmount) {
        if (this.isOverheated) {
            return false; // Can't use active systems when overheated
        }

        const energyCost = heatAmount * this.config.heatSystem.heatDissipation.activeCooling.energyCostPerHeat;

        if (!this.consumeEnergy(energyCost)) {
            return false;
        }

        this.currentHeat = Math.max(0, this.currentHeat - heatAmount);
        return true;
    }

    /**
     * Trigger overheat state
     */
    triggerOverheat() {
        this.isOverheated = true;
        this.overheatTurnsRemaining = this.config.heatSystem.overheat.disableDuration;
        console.log('OVERHEAT! Systems disabled for', this.overheatTurnsRemaining, 'turn(s)');
    }

    /**
     * Recover from overheat
     */
    recoverFromOverheat() {
        this.isOverheated = false;
        this.overheatTurnsRemaining = 0;
        console.log('Systems recovered from overheat');
    }

    /**
     * Process turn (called at start of each turn)
     */
    processTurn(stageModifier = 1.0, terrainModifier = 1.0, environmentModifier = 1.0) {
        // Cool heat first
        this.coolHeat(environmentModifier);

        // Handle overheat turns
        if (this.isOverheated) {
            this.overheatTurnsRemaining--;
            if (this.overheatTurnsRemaining <= 0) {
                this.recoverFromOverheat();
            }
            return { energyRegen: 0, heatCooled: this.passiveCooling * environmentModifier };
        }

        // Regenerate energy
        const energyRegen = this.regenerateEnergy(stageModifier, terrainModifier);

        return {
            energyRegen,
            heatCooled: this.passiveCooling * environmentModifier
        };
    }

    /**
     * Get heat status
     */
    getHeatStatus() {
        if (this.isOverheated) {
            return 'overheated';
        } else if (this.currentHeat >= this.criticalThreshold) {
            return 'critical';
        } else if (this.currentHeat >= this.warningThreshold) {
            return 'hot';
        } else if (this.currentHeat >= 40) {
            return 'warm';
        }
        return 'optimal';
    }

    /**
     * Get heat effects (accuracy, regen multipliers)
     */
    getHeatEffects() {
        const status = this.getHeatStatus();
        const effects = this.config.heatSystem.heatEffects.thresholds;

        if (status === 'overheated') return effects['100+'];
        if (status === 'critical') return effects['80-100'];
        if (status === 'hot') return effects['60-80'];
        if (status === 'warm') return effects['40-60'];
        return effects['0-40'];
    }

    /**
     * Calculate movement cost
     */
    getMovementCost(steps = 1, terrainType = 'flat', slopeAngle = 0, hoverHeight = 0.5) {
        const baseCost = this.config.movementCosts.baseCost.perStep;
        const terrainMultiplier = this.config.movementCosts.terrainMultipliers[terrainType] || 1.0;

        // Slope modifier
        const maxSlope = this.config.movementCosts.slopeModifier.maxSlopeAngle;
        const slopePenalty = this.config.movementCosts.slopeModifier.slopePenalty;
        const slopeMod = 1 + (Math.abs(slopeAngle) / maxSlope) * slopePenalty;

        // Hover height cost
        let hoverMult = 1.0;
        if (hoverHeight <= 0.3) {
            hoverMult = this.config.movementCosts.hoverHeightCost.lowHover.multiplier;
        } else if (hoverHeight >= 0.7) {
            hoverMult = this.config.movementCosts.hoverHeightCost.highHover.multiplier;
        }

        // Consecutive step penalty
        const penalties = this.config.movementCosts.consecutiveMovePenalty;
        const penaltyKeys = ['firstStep', 'secondStep', 'thirdStep', 'fourthStep', 'fifthStep'];
        const stepPenalty = penalties[penaltyKeys[Math.min(steps - 1, 4)]];

        return baseCost * terrainMultiplier * slopeMod * hoverMult * stepPenalty;
    }

    /**
     * Can afford action?
     */
    canAfford(energyCost) {
        return !this.isOverheated && (this.currentEnergy - energyCost >= this.minReserve);
    }

    /**
     * Get state for UI display
     */
    getState() {
        return {
            energy: this.currentEnergy,
            maxEnergy: this.maxEnergy,
            energyPercent: (this.currentEnergy / this.maxEnergy) * 100,
            heat: this.currentHeat,
            maxHeat: this.maxHeat,
            heatPercent: (this.currentHeat / this.maxHeat) * 100,
            heatStatus: this.getHeatStatus(),
            isOverheated: this.isOverheated,
            overheatTurnsRemaining: this.overheatTurnsRemaining
        };
    }

    /**
     * Reset to starting state
     */
    reset() {
        this.currentEnergy = this.config.energyEconomy.baseEnergy.startingAmount;
        this.currentHeat = this.config.heatSystem.heatPool.startingHeat;
        this.isOverheated = false;
        this.overheatTurnsRemaining = 0;
    }
}
