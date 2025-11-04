/**
 * Terrain Generation and Deformation System
 * Uses heightmap for collision detection and destruction
 */

export class Terrain {
    constructor(width, height, profile = "crater") {
        this.width = width;
        this.height = height;
        this.profile = profile;
        this.heightMap = [];
        this.generate();
    }

    /**
     * Generate terrain based on profile type
     */
    generate() {
        this.heightMap = new Array(this.width);

        switch (this.profile) {
            case "crater":
                this.generateCrater();
                break;
            case "dunes":
                this.generateDunes();
                break;
            case "platforms":
                this.generatePlatforms();
                break;
            case "icy":
                this.generateIcy();
                break;
            case "volcanic":
                this.generateVolcanic();
                break;
            default:
                this.generateRandom();
        }

        // Ensure no terrain goes below minimum or above maximum
        this.clampHeights();
    }

    /**
     * Crater terrain - sharp peaks and valleys
     */
    generateCrater() {
        const baseHeight = this.height * 0.6;
        const amplitude = this.height * 0.3;

        for (let x = 0; x < this.width; x++) {
            let height = baseHeight;

            // Add multiple crater features
            height += Math.sin(x * 0.01) * amplitude * 0.5;
            height += Math.sin(x * 0.03) * amplitude * 0.3;
            height += Math.cos(x * 0.007) * amplitude * 0.4;

            // Add some randomness
            height += (Math.random() - 0.5) * 20;

            this.heightMap[x] = Math.floor(height);
        }

        this.smoothTerrain(2);
    }

    /**
     * Dunes terrain - smooth rolling hills
     */
    generateDunes() {
        const baseHeight = this.height * 0.65;
        const amplitude = this.height * 0.25;

        for (let x = 0; x < this.width; x++) {
            let height = baseHeight;

            // Smooth sine waves for dunes
            height += Math.sin(x * 0.008) * amplitude;
            height += Math.sin(x * 0.015) * (amplitude * 0.5);
            height += Math.sin(x * 0.025) * (amplitude * 0.25);

            this.heightMap[x] = Math.floor(height);
        }

        this.smoothTerrain(5);
    }

    /**
     * Platforms terrain - flat sections with gaps
     */
    generatePlatforms() {
        const platformWidth = 120;
        const gapWidth = 60;
        const baseHeight = this.height * 0.6;
        const variance = 80;

        let x = 0;
        while (x < this.width) {
            const platformHeight = baseHeight + (Math.random() - 0.5) * variance;

            // Create platform
            for (let i = 0; i < platformWidth && x < this.width; i++, x++) {
                this.heightMap[x] = Math.floor(platformHeight);
            }

            // Create gap
            for (let i = 0; i < gapWidth && x < this.width; i++, x++) {
                this.heightMap[x] = this.height - 50; // Very low
            }
        }

        this.smoothTerrain(3);
    }

    /**
     * Icy terrain - jagged peaks
     */
    generateIcy() {
        const baseHeight = this.height * 0.65;
        const amplitude = this.height * 0.3;

        for (let x = 0; x < this.width; x++) {
            let height = baseHeight;

            // Sharp peaks
            height += Math.sin(x * 0.02) * amplitude * 0.6;
            height += Math.cos(x * 0.05) * amplitude * 0.4;
            height += (Math.random() - 0.5) * 30;

            this.heightMap[x] = Math.floor(height);
        }

        this.smoothTerrain(2);
    }

    /**
     * Volcanic terrain - rough and chaotic
     */
    generateVolcanic() {
        const baseHeight = this.height * 0.7;
        const amplitude = this.height * 0.25;

        for (let x = 0; x < this.width; x++) {
            let height = baseHeight;

            height += Math.sin(x * 0.01) * amplitude;
            height += Math.cos(x * 0.03) * amplitude * 0.5;
            height += (Math.random() - 0.5) * 40;

            this.heightMap[x] = Math.floor(height);
        }

        this.smoothTerrain(3);
    }

    /**
     * Random terrain fallback
     */
    generateRandom() {
        const baseHeight = this.height * 0.6;
        const amplitude = this.height * 0.3;

        for (let x = 0; x < this.width; x++) {
            this.heightMap[x] = Math.floor(
                baseHeight + Math.sin(x * 0.01) * amplitude + (Math.random() - 0.5) * 30
            );
        }

        this.smoothTerrain(3);
    }

    /**
     * Smooth the terrain using averaging
     */
    smoothTerrain(passes = 1) {
        for (let pass = 0; pass < passes; pass++) {
            const newMap = [...this.heightMap];

            for (let x = 1; x < this.width - 1; x++) {
                newMap[x] = Math.floor(
                    (this.heightMap[x - 1] + this.heightMap[x] + this.heightMap[x + 1]) / 3
                );
            }

            this.heightMap = newMap;
        }
    }

    /**
     * Clamp heights to valid range
     */
    clampHeights() {
        const minHeight = 100;
        const maxHeight = this.height - 50;

        for (let x = 0; x < this.width; x++) {
            this.heightMap[x] = Math.max(minHeight, Math.min(maxHeight, this.heightMap[x]));
        }
    }

    /**
     * Deform terrain from an explosion
     */
    deform(centerX, centerY, radius, additive = false) {
        const radiusSq = radius * radius;

        for (let x = Math.max(0, centerX - radius); x < Math.min(this.width, centerX + radius); x++) {
            const dx = x - centerX;
            const terrainY = this.heightMap[x];
            const dy = terrainY - centerY;
            const distSq = dx * dx + dy * dy;

            if (distSq < radiusSq) {
                const dist = Math.sqrt(distSq);
                const falloff = 1 - (dist / radius);
                const change = Math.floor(falloff * radius);

                if (additive) {
                    // Add terrain (terraformer)
                    this.heightMap[x] = Math.max(this.heightMap[x] - change, 100);
                } else {
                    // Remove terrain (explosion)
                    this.heightMap[x] = Math.min(this.heightMap[x] + change, this.height - 50);
                }
            }
        }

        this.smoothTerrain(1);
    }

    /**
     * Get height at specific x coordinate
     */
    getHeightAt(x) {
        x = Math.floor(x);
        if (x < 0 || x >= this.width) return this.height;
        return this.heightMap[x];
    }

    /**
     * Check if point is inside terrain
     */
    isInside(x, y) {
        if (x < 0 || x >= this.width) return false;
        return y >= this.getHeightAt(x);
    }

    /**
     * Get a safe spawn position on terrain
     */
    getSafeSpawnPosition(index, totalTanks) {
        const spacing = this.width / (totalTanks + 1);
        const x = Math.floor(spacing * (index + 1));
        const y = this.getHeightAt(x) - 20; // Place tank above terrain

        return { x, y };
    }

    /**
     * Find collision point with terrain
     */
    findCollision(x, y, prevX, prevY) {
        // Check if current position is in terrain
        if (this.isInside(x, y)) {
            // Simple linear interpolation to find exact collision point
            const steps = 10;
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const cx = prevX + (x - prevX) * t;
                const cy = prevY + (y - prevY) * t;

                if (this.isInside(cx, cy)) {
                    return { x: cx, y: cy };
                }
            }
            return { x, y };
        }
        return null;
    }
}
