/**
 * Weapon System Definitions
 * Each weapon has unique behavior, damage, and visual properties
 */

export const WEAPONS = {
    railGun: {
        id: "railGun",
        name: "Rail Gun",
        type: "kinetic",
        description: "High-speed direct fire with minimal arc",
        baseDamage: 35,
        radius: 25,
        cost: 0,
        behavior: "standard",
        color: '#4ecca3',
        trailColor: '#4ecca3',
        windResistance: 0.3, // Very low wind effect
        speed: 2.5, // Very high speed
        mass: 0.5 // Light gravity effect
    },

    rpg: {
        id: "rpg",
        name: "RPG",
        type: "explosive",
        description: "Rocket-powered explosive with thrust phase",
        baseDamage: 50,
        radius: 40,
        cost: 0,
        behavior: "powered",
        color: '#e74c3c',
        trailColor: '#f39c12',
        windResistance: 1.0,
        speed: 1.0,
        mass: 1.2,
        thrustDuration: 30, // frames of thrust
        thrustPower: 0.15 // thrust acceleration
    }
};

/**
 * Get weapon by ID
 */
export function getWeapon(id) {
    return WEAPONS[id] || WEAPONS.railGun;
}

/**
 * Get starting weapons
 */
export function getStartingWeapons() {
    return [
        WEAPONS.railGun,
        WEAPONS.rpg
    ];
}
