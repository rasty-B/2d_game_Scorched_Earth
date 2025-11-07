/**
 * LevelManager
 * Loads and manages level data from JSON files
 * Handles terrain, hazards, spawn points, and level-specific physics
 */

export class LevelManager {
    constructor() {
        this.currentLevel = null;
        this.levels = {};
    }

    /**
     * Load level from JSON file
     */
    async loadLevel(levelPath) {
        try {
            const response = await fetch(levelPath);
            const levelData = await response.json();

            this.currentLevel = levelData;
            this.levels[levelData.id] = levelData;

            console.log('Level loaded:', levelData.name, levelData.id);
            return levelData;
        } catch (error) {
            console.error('Failed to load level:', error);
            return null;
        }
    }

    /**
     * Load MVP Stage 1 (default level)
     */
    async loadMVPStage01() {
        return await this.loadLevel('/levels/mvp_stage_01.json');
    }

    /**
     * Get current level
     */
    getCurrentLevel() {
        return this.currentLevel;
    }

    /**
     * Get spawn points
     */
    getSpawnPoints() {
        if (!this.currentLevel) return [];
        return this.currentLevel.spawns || [];
    }

    /**
     * Get spawn position for tank index
     */
    getSpawnPosition(tankIndex, totalTanks) {
        const spawns = this.getSpawnPoints();
        if (spawns.length === 0) return null;

        // Distribute tanks across available spawns
        const spawnIndex = tankIndex % spawns.length;
        return spawns[spawnIndex].position;
    }

    /**
     * Get terrain polyline
     */
    getTerrainPolyline() {
        if (!this.currentLevel) return [];
        return this.currentLevel.terrain?.points || [];
    }

    /**
     * Get cave ceiling segments
     */
    getCaveCeiling() {
        if (!this.currentLevel) return [];
        return this.currentLevel.caveCeiling || [];
    }

    /**
     * Get hazard zones
     */
    getHazards() {
        if (!this.currentLevel) return [];
        return this.currentLevel.hazards || [];
    }

    /**
     * Check if point is in hazard zone
     */
    getHazardAt(x, y) {
        const hazards = this.getHazards();

        for (const hazard of hazards) {
            const dx = x - hazard.center.x;
            const dy = y - hazard.center.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= hazard.radius) {
                return {
                    ...hazard,
                    distance: dist,
                    intensity: hazard.intensity * (1 - dist / hazard.radius) // Falloff
                };
            }
        }

        return null;
    }

    /**
     * Get physics overrides
     */
    getPhysicsOverrides() {
        if (!this.currentLevel) return {};
        return this.currentLevel.physicsOverrides || {};
    }

    /**
     * Get gravity for level
     */
    getGravity() {
        const overrides = this.getPhysicsOverrides();
        return overrides.gravity !== undefined ? overrides.gravity : -9.8;
    }

    /**
     * Get wind range for level
     */
    getWindRange() {
        const overrides = this.getPhysicsOverrides();
        return overrides.windRange || [-5, 5];
    }

    /**
     * Get background configuration
     */
    getBackground() {
        if (!this.currentLevel) return {};
        return this.currentLevel.background || {};
    }

    /**
     * Get level metadata
     */
    getMetadata() {
        if (!this.currentLevel) return {};
        return this.currentLevel.metadata || {};
    }

    /**
     * Get world dimensions
     */
    getWorldDimensions() {
        if (!this.currentLevel) return { width: 1280, height: 720 };
        return {
            width: this.currentLevel.worldWidth || 1280,
            height: this.currentLevel.worldHeight || 720
        };
    }

    /**
     * Interpolate terrain height at given x position
     * Uses linear interpolation between terrain points
     */
    getTerrainHeightAt(x) {
        const points = this.getTerrainPolyline();
        if (points.length < 2) return 0;

        // Find surrounding points
        let leftPoint = points[0];
        let rightPoint = points[points.length - 1];

        for (let i = 0; i < points.length - 1; i++) {
            if (x >= points[i].x && x <= points[i + 1].x) {
                leftPoint = points[i];
                rightPoint = points[i + 1];
                break;
            }
        }

        // Clamp to edges
        if (x <= points[0].x) return points[0].y;
        if (x >= points[points.length - 1].x) return points[points.length - 1].y;

        // Linear interpolation
        const t = (x - leftPoint.x) / (rightPoint.x - leftPoint.x);
        return leftPoint.y + t * (rightPoint.y - leftPoint.y);
    }

    /**
     * Check if point collides with terrain
     */
    isPointInTerrain(x, y) {
        const terrainY = this.getTerrainHeightAt(x);
        return y >= terrainY;
    }

    /**
     * Check if point collides with cave ceiling
     */
    isPointInCaveCeiling(x, y) {
        const ceiling = this.getCaveCeiling();

        for (const segment of ceiling) {
            const { from, to } = segment;

            // Check if x is within segment range
            if (x < from.x || x > to.x) continue;

            // Linear interpolation for ceiling height
            const t = (x - from.x) / (to.x - from.x);
            const ceilingY = from.y + t * (to.y - from.y);

            if (y <= ceilingY) {
                return true;
            }
        }

        return false;
    }

    /**
     * Reset level state
     */
    reset() {
        // Level data stays loaded, just reset any dynamic state if needed
    }
}
