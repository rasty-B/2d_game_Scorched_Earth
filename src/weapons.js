/**
 * Weapon System Definitions
 * Each weapon has unique behavior, damage, and visual properties
 */

export const WEAPONS = {
    railShot: {
        id: "railShot",
        name: "Rail Shot",
        type: "kinetic",
        description: "High-speed shell with minimal arc",
        baseDamage: 35,
        radius: 25,
        cost: 0,
        behavior: "standard",
        color: '#4ecca3',
        trailColor: '#4ecca3',
        windResistance: 0.5, // Reduced wind effect
        speed: 1.5, // Speed multiplier
        mass: 1.0
    },

    plasmaArc: {
        id: "plasmaArc",
        name: "Plasma Arc",
        type: "energy",
        description: "Glowing plasma that burns terrain",
        baseDamage: 30,
        radius: 35,
        cost: 100,
        behavior: "burn",
        color: '#e74c3c',
        trailColor: '#f39c12',
        windResistance: 1.0,
        speed: 1.0,
        mass: 0.8,
        burnDuration: 3000, // ms
        burnDamage: 5
    },

    clusterSwarm: {
        id: "clusterSwarm",
        name: "Cluster Swarm",
        type: "smart",
        description: "Splits into sub-munitions mid-flight",
        baseDamage: 20,
        radius: 20,
        cost: 150,
        behavior: "cluster",
        color: '#f39c12',
        trailColor: '#f39c12',
        windResistance: 1.2,
        speed: 1.0,
        mass: 1.0,
        clusterCount: 6,
        clusterSpread: 25,
        clusterDelay: 0.8 // Split after 80% of flight
    },

    vectorSeeker: {
        id: "vectorSeeker",
        name: "Vector Seeker",
        type: "smart",
        description: "Smart projectile with slight homing",
        baseDamage: 40,
        radius: 30,
        cost: 200,
        behavior: "homing",
        color: '#9b59b6',
        trailColor: '#9b59b6',
        windResistance: 1.0,
        speed: 1.1,
        mass: 1.0,
        homingStrength: 0.05, // Subtle correction
        homingRange: 150
    },

    orbitalStrike: {
        id: "orbitalStrike",
        name: "Orbital Strike",
        type: "utility",
        description: "Beacon marks target for orbital laser",
        baseDamage: 50,
        radius: 40,
        cost: 250,
        behavior: "orbital",
        color: '#3498db',
        trailColor: '#3498db',
        windResistance: 0.0,
        speed: 2.0,
        mass: 0.5,
        delay: 1500 // Laser delay in ms
    },

    nanoShield: {
        id: "nanoShield",
        name: "Nano Shield",
        type: "defense",
        description: "Temporary damage absorption bubble",
        baseDamage: 0,
        radius: 50,
        cost: 150,
        behavior: "shield",
        color: '#1abc9c',
        trailColor: '#1abc9c',
        windResistance: 1.0,
        speed: 0.8,
        mass: 1.0,
        shieldDuration: 2 // Absorbs 2 hits
    },

    terraformer: {
        id: "terraformer",
        name: "Terraformer",
        type: "utility",
        description: "Adds terrain instead of destroying it",
        baseDamage: 0,
        radius: 40,
        cost: 100,
        behavior: "build",
        color: '#27ae60',
        trailColor: '#27ae60',
        windResistance: 1.0,
        speed: 1.0,
        mass: 1.2
    },

    jumpDrone: {
        id: "jumpDrone",
        name: "Jump Drone",
        type: "mobility",
        description: "Teleports tank to impact point",
        baseDamage: 0,
        radius: 15,
        cost: 175,
        behavior: "teleport",
        color: '#e67e22',
        trailColor: '#e67e22',
        windResistance: 0.8,
        speed: 1.2,
        mass: 0.6
    }
};

/**
 * Get weapon by ID
 */
export function getWeapon(id) {
    return WEAPONS[id] || WEAPONS.railShot;
}

/**
 * Get starting weapons for MVP
 */
export function getStartingWeapons() {
    return [
        WEAPONS.railShot,
        WEAPONS.plasmaArc,
        WEAPONS.clusterSwarm,
        WEAPONS.vectorSeeker
    ];
}
