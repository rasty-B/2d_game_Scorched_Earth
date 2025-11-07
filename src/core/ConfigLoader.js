/**
 * ConfigLoader
 * Loads game configuration from JSON files
 * (energy_system.json, physics_rules.json, etc.)
 */

export class ConfigLoader {
    constructor() {
        this.energyConfig = null;
        this.physicsConfig = null;
    }

    /**
     * Load all configurations
     */
    async loadAll() {
        try {
            await Promise.all([
                this.loadEnergyConfig(),
                this.loadPhysicsConfig()
            ]);
            console.log('All configurations loaded');
            return true;
        } catch (error) {
            console.error('Failed to load configurations:', error);
            return false;
        }
    }

    /**
     * Load energy system configuration
     */
    async loadEnergyConfig(path = '/energy_system.json') {
        try {
            const response = await fetch(path);
            this.energyConfig = await response.json();
            console.log('Energy system config loaded');
            return this.energyConfig;
        } catch (error) {
            console.error('Failed to load energy config:', error);
            return null;
        }
    }

    /**
     * Load physics rules configuration
     */
    async loadPhysicsConfig(path = '/physics_rules.json') {
        try {
            const response = await fetch(path);
            this.physicsConfig = await response.json();
            console.log('Physics rules config loaded');
            return this.physicsConfig;
        } catch (error) {
            console.error('Failed to load physics config:', error);
            return null;
        }
    }

    /**
     * Get energy config
     */
    getEnergyConfig() {
        return this.energyConfig;
    }

    /**
     * Get physics config
     */
    getPhysicsConfig() {
        return this.physicsConfig;
    }

    /**
     * Get fixed timestep
     */
    getFixedTimestep() {
        return this.physicsConfig?.physicsEngine?.simulation?.fixedTimestep || 0.01666667;
    }

    /**
     * Get gravity for stage
     */
    getStageGravity(stageName) {
        const stages = this.physicsConfig?.gravity?.stageModifiers;
        return stages?.[stageName]?.gravity || -9.8;
    }

    /**
     * Get hover mechanics config
     */
    getHoverMechanics() {
        return this.physicsConfig?.hoverMechanics || {};
    }
}
