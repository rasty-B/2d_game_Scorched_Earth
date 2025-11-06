/**
 * Planetary Stage Configurations
 * Each stage has unique gravity, wind, terrain, and visual settings
 */

export const STAGES = {
    lunaCrater: {
        name: "Luna Crater",
        gravity: 0.3,
        windRange: [-10, 10],
        terrainProfile: "crater",
        hazards: [],
        colors: {
            sky: ['#0a0a15', '#1a1a2e'],
            terrain: '#6b6b7b',
            terrainDark: '#4a4a5a',
            stars: true
        },
        description: "Low gravity moon with crater terrain. Shots travel far!"
    },

    redFrontier: {
        name: "Red Frontier",
        gravity: 0.7,
        windRange: [-15, 15],
        terrainProfile: "dunes",
        hazards: [],
        colors: {
            sky: ['#3d1a1a', '#6b2d2d'],
            terrain: '#c85a3c',
            terrainDark: '#8b3a2c',
            stars: false
        },
        description: "Mars-like planet with rolling dunes and steady wind."
    },

    gasgiantRim: {
        name: "Gas Giant Rim",
        gravity: 1.3,
        windRange: [-30, 30],
        terrainProfile: "platforms",
        hazards: [],
        colors: {
            sky: ['#1a2d4d', '#2d4d7d'],
            terrain: '#5d6d7e',
            terrainDark: '#3d4d5e',
            stars: true
        },
        description: "High gravity with strong, variable winds. Wind changes often!"
    },

    iceMoon: {
        name: "Ice Moon",
        gravity: 0.6,
        windRange: [-12, 12],
        terrainProfile: "icy",
        hazards: [],
        colors: {
            sky: ['#0d1f2d', '#1a3a4d'],
            terrain: '#a8d8ea',
            terrainDark: '#7ab8ca',
            stars: true
        },
        description: "Frozen world with icy cliffs and steady crosswinds."
    },

    magmaCore: {
        name: "Magma Core",
        gravity: 1.4,
        windRange: [-25, 25],
        terrainProfile: "volcanic",
        hazards: ['lavaPools'],
        colors: {
            sky: ['#1a0a0a', '#2d1414'],
            terrain: '#2d2d2d',
            terrainDark: '#1a1a1a',
            lava: '#ff4500',
            stars: false
        },
        description: "Volcanic hellscape. High gravity and lava pools mean instant death!"
    }
};

/**
 * Get a random stage
 */
export function getRandomStage() {
    const stageKeys = Object.keys(STAGES);
    const randomKey = stageKeys[Math.floor(Math.random() * stageKeys.length)];
    return STAGES[randomKey];
}

/**
 * Get stage by key
 */
export function getStage(key) {
    return STAGES[key] || STAGES.lunaCrater;
}
