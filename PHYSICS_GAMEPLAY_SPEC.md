# Core Physics & Gameplay Rules (Code-Oriented Spec)

**Version:** 1.0
**Target:** Modern 2.5D Artillery Game
**Physics Model:** Deterministic 2D Ballistics with 2.5D Presentation
**Language:** TypeScript/JavaScript (ES6+)

This document provides a **directly implementable structure** for the game's physics and gameplay rules. It is organized into modular components that can be mapped to actual source files.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Module A: Ruleset (Config Layer)](#module-a-ruleset-config-layer)
3. [Module B: Terrain Interface](#module-b-terrain-interface)
4. [Module C: PhysicsWorld](#module-c-physicsworld)
5. [Module D: HoverTank](#module-d-hovertank)
6. [Module E: TurnController](#module-e-turncontroller)
7. [Implementation Notes](#implementation-notes)
8. [Integration Examples](#integration-examples)

---

## Architecture Overview

### Core Principles

1. **Deterministic Physics** - Same inputs produce same outputs (important for replays/networking)
2. **Fixed Timestep** - Physics runs at consistent rate (60 Hz)
3. **Data-Driven Design** - All tunable values in config files, not hard-coded
4. **Render-Agnostic** - Physics layer works in meters/seconds, rendering layer handles pixels/camera
5. **Modular Structure** - Each component has clear responsibilities

### Module Dependencies

```
┌─────────────────┐
│ TurnController  │  ◄── Game Loop Entry Point
└────────┬────────┘
         │
    ┌────▼────┐   ┌──────────┐
    │ HoverTank│◄──┤ Ruleset  │  ◄── Configuration
    └────┬────┘   │ (Config) │
         │        └────┬─────┘
    ┌────▼──────┐      │
    │PhysicsWorld│◄─────┘
    └────┬──────┘
         │
    ┌────▼────┐
    │ Terrain │  ◄── Abstraction
    └─────────┘
```

### File Structure Recommendation

```
src/
├── physics/
│   ├── ruleset_terran.js        // Config: world, weapons, tanks
│   ├── physics_world.js          // Physics simulation engine
│   ├── projectile.js             // Projectile state and behavior
│   ├── terrain_interface.js      // Terrain abstraction
│   └── collision.js              // Collision detection utilities
├── entities/
│   ├── hover_tank.js             // Tank state and behavior
│   └── tank_controller.js        // Input handling for tanks
├── game/
│   ├── turn_controller.js        // Turn-based game flow
│   └── game_state.js             // Overall game state manager
└── utils/
    ├── math.js                   // Vector math, interpolation
    └── constants.js              // Shared constants
```

---

## Module A: Ruleset (Config Layer)

**File:** `src/physics/ruleset_terran.js`

This module defines all tunable gameplay parameters. By changing values here, you can balance the game without touching core engine code.

### A.1 World Configuration

```javascript
/**
 * Global physics world configuration
 */
export const WORLD_CONFIG = {
    // Gravity (meters per second squared)
    gravity: -9.81,  // Earth-like gravity (negative = downward)

    // Physics simulation
    fixedTimestep: 1 / 60,  // 60 Hz physics tick (seconds)
    maxSubSteps: 5,          // Max substeps per frame to catch up

    // Projectile limits
    maxProjectileLifetime: 30.0,  // Seconds before auto-despawn
    maxProjectilesActive: 50,     // Max projectiles in world at once

    // World bounds
    worldWidth: 1280,   // Meters (or map to your terrain width)
    worldHeight: 720,   // Meters (or map to your terrain height)

    // Collision
    terrainCollisionRadius: 2.0,  // Meters to check ahead for terrain hit
};
```

### A.2 Wind Configuration

```javascript
/**
 * Wind system configuration
 */
export const WIND_CONFIG = {
    // Wind as horizontal acceleration (m/s²)
    enabled: true,

    // Base wind (set per turn)
    minBaseWind: -15.0,  // Maximum left wind (m/s²)
    maxBaseWind: 15.0,   // Maximum right wind (m/s²)

    // Wind changes per turn
    windChangeMode: 'perTurn',  // 'perTurn' | 'constant' | 'dynamic'

    // Optional: Small gusts (noise added to base wind)
    gustEnabled: false,
    gustFrequency: 0.5,      // Hz (oscillations per second)
    gustAmplitude: 2.0,      // m/s² (added to base wind)

    // Turn-based wind updates
    windChangeChance: 0.3,    // Probability wind changes per turn
    windMaxDelta: 5.0,        // Max change in wind per turn (m/s²)
};
```

### A.3 Hover Tank Configuration

```javascript
/**
 * Hover Tank physics and movement
 */
export const HOVER_TANK_CONFIG = {
    // Physical properties
    mass: 1500,  // kg (for physics calculations if needed)
    radius: 1.5, // Meters (collision/selection radius)

    // Hover mechanics
    hoverOffsetAboveTerrain: 0.4,  // Meters above terrain surface
    maxSlopeDegrees: 45,           // Max slope tank can traverse

    // Movement per turn
    movementMode: 'stepBased',     // 'stepBased' | 'continuous'
    maxStepsPerTurn: 5,            // Steps tank can move in one turn
    stepDistance: 2.0,             // Meters per step

    // Aiming constraints
    minTurretAngle: 0,       // Degrees (0 = right, 90 = up, 180 = left)
    maxTurretAngle: 180,     // Degrees
    defaultTurretAngle: 45,  // Starting angle

    // Firing power
    minFirePower: 0.3,       // Minimum as fraction of max velocity (30%)
    maxFirePower: 1.0,       // Maximum (100%)
    defaultFirePower: 0.7,   // Starting power (70%)

    // Turret position (for muzzle calculation)
    turretHeight: 1.0,       // Meters above tank center
    barrelLength: 2.0,       // Meters from turret center to muzzle
};
```

### A.4 Weapon Definitions

```javascript
/**
 * Weapon system definitions
 * All weapons follow this typed structure
 */

/**
 * @typedef {Object} WeaponConfig
 * @property {string} id - Unique weapon identifier
 * @property {string} name - Display name
 * @property {string} description - Tooltip description
 * @property {number} cooldown - Turns before can fire again
 * @property {number} maxMuzzleVelocity - Max speed leaving barrel (m/s)
 * @property {ProjectileProfile} projectile - Projectile physical properties
 * @property {DamageProfile} damage - Damage and explosion properties
 * @property {TerrainProfile} terrain - Terrain deformation properties
 * @property {string} behaviour - Behavior type ('ballistic' | 'cluster' | 'homing' | 'areaField')
 * @property {Object} behaviourParams - Behavior-specific parameters
 */

/**
 * @typedef {Object} ProjectileProfile
 * @property {number} mass - Kilograms
 * @property {number} radius - Meters (collision size)
 * @property {number} dragCoefficient - Air resistance (0 = none, 1 = high)
 * @property {number} maxSpeed - Speed cap (m/s)
 */

/**
 * @typedef {Object} DamageProfile
 * @property {number} explosionRadius - Meters (damage falloff radius)
 * @property {number} maxDamage - Damage at epicenter
 * @property {string} falloffType - 'linear' | 'quadratic' | 'constant'
 */

/**
 * @typedef {Object} TerrainProfile
 * @property {string} deformType - 'crater' | 'none' | 'raise' | 'flatten'
 * @property {number} deformStrength - Magnitude of terrain change (meters)
 */

export const WEAPONS = {
    /**
     * Rail Shot - High-speed kinetic projectile
     */
    rail_shot: {
        id: 'rail_shot',
        name: 'Rail Shot',
        description: 'High-velocity kinetic shell with minimal arc',
        cooldown: 0,  // No cooldown (basic weapon)
        maxMuzzleVelocity: 150.0,  // m/s (very fast)

        projectile: {
            mass: 5.0,          // kg
            radius: 0.15,       // meters
            dragCoefficient: 0.1,  // Low drag (aerodynamic)
            maxSpeed: 200.0,    // m/s
        },

        damage: {
            explosionRadius: 15.0,  // meters
            maxDamage: 35.0,
            falloffType: 'linear',
        },

        terrain: {
            deformType: 'crater',
            deformStrength: 8.0,  // meters depth
        },

        behaviour: 'ballistic',
        behaviourParams: {},
    },

    /**
     * Plasma Arc - Energy weapon with lingering field
     */
    plasma_arc: {
        id: 'plasma_arc',
        name: 'Plasma Arc',
        description: 'Burning plasma that damages over time',
        cooldown: 1,
        maxMuzzleVelocity: 80.0,  // m/s (slower)

        projectile: {
            mass: 2.0,
            radius: 0.25,
            dragCoefficient: 0.3,  // Higher drag
            maxSpeed: 100.0,
        },

        damage: {
            explosionRadius: 20.0,
            maxDamage: 30.0,
            falloffType: 'quadratic',
        },

        terrain: {
            deformType: 'crater',
            deformStrength: 5.0,
        },

        behaviour: 'areaField',
        behaviourParams: {
            fieldDuration: 3.0,     // seconds
            fieldRadius: 25.0,      // meters
            damagePerSecond: 5.0,   // DPS to tanks in field
            visualEffect: 'plasma_burn',
        },
    },

    /**
     * Cluster Swarm - Splits into sub-munitions
     */
    cluster_swarm: {
        id: 'cluster_swarm',
        name: 'Cluster Swarm',
        description: 'Splits into multiple sub-munitions mid-flight',
        cooldown: 2,
        maxMuzzleVelocity: 100.0,

        projectile: {
            mass: 8.0,
            radius: 0.3,
            dragCoefficient: 0.4,
            maxSpeed: 120.0,
        },

        damage: {
            explosionRadius: 12.0,  // Parent explosion
            maxDamage: 20.0,
            falloffType: 'linear',
        },

        terrain: {
            deformType: 'crater',
            deformStrength: 4.0,
        },

        behaviour: 'cluster',
        behaviourParams: {
            splitTiming: 0.8,       // Split at 80% of flight time
            clusterCount: 6,        // Number of child projectiles
            spreadAngleDegrees: 30, // Cone angle for spread
            childVelocityFactor: 0.7, // Children have 70% of parent velocity

            // Child projectile properties
            childProjectile: {
                mass: 1.0,
                radius: 0.1,
                dragCoefficient: 0.2,
                maxSpeed: 100.0,
            },
            childDamage: {
                explosionRadius: 8.0,
                maxDamage: 15.0,
                falloffType: 'linear',
            },
            childTerrain: {
                deformType: 'crater',
                deformStrength: 3.0,
            },
        },
    },

    /**
     * Vector Seeker - Homing projectile
     */
    vector_seeker: {
        id: 'vector_seeker',
        name: 'Vector Seeker',
        description: 'Smart munition with target tracking',
        cooldown: 2,
        maxMuzzleVelocity: 90.0,

        projectile: {
            mass: 4.0,
            radius: 0.2,
            dragCoefficient: 0.25,
            maxSpeed: 110.0,
        },

        damage: {
            explosionRadius: 18.0,
            maxDamage: 40.0,
            falloffType: 'linear',
        },

        terrain: {
            deformType: 'crater',
            deformStrength: 6.0,
        },

        behaviour: 'homing',
        behaviourParams: {
            homingStrength: 0.05,    // Acceleration factor (m/s² per meter offset)
            homingRange: 150.0,      // Meters (starts homing within range)
            targetingMode: 'nearest', // 'nearest' | 'strongest' | 'manual'
            homingDelay: 0.5,        // Seconds before homing activates
        },
    },
};

/**
 * Get weapon config by ID
 * @param {string} weaponId
 * @returns {WeaponConfig}
 */
export function getWeapon(weaponId) {
    return WEAPONS[weaponId] || WEAPONS.rail_shot;
}

/**
 * Get all weapon IDs
 * @returns {string[]}
 */
export function getAllWeaponIds() {
    return Object.keys(WEAPONS);
}
```

---

## Module B: Terrain Interface

**File:** `src/physics/terrain_interface.js`

Simple abstraction to decouple physics from terrain implementation.

```javascript
/**
 * Terrain Interface
 * Provides an abstract interface for terrain querying and modification
 */

/**
 * @interface ITerrainProvider
 */
export class ITerrainProvider {
    /**
     * Get terrain height at given X coordinate
     * @param {number} x - X coordinate in meters
     * @returns {number} Y coordinate (height) in meters
     */
    getHeightAt(x) {
        throw new Error('getHeightAt() must be implemented');
    }

    /**
     * Apply explosion deformation to terrain
     * @param {number} x - Explosion center X (meters)
     * @param {number} y - Explosion center Y (meters)
     * @param {number} radius - Explosion radius (meters)
     * @param {number} strength - Deformation strength (meters)
     * @param {string} type - Deformation type ('crater' | 'raise' | 'flatten')
     */
    applyExplosion(x, y, radius, strength, type = 'crater') {
        // Optional: Override if terrain is deformable
    }

    /**
     * Check if terrain is deformable
     * @returns {boolean}
     */
    isDeformable() {
        return false;
    }

    /**
     * Get terrain width
     * @returns {number} Width in meters
     */
    getWidth() {
        throw new Error('getWidth() must be implemented');
    }

    /**
     * Get terrain bounds
     * @returns {{minX: number, maxX: number, minY: number, maxY: number}}
     */
    getBounds() {
        return {
            minX: 0,
            maxX: this.getWidth(),
            minY: 0,
            maxY: 1000,  // Override with actual max height
        };
    }
}

/**
 * Example: Heightfield Terrain Implementation
 */
export class HeightfieldTerrain extends ITerrainProvider {
    constructor(heightData, width) {
        super();
        this.heightData = heightData;  // Array of heights
        this.width = width;
    }

    getHeightAt(x) {
        // Clamp x to bounds
        const index = Math.floor(Math.max(0, Math.min(x, this.width - 1)));
        return this.heightData[index];
    }

    applyExplosion(x, y, radius, strength, type = 'crater') {
        const startX = Math.max(0, Math.floor(x - radius));
        const endX = Math.min(this.width, Math.ceil(x + radius));

        for (let i = startX; i < endX; i++) {
            const dx = i - x;
            const distance = Math.abs(dx);

            if (distance < radius) {
                const falloff = 1.0 - (distance / radius);

                if (type === 'crater') {
                    this.heightData[i] += strength * falloff;
                } else if (type === 'raise') {
                    this.heightData[i] -= strength * falloff;
                }
            }
        }
    }

    isDeformable() {
        return true;
    }

    getWidth() {
        return this.width;
    }
}
```

---

## Module C: PhysicsWorld

**File:** `src/physics/physics_world.js`

Deterministic 2D ballistic simulation engine.

```javascript
import { WORLD_CONFIG, WIND_CONFIG, getWeapon } from './ruleset_terran.js';

/**
 * Projectile State
 */
export class ProjectileState {
    constructor(weapon, position, velocity) {
        this.id = crypto.randomUUID();
        this.weapon = weapon;
        this.position = { ...position };  // {x, y}
        this.velocity = { ...velocity };  // {x, y}
        this.mass = weapon.projectile.mass;
        this.radius = weapon.projectile.radius;
        this.dragCoeff = weapon.projectile.dragCoefficient;
        this.maxSpeed = weapon.projectile.maxSpeed;
        this.age = 0.0;  // seconds
        this.active = true;

        // Behavior state
        this.behaviour = weapon.behaviour;
        this.behaviourState = {};  // Behavior-specific data

        // Trail for rendering
        this.trail = [];
    }
}

/**
 * Physics World - Deterministic 2D Ballistics
 */
export class PhysicsWorld {
    constructor(terrain) {
        this.terrain = terrain;
        this.projectiles = [];
        this.accumulator = 0.0;  // For fixed timestep

        // Wind state
        this.windAccelerationX = 0.0;
        this.windGustPhase = 0.0;

        // Callbacks
        this.onExplosionCallback = null;
        this.onProjectileDespawnCallback = null;

        // Initialize wind
        this.randomizeWind();
    }

    /**
     * Set explosion callback
     * @param {Function} callback - (position, weapon, velocity) => void
     */
    onExplosion(callback) {
        this.onExplosionCallback = callback;
    }

    /**
     * Set projectile despawn callback
     * @param {Function} callback - (projectile) => void
     */
    onProjectileDespawn(callback) {
        this.onProjectileDespawnCallback = callback;
    }

    /**
     * Spawn a projectile
     * @param {string} weaponId
     * @param {{x: number, y: number}} position - Muzzle position
     * @param {number} angleDegrees - Firing angle (0 = right, 90 = up)
     * @param {number} firePower - Power factor (0-1)
     * @returns {ProjectileState}
     */
    spawnProjectile(weaponId, position, angleDegrees, firePower) {
        const weapon = getWeapon(weaponId);
        const angleRad = (angleDegrees * Math.PI) / 180;
        const speed = weapon.maxMuzzleVelocity * firePower;

        const velocity = {
            x: Math.cos(angleRad) * speed,
            y: Math.sin(angleRad) * speed,
        };

        const projectile = new ProjectileState(weapon, position, velocity);
        this.projectiles.push(projectile);

        return projectile;
    }

    /**
     * Update physics (call every frame)
     * @param {number} deltaTime - Time since last frame (seconds)
     */
    update(deltaTime) {
        // Fixed timestep accumulation
        this.accumulator += deltaTime;

        const fixedDt = WORLD_CONFIG.fixedTimestep;
        let steps = 0;

        while (this.accumulator >= fixedDt && steps < WORLD_CONFIG.maxSubSteps) {
            this.fixedUpdate(fixedDt);
            this.accumulator -= fixedDt;
            steps++;
        }

        // Update wind gusts
        if (WIND_CONFIG.gustEnabled) {
            this.windGustPhase += deltaTime * WIND_CONFIG.gustFrequency * Math.PI * 2;
            const gust = Math.sin(this.windGustPhase) * WIND_CONFIG.gustAmplitude;
            // Applied in fixedUpdate
        }
    }

    /**
     * Fixed timestep physics update
     * @param {number} dt - Fixed delta time
     */
    fixedUpdate(dt) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];

            if (!p.active) continue;

            // Age projectile
            p.age += dt;
            if (p.age > WORLD_CONFIG.maxProjectileLifetime) {
                this.despawnProjectile(i);
                continue;
            }

            // Apply forces
            const forces = this.calculateForces(p);

            // Integrate velocity (Euler integration)
            p.velocity.x += forces.x * dt;
            p.velocity.y += forces.y * dt;

            // Clamp speed
            const speed = Math.sqrt(p.velocity.x ** 2 + p.velocity.y ** 2);
            if (speed > p.maxSpeed) {
                const scale = p.maxSpeed / speed;
                p.velocity.x *= scale;
                p.velocity.y *= scale;
            }

            // Integrate position
            p.position.x += p.velocity.x * dt;
            p.position.y += p.velocity.y * dt;

            // Update trail
            p.trail.push({ x: p.position.x, y: p.position.y });
            if (p.trail.length > 50) p.trail.shift();

            // Check collision with terrain
            if (this.checkTerrainCollision(p)) {
                this.handleExplosion(p);
                this.despawnProjectile(i);
                continue;
            }

            // Check world bounds
            if (this.isOutOfBounds(p)) {
                this.despawnProjectile(i);
                continue;
            }

            // Update behavior
            this.updateBehaviour(p, dt);
        }
    }

    /**
     * Calculate forces on projectile
     * @param {ProjectileState} projectile
     * @returns {{x: number, y: number}} Acceleration (m/s²)
     */
    calculateForces(projectile) {
        const forces = { x: 0, y: 0 };

        // Gravity
        forces.y += WORLD_CONFIG.gravity;

        // Wind (horizontal acceleration)
        if (WIND_CONFIG.enabled) {
            let windAccel = this.windAccelerationX;
            if (WIND_CONFIG.gustEnabled) {
                windAccel += Math.sin(this.windGustPhase) * WIND_CONFIG.gustAmplitude;
            }
            forces.x += windAccel;
        }

        // Drag (linear air resistance)
        const speed = Math.sqrt(projectile.velocity.x ** 2 + projectile.velocity.y ** 2);
        if (speed > 0) {
            const dragMagnitude = projectile.dragCoeff * speed;
            forces.x -= (projectile.velocity.x / speed) * dragMagnitude;
            forces.y -= (projectile.velocity.y / speed) * dragMagnitude;
        }

        return forces;
    }

    /**
     * Check terrain collision
     * @param {ProjectileState} projectile
     * @returns {boolean} True if collision occurred
     */
    checkTerrainCollision(projectile) {
        const terrainHeight = this.terrain.getHeightAt(projectile.position.x);
        return projectile.position.y >= terrainHeight;
    }

    /**
     * Check if projectile is out of bounds
     * @param {ProjectileState} projectile
     * @returns {boolean}
     */
    isOutOfBounds(projectile) {
        const bounds = this.terrain.getBounds();
        return (
            projectile.position.x < bounds.minX ||
            projectile.position.x > bounds.maxX ||
            projectile.position.y < bounds.minY ||
            projectile.position.y > bounds.maxY
        );
    }

    /**
     * Handle explosion
     * @param {ProjectileState} projectile
     */
    handleExplosion(projectile) {
        const weapon = projectile.weapon;

        // Apply terrain deformation
        if (this.terrain.isDeformable()) {
            this.terrain.applyExplosion(
                projectile.position.x,
                projectile.position.y,
                weapon.damage.explosionRadius,
                weapon.terrain.deformStrength,
                weapon.terrain.deformType
            );
        }

        // Trigger explosion callback
        if (this.onExplosionCallback) {
            this.onExplosionCallback(
                projectile.position,
                weapon,
                projectile.velocity
            );
        }
    }

    /**
     * Despawn projectile
     * @param {number} index
     */
    despawnProjectile(index) {
        const projectile = this.projectiles[index];

        if (this.onProjectileDespawnCallback) {
            this.onProjectileDespawnCallback(projectile);
        }

        this.projectiles.splice(index, 1);
    }

    /**
     * Update behavior-specific logic
     * @param {ProjectileState} projectile
     * @param {number} dt
     */
    updateBehaviour(projectile, dt) {
        switch (projectile.behaviour) {
            case 'cluster':
                this.updateClusterBehaviour(projectile, dt);
                break;
            case 'homing':
                this.updateHomingBehaviour(projectile, dt);
                break;
            case 'areaField':
                // Handled on explosion
                break;
            default:
                // Ballistic - no special behavior
                break;
        }
    }

    /**
     * Cluster behavior: Split into sub-munitions
     * @param {ProjectileState} projectile
     * @param {number} dt
     */
    updateClusterBehaviour(projectile, dt) {
        if (projectile.behaviourState.hasSplit) return;

        const maxLifetime = WORLD_CONFIG.maxProjectileLifetime;
        const splitTiming = projectile.weapon.behaviourParams.splitTiming;

        if (projectile.age / maxLifetime >= splitTiming) {
            projectile.behaviourState.hasSplit = true;

            const params = projectile.weapon.behaviourParams;
            const count = params.clusterCount;
            const spreadRad = (params.spreadAngleDegrees * Math.PI) / 180;

            // Calculate parent velocity angle
            const parentAngle = Math.atan2(projectile.velocity.y, projectile.velocity.x);
            const parentSpeed = Math.sqrt(
                projectile.velocity.x ** 2 + projectile.velocity.y ** 2
            );
            const childSpeed = parentSpeed * params.childVelocityFactor;

            // Spawn child projectiles
            for (let i = 0; i < count; i++) {
                const offsetAngle = ((i / count) - 0.5) * spreadRad;
                const angle = parentAngle + offsetAngle;

                const childVelocity = {
                    x: Math.cos(angle) * childSpeed,
                    y: Math.sin(angle) * childSpeed,
                };

                // Create child projectile (simplified)
                const childWeapon = {
                    ...projectile.weapon,
                    projectile: params.childProjectile,
                    damage: params.childDamage,
                    terrain: params.childTerrain,
                    behaviour: 'ballistic',
                };

                const child = new ProjectileState(
                    childWeapon,
                    { ...projectile.position },
                    childVelocity
                );

                this.projectiles.push(child);
            }

            // Parent projectile despawns after split
            projectile.active = false;
        }
    }

    /**
     * Homing behavior: Steer toward target
     * @param {ProjectileState} projectile
     * @param {number} dt
     */
    updateHomingBehaviour(projectile, dt) {
        const params = projectile.weapon.behaviourParams;

        if (projectile.age < params.homingDelay) return;

        // Find nearest target (simplified - should be provided by game logic)
        const target = this.findNearestTarget(projectile.position);
        if (!target) return;

        const dx = target.x - projectile.position.x;
        const dy = target.y - projectile.position.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);

        if (distance < params.homingRange && distance > 0) {
            // Calculate homing acceleration
            const homingAccel = params.homingStrength * distance;
            projectile.velocity.x += (dx / distance) * homingAccel * dt;
            projectile.velocity.y += (dy / distance) * homingAccel * dt;
        }
    }

    /**
     * Find nearest target (stub - should be implemented by game)
     * @param {{x: number, y: number}} position
     * @returns {{x: number, y: number} | null}
     */
    findNearestTarget(position) {
        // TODO: Implement target finding logic
        // Should query active tanks from game state
        return null;
    }

    /**
     * Randomize wind for new turn
     */
    randomizeWind() {
        if (WIND_CONFIG.windChangeMode === 'perTurn') {
            this.windAccelerationX =
                Math.random() * (WIND_CONFIG.maxBaseWind - WIND_CONFIG.minBaseWind) +
                WIND_CONFIG.minBaseWind;
        }
    }

    /**
     * Change wind for new turn
     */
    onNewTurn(turnIndex) {
        if (WIND_CONFIG.windChangeMode === 'perTurn') {
            if (Math.random() < WIND_CONFIG.windChangeChance) {
                const delta = (Math.random() - 0.5) * 2 * WIND_CONFIG.windMaxDelta;
                this.windAccelerationX += delta;
                this.windAccelerationX = Math.max(
                    WIND_CONFIG.minBaseWind,
                    Math.min(WIND_CONFIG.maxBaseWind, this.windAccelerationX)
                );
            }
        }
    }

    /**
     * Get current wind for HUD display
     * @returns {{x: number, strength: number, direction: string}}
     */
    getWindInfo() {
        const x = this.windAccelerationX;
        const strength = Math.abs(x);
        const direction = x > 0 ? 'right' : x < 0 ? 'left' : 'none';

        return { x, strength, direction };
    }

    /**
     * Get all active projectiles
     * @returns {ProjectileState[]}
     */
    getActiveProjectiles() {
        return this.projectiles.filter(p => p.active);
    }

    /**
     * Clear all projectiles
     */
    clearAllProjectiles() {
        this.projectiles = [];
    }
}
```

---

## Module D: HoverTank

**File:** `src/entities/hover_tank.js`

Encapsulates tank state and behavior.

```javascript
import { HOVER_TANK_CONFIG, getWeapon, getAllWeaponIds } from '../physics/ruleset_terran.js';

/**
 * Hover Tank Entity
 */
export class HoverTank {
    constructor(id, position, terrain) {
        this.id = id;
        this.terrain = terrain;

        // Position
        this.x = position.x;
        this.y = this.getAnchoredY(this.x);

        // State
        this.isAlive = true;
        this.hp = 100;
        this.maxHp = 100;

        // Aiming
        this.turretAngleDeg = HOVER_TANK_CONFIG.defaultTurretAngle;
        this.firePower = HOVER_TANK_CONFIG.defaultFirePower;

        // Movement
        this.stepsMovedThisTurn = 0;

        // Weapons
        this.selectedWeaponId = 'rail_shot';
        this.availableWeapons = getAllWeaponIds();
        this.weaponCooldowns = {};  // {weaponId: turnsRemaining}
    }

    /**
     * Get Y position anchored to terrain
     * @param {number} x
     * @returns {number}
     */
    getAnchoredY(x) {
        const terrainHeight = this.terrain.getHeightAt(x);
        return terrainHeight - HOVER_TANK_CONFIG.hoverOffsetAboveTerrain;
    }

    /**
     * Update tank position to stay anchored to terrain
     */
    updatePosition() {
        this.y = this.getAnchoredY(this.x);
    }

    /**
     * Try to move one step in direction
     * @param {string} direction - 'left' | 'right'
     * @returns {boolean} True if move successful
     */
    tryStep(direction) {
        if (this.stepsMovedThisTurn >= HOVER_TANK_CONFIG.maxStepsPerTurn) {
            return false;
        }

        const step = HOVER_TANK_CONFIG.stepDistance;
        const newX = direction === 'left' ? this.x - step : this.x + step;

        // Check bounds
        if (newX < 0 || newX >= this.terrain.getWidth()) {
            return false;
        }

        // Check slope
        const currentY = this.terrain.getHeightAt(this.x);
        const newY = this.terrain.getHeightAt(newX);
        const deltaY = Math.abs(newY - currentY);
        const slopeAngle = Math.atan2(deltaY, step) * (180 / Math.PI);

        if (slopeAngle > HOVER_TANK_CONFIG.maxSlopeDegrees) {
            return false;  // Too steep
        }

        // Move successful
        this.x = newX;
        this.updatePosition();
        this.stepsMovedThisTurn++;
        return true;
    }

    /**
     * Reset movement for new turn
     */
    resetMovement() {
        this.stepsMovedThisTurn = 0;
    }

    /**
     * Adjust turret angle
     * @param {number} deltaDegrees - Change in angle
     */
    adjustAngle(deltaDegrees) {
        this.turretAngleDeg += deltaDegrees;
        this.turretAngleDeg = Math.max(
            HOVER_TANK_CONFIG.minTurretAngle,
            Math.min(HOVER_TANK_CONFIG.maxTurretAngle, this.turretAngleDeg)
        );
    }

    /**
     * Set turret angle directly
     * @param {number} angleDegrees
     */
    setAngle(angleDegrees) {
        this.turretAngleDeg = Math.max(
            HOVER_TANK_CONFIG.minTurretAngle,
            Math.min(HOVER_TANK_CONFIG.maxTurretAngle, angleDegrees)
        );
    }

    /**
     * Adjust fire power
     * @param {number} delta - Change in power (-1 to 1)
     */
    adjustPower(delta) {
        this.firePower += delta;
        this.firePower = Math.max(
            HOVER_TANK_CONFIG.minFirePower,
            Math.min(HOVER_TANK_CONFIG.maxFirePower, this.firePower)
        );
    }

    /**
     * Set fire power directly
     * @param {number} power - Power (0-1)
     */
    setPower(power) {
        this.firePower = Math.max(
            HOVER_TANK_CONFIG.minFirePower,
            Math.min(HOVER_TANK_CONFIG.maxFirePower, power)
        );
    }

    /**
     * Select weapon
     * @param {string} weaponId
     * @returns {boolean} True if weapon changed
     */
    selectWeapon(weaponId) {
        if (!this.availableWeapons.includes(weaponId)) {
            return false;
        }

        // Check cooldown
        if (this.weaponCooldowns[weaponId] > 0) {
            return false;
        }

        this.selectedWeaponId = weaponId;
        return true;
    }

    /**
     * Get muzzle position (where projectile spawns)
     * @returns {{x: number, y: number}}
     */
    getMuzzlePosition() {
        const angleRad = (this.turretAngleDeg * Math.PI) / 180;
        const barrelLength = HOVER_TANK_CONFIG.barrelLength;

        return {
            x: this.x + Math.cos(angleRad) * barrelLength,
            y: this.y - HOVER_TANK_CONFIG.turretHeight + Math.sin(angleRad) * barrelLength,
        };
    }

    /**
     * Fire weapon (spawns projectile in PhysicsWorld)
     * @param {PhysicsWorld} physicsWorld
     * @returns {ProjectileState | null}
     */
    fire(physicsWorld) {
        const weapon = getWeapon(this.selectedWeaponId);

        // Check cooldown
        if (this.weaponCooldowns[this.selectedWeaponId] > 0) {
            return null;
        }

        // Spawn projectile
        const muzzlePos = this.getMuzzlePosition();
        const projectile = physicsWorld.spawnProjectile(
            this.selectedWeaponId,
            muzzlePos,
            this.turretAngleDeg,
            this.firePower
        );

        // Set cooldown
        this.weaponCooldowns[this.selectedWeaponId] = weapon.cooldown;

        return projectile;
    }

    /**
     * Take damage
     * @param {number} damage
     */
    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
            this.isAlive = false;
        }
    }

    /**
     * Tick cooldowns for new turn
     */
    tickCooldowns() {
        for (const weaponId in this.weaponCooldowns) {
            if (this.weaponCooldowns[weaponId] > 0) {
                this.weaponCooldowns[weaponId]--;
            }
        }
    }

    /**
     * Get tank state for UI
     * @returns {Object}
     */
    getState() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            hp: this.hp,
            maxHp: this.maxHp,
            isAlive: this.isAlive,
            turretAngleDeg: this.turretAngleDeg,
            firePower: this.firePower,
            selectedWeaponId: this.selectedWeaponId,
            stepsRemaining: HOVER_TANK_CONFIG.maxStepsPerTurn - this.stepsMovedThisTurn,
        };
    }
}
```

---

## Module E: TurnController

**File:** `src/game/turn_controller.js`

Turn-based game flow scaffolding.

```javascript
import { HoverTank } from '../entities/hover_tank.js';
import { PhysicsWorld } from '../physics/physics_world.js';

/**
 * Turn Controller - Manages turn-based game flow
 */
export class TurnController {
    constructor(terrain, tanks) {
        this.terrain = terrain;
        this.tanks = tanks;  // Array of HoverTank instances
        this.activeTankIndex = 0;
        this.turnIndex = 0;
        this.gamePhase = 'movement';  // 'movement' | 'aiming' | 'projectile'

        // Physics
        this.physicsWorld = new PhysicsWorld(terrain);
        this.physicsWorld.onExplosion((position, weapon, velocity) => {
            this.handleExplosion(position, weapon, velocity);
        });
    }

    /**
     * Get active tank
     * @returns {HoverTank}
     */
    getActiveTank() {
        return this.tanks[this.activeTankIndex];
    }

    /**
     * Start new turn
     */
    startNewTurn() {
        this.turnIndex++;
        this.gamePhase = 'movement';

        // Reset active tank
        const tank = this.getActiveTank();
        tank.resetMovement();
        tank.tickCooldowns();

        // Update wind
        this.physicsWorld.onNewTurn(this.turnIndex);
    }

    /**
     * Handle movement input
     * @param {string} direction - 'left' | 'right'
     */
    handleMoveLeft() {
        if (this.gamePhase !== 'movement') return;
        this.getActiveTank().tryStep('left');
    }

    handleMoveRight() {
        if (this.gamePhase !== 'movement') return;
        this.getActiveTank().tryStep('right');
    }

    /**
     * Handle aiming input
     */
    handleAimLeft() {
        this.getActiveTank().adjustAngle(-5);  // 5 degree steps
    }

    handleAimRight() {
        this.getActiveTank().adjustAngle(5);
    }

    handleAimFineLeft() {
        this.getActiveTank().adjustAngle(-1);  // 1 degree fine control
    }

    handleAimFineRight() {
        this.getActiveTank().adjustAngle(1);
    }

    /**
     * Handle power input
     */
    handlePowerUp() {
        this.getActiveTank().adjustPower(0.1);  // 10% steps
    }

    handlePowerDown() {
        this.getActiveTank().adjustPower(-0.1);
    }

    /**
     * Handle weapon selection
     * @param {string} weaponId
     */
    handleWeaponSelect(weaponId) {
        this.getActiveTank().selectWeapon(weaponId);
    }

    /**
     * Handle fire action
     */
    handleFire() {
        if (this.gamePhase === 'projectile') return;  // Already firing

        const tank = this.getActiveTank();
        const projectile = tank.fire(this.physicsWorld);

        if (projectile) {
            this.gamePhase = 'projectile';
        }
    }

    /**
     * Update game (call every frame)
     * @param {number} deltaTime
     */
    update(deltaTime) {
        // Update physics
        this.physicsWorld.update(deltaTime);

        // Update all tanks (anchor to terrain)
        for (const tank of this.tanks) {
            tank.updatePosition();
        }

        // Check if projectile phase is complete
        if (this.gamePhase === 'projectile') {
            if (this.physicsWorld.getActiveProjectiles().length === 0) {
                this.endProjectilePhase();
            }
        }
    }

    /**
     * End projectile phase and advance turn
     */
    endProjectilePhase() {
        this.gamePhase = 'movement';

        // Remove dead tanks
        this.tanks = this.tanks.filter(t => t.isAlive);

        // Check win condition
        if (this.tanks.length <= 1) {
            this.endGame();
            return;
        }

        // Advance to next tank
        this.activeTankIndex = (this.activeTankIndex + 1) % this.tanks.length;
        this.startNewTurn();
    }

    /**
     * Handle explosion (apply damage to tanks)
     * @param {{x: number, y: number}} position
     * @param {Object} weapon
     * @param {{x: number, y: number}} velocity
     */
    handleExplosion(position, weapon, velocity) {
        const damage = weapon.damage;

        for (const tank of this.tanks) {
            if (!tank.isAlive) continue;

            const dx = tank.x - position.x;
            const dy = tank.y - position.y;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);

            if (distance < damage.explosionRadius) {
                // Calculate damage based on falloff
                let damageAmount = damage.maxDamage;

                if (damage.falloffType === 'linear') {
                    damageAmount *= 1.0 - (distance / damage.explosionRadius);
                } else if (damage.falloffType === 'quadratic') {
                    const ratio = distance / damage.explosionRadius;
                    damageAmount *= 1.0 - (ratio * ratio);
                }

                tank.takeDamage(damageAmount);
            }
        }
    }

    /**
     * End game
     */
    endGame() {
        const winner = this.tanks[0];
        console.log(`Game Over! Winner: Tank ${winner.id}`);
        // Trigger game over UI
    }

    /**
     * Get game state for UI/rendering
     * @returns {Object}
     */
    getState() {
        return {
            turnIndex: this.turnIndex,
            gamePhase: this.gamePhase,
            activeTankIndex: this.activeTankIndex,
            tanks: this.tanks.map(t => t.getState()),
            wind: this.physicsWorld.getWindInfo(),
            projectiles: this.physicsWorld.getActiveProjectiles(),
        };
    }
}
```

---

## Implementation Notes

### 1. Determinism

All physics calculations use:
- Fixed timestep (1/60 second)
- Accumulator to handle variable frame rates
- No Math.random() in physics (use seeded RNG if needed for networking)

### 2. Units

Physics layer uses **meters** and **seconds**:
- Rendering layer converts to pixels and camera space
- 1 meter can map to any pixel size (e.g., 10 pixels/meter)

### 3. Performance

- Projectile count limited by `WORLD_CONFIG.maxProjectilesActive`
- Terrain collision is simple heightfield query (O(1))
- Fixed timestep prevents spiral of death

### 4. Extensibility

Add new weapons by:
1. Adding weapon config to `WEAPONS` in `ruleset_terran.js`
2. Optionally implementing new behavior in `PhysicsWorld.updateBehaviour()`

### 5. Networking Considerations

For future multiplayer:
- All physics is deterministic (same inputs → same outputs)
- Send only player inputs over network (angle, power, weapon, frame number)
- Both clients simulate identically
- Use server as authority for conflict resolution

---

## Integration Examples

### Example 1: Initialize Game

```javascript
import { HeightfieldTerrain } from './physics/terrain_interface.js';
import { HoverTank } from './entities/hover_tank.js';
import { TurnController } from './game/turn_controller.js';

// Create terrain
const heightData = generateTerrainHeightfield(1280);
const terrain = new HeightfieldTerrain(heightData, 1280);

// Create tanks
const tanks = [
    new HoverTank('p1', { x: 200, y: 0 }, terrain),
    new HoverTank('p2', { x: 1000, y: 0 }, terrain),
];

// Create game controller
const gameController = new TurnController(terrain, tanks);

// Start game
gameController.startNewTurn();
```

### Example 2: Game Loop

```javascript
let lastTime = performance.now();

function gameLoop() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;  // Convert to seconds
    lastTime = currentTime;

    // Update game
    gameController.update(deltaTime);

    // Render
    const state = gameController.getState();
    renderer.render(state);

    requestAnimationFrame(gameLoop);
}

gameLoop();
```

### Example 3: Input Handling

```javascript
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            gameController.handleMoveLeft();
            break;
        case 'ArrowRight':
            gameController.handleMoveRight();
            break;
        case 'ArrowUp':
            gameController.handleAimRight();
            break;
        case 'ArrowDown':
            gameController.handleAimLeft();
            break;
        case 'w':
            gameController.handlePowerUp();
            break;
        case 's':
            gameController.handlePowerDown();
            break;
        case ' ':
            gameController.handleFire();
            break;
        case '1':
        case '2':
        case '3':
        case '4':
            const weaponIds = ['rail_shot', 'plasma_arc', 'cluster_swarm', 'vector_seeker'];
            gameController.handleWeaponSelect(weaponIds[parseInt(event.key) - 1]);
            break;
    }
});
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-06 | Initial physics and gameplay specification |

---

**End of Specification**

This document provides a complete, implementable structure for the game's physics and gameplay systems. All modules can be coded directly from these specifications while maintaining flexibility for future enhancements.
