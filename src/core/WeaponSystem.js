/**
 * WeaponSystem
 * Loads and manages weapons from weapons.json
 * Handles weapon availability, cooldowns, and firing costs
 */

export class WeaponSystem {
    constructor() {
        this.weapons = {};
        this.categories = {};
        this.weaponSets = {};
        this.cooldowns = new Map(); // weaponId -> turns remaining
        this.chargingWeapons = new Map(); // weaponId -> { turnsRemaining, turnsRequired }
    }

    /**
     * Load weapons from JSON file
     */
    async loadWeapons(weaponsPath = '/weapons.json') {
        try {
            const response = await fetch(weaponsPath);
            const data = await response.json();

            this.weapons = data.weapons;
            this.categories = data.categories;
            this.weaponSets = data.weaponSets;

            console.log('Weapons loaded:', Object.keys(this.weapons).length, 'weapons');
            return true;
        } catch (error) {
            console.error('Failed to load weapons:', error);
            return false;
        }
    }

    /**
     * Get weapon by ID
     */
    getWeapon(weaponId) {
        return this.weapons[weaponId];
    }

    /**
     * Get all weapons
     */
    getAllWeapons() {
        return Object.values(this.weapons);
    }

    /**
     * Get weapons by category
     */
    getWeaponsByCategory(category) {
        return Object.values(this.weapons).filter(w => w.category === category);
    }

    /**
     * Get weapon set by name
     */
    getWeaponSet(setName) {
        const set = this.weaponSets[setName];
        if (!set) return [];

        return set.weapons.map(id => this.weapons[id]).filter(w => w);
    }

    /**
     * Get starting weapons (starter set)
     */
    getStartingWeapons() {
        return this.getWeaponSet('starter');
    }

    /**
     * Can fire weapon? (checks cooldown, charging)
     */
    canFireWeapon(weaponId, energyManager) {
        const weapon = this.weapons[weaponId];
        if (!weapon) return { can: false, reason: 'Weapon not found' };

        // Check cooldown
        if (this.cooldowns.has(weaponId) && this.cooldowns.get(weaponId) > 0) {
            return { can: false, reason: `Cooldown: ${this.cooldowns.get(weaponId)} turns` };
        }

        // Check if charging
        if (this.chargingWeapons.has(weaponId)) {
            const charge = this.chargingWeapons.get(weaponId);
            return { can: false, reason: `Charging: ${charge.turnsRemaining}/${charge.turnsRequired} turns` };
        }

        // Check energy cost
        if (!energyManager.canAfford(weapon.energyCost)) {
            return { can: false, reason: `Need ${weapon.energyCost} energy` };
        }

        // Check if overheated
        if (energyManager.isOverheated) {
            return { can: false, reason: 'Systems overheated' };
        }

        return { can: true };
    }

    /**
     * Fire weapon (consume energy, generate heat, start cooldown/charging)
     */
    fireWeapon(weaponId, energyManager) {
        const weapon = this.weapons[weaponId];
        if (!weapon) return false;

        const canFire = this.canFireWeapon(weaponId, energyManager);
        if (!canFire.can) {
            console.warn('Cannot fire weapon:', canFire.reason);
            return false;
        }

        // Consume energy
        if (!energyManager.consumeEnergy(weapon.energyCost)) {
            return false;
        }

        // Generate heat
        energyManager.generateHeat(weapon.heatGeneration);

        // Start cooldown
        if (weapon.cooldownTurns > 0) {
            this.cooldowns.set(weaponId, weapon.cooldownTurns);
        }

        console.log(`Fired ${weapon.name}: -${weapon.energyCost}E, +${weapon.heatGeneration}H`);
        return true;
    }

    /**
     * Start charging weapon (for exotic weapons)
     */
    startCharging(weaponId, energyManager) {
        const weapon = this.weapons[weaponId];
        if (!weapon || !weapon.chargeTurnsRequired) return false;

        // Check if already charging
        if (this.chargingWeapons.has(weaponId)) {
            return false;
        }

        // Check energy cost (full cost upfront)
        if (!energyManager.canAfford(weapon.energyCost)) {
            return false;
        }

        // Consume energy upfront
        if (!energyManager.consumeEnergy(weapon.energyCost)) {
            return false;
        }

        // Start charging
        this.chargingWeapons.set(weaponId, {
            turnsRemaining: weapon.chargeTurnsRequired,
            turnsRequired: weapon.chargeTurnsRequired
        });

        console.log(`Started charging ${weapon.name}: ${weapon.chargeTurnsRequired} turns`);
        return true;
    }

    /**
     * Process turn (update cooldowns and charging)
     */
    processTurn() {
        // Update cooldowns
        for (const [weaponId, turns] of this.cooldowns.entries()) {
            if (turns > 0) {
                this.cooldowns.set(weaponId, turns - 1);
            } else {
                this.cooldowns.delete(weaponId);
            }
        }

        // Update charging weapons
        const readyWeapons = [];
        for (const [weaponId, charge] of this.chargingWeapons.entries()) {
            charge.turnsRemaining--;

            if (charge.turnsRemaining <= 0) {
                readyWeapons.push(weaponId);
                this.chargingWeapons.delete(weaponId);
                console.log(`Weapon ${weaponId} fully charged!`);
            }
        }

        return { readyWeapons };
    }

    /**
     * Get weapon status for UI
     */
    getWeaponStatus(weaponId, energyManager) {
        const weapon = this.weapons[weaponId];
        if (!weapon) return null;

        const cooldown = this.cooldowns.get(weaponId) || 0;
        const charging = this.chargingWeapons.get(weaponId);
        const canFire = this.canFireWeapon(weaponId, energyManager);

        return {
            weapon,
            cooldown,
            charging: charging ? {
                turnsRemaining: charging.turnsRemaining,
                turnsRequired: charging.turnsRequired,
                percent: ((charging.turnsRequired - charging.turnsRemaining) / charging.turnsRequired) * 100
            } : null,
            canFire: canFire.can,
            reason: canFire.reason,
            energyCost: weapon.energyCost,
            heatGeneration: weapon.heatGeneration
        };
    }

    /**
     * Get all weapon statuses for UI
     */
    getAllWeaponStatuses(availableWeapons, energyManager) {
        return availableWeapons.map(weaponId => this.getWeaponStatus(weaponId, energyManager));
    }

    /**
     * Reset cooldowns and charging (for new game)
     */
    reset() {
        this.cooldowns.clear();
        this.chargingWeapons.clear();
    }

    /**
     * Get category info
     */
    getCategory(categoryName) {
        return this.categories[categoryName];
    }
}
