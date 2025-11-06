/**
 * Terrain Pattern Generator
 * Creates procedural texture patterns for different terrain types
 */

/**
 * Creates a terrain pattern for the specified stage
 * @param {string} stageName - Stage name (lunaCrater, redFrontier, gasgiantRim, iceMoon, magmaCore)
 * @returns {CanvasPattern} Canvas pattern for terrain texture
 */
export function createTerrainPattern(stageName = "lunaCrater") {
    const size = 64;
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    const ctx = offscreenCanvas.getContext("2d");

    // Map stage names to terrain types
    const stageToType = {
        lunaCrater: "rock",
        redFrontier: "sand",
        gasgiantRim: "rock",
        iceMoon: "ice",
        magmaCore: "lava"
    };

    const terrainType = stageToType[stageName] || "rock";

    // Base colors per terrain type
    const baseColors = {
        rock: "#30343A",
        ice: "#5C7C9F",
        sand: "#6E5A33",
        lava: "#3A1B1B"
    };
    const baseColor = baseColors[terrainType] || baseColors.rock;

    // Base fill
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    // Add texture based on terrain type
    switch (terrainType) {
        case "rock":
            addRockTexture(ctx, size);
            break;
        case "ice":
            addIceTexture(ctx, size);
            break;
        case "sand":
            addSandTexture(ctx, size);
            break;
        case "lava":
            addLavaTexture(ctx, size);
            break;
    }

    return ctx.createPattern(offscreenCanvas, "repeat");
}

/**
 * Add rock texture with dark and light speckles
 */
function addRockTexture(ctx, size) {
    // Dark speckles (shadows/cracks)
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const alpha = 0.08 + Math.random() * 0.07;
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(x, y, 1, 1);
    }

    // Light speckles (highlights)
    for (let i = 0; i < 120; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const alpha = 0.06 + Math.random() * 0.06;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillRect(x, y, 1, 1);
    }

    // Add some larger rock variations
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const rockSize = 1 + Math.random() * 3;
        const alpha = 0.1 + Math.random() * 0.15;
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(x, y, rockSize, rockSize);
    }
}

/**
 * Add ice texture with crystalline patterns
 */
function addIceTexture(ctx, size) {
    // Ice crystals (bright highlights)
    for (let i = 0; i < 150; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const alpha = 0.1 + Math.random() * 0.2;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillRect(x, y, 1, 1);
    }

    // Cracks and shadows
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const alpha = 0.05 + Math.random() * 0.1;
        ctx.fillStyle = `rgba(0, 30, 60, ${alpha})`;
        ctx.fillRect(x, y, 1, 1);
    }

    // Ice shards (diagonal lines)
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const length = 2 + Math.random() * 4;
        ctx.strokeStyle = `rgba(200, 230, 255, 0.2)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + length, y + length);
        ctx.stroke();
    }
}

/**
 * Add sand texture with grain patterns
 */
function addSandTexture(ctx, size) {
    // Sand grains (subtle variation)
    for (let i = 0; i < 250; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const alpha = 0.03 + Math.random() * 0.05;
        const isDark = Math.random() > 0.5;
        ctx.fillStyle = isDark
            ? `rgba(0, 0, 0, ${alpha})`
            : `rgba(255, 200, 150, ${alpha})`;
        ctx.fillRect(x, y, 1, 1);
    }

    // Small rock fragments
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const rockSize = 1 + Math.random() * 2;
        const alpha = 0.08 + Math.random() * 0.1;
        ctx.fillStyle = `rgba(40, 30, 20, ${alpha})`;
        ctx.fillRect(x, y, rockSize, rockSize);
    }

    // Light patches (wind-blown patterns)
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const patchSize = 2 + Math.random() * 4;
        const alpha = 0.05 + Math.random() * 0.08;
        ctx.fillStyle = `rgba(255, 220, 180, ${alpha})`;
        ctx.fillRect(x, y, patchSize, patchSize);
    }
}

/**
 * Add lava texture with cracks and embers
 */
function addLavaTexture(ctx, size) {
    // Dark cracks
    for (let i = 0; i < 150; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const alpha = 0.15 + Math.random() * 0.2;
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(x, y, 1, 1);
    }

    // Lava glow spots
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const glowSize = 1 + Math.random() * 2;
        const alpha = 0.1 + Math.random() * 0.15;
        ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
        ctx.fillRect(x, y, glowSize, glowSize);
    }

    // Crack lines
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const length = 3 + Math.random() * 6;
        const angle = Math.random() * Math.PI * 2;
        ctx.strokeStyle = `rgba(255, 80, 0, 0.15)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.stroke();
    }

    // Ash/dust
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const alpha = 0.03 + Math.random() * 0.05;
        ctx.fillStyle = `rgba(100, 100, 100, ${alpha})`;
        ctx.fillRect(x, y, 1, 1);
    }
}

/**
 * Create a cached pattern map to avoid regenerating patterns
 */
const patternCache = new Map();

/**
 * Get or create a cached terrain pattern
 * @param {string} stageName - Stage name
 * @returns {CanvasPattern} Cached or newly created pattern
 */
export function getCachedTerrainPattern(stageName) {
    if (!patternCache.has(stageName)) {
        patternCache.set(stageName, createTerrainPattern(stageName));
    }
    return patternCache.get(stageName);
}

/**
 * Clear the pattern cache (useful for memory management)
 */
export function clearPatternCache() {
    patternCache.clear();
}
