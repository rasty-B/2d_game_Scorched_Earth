/**
 * Physics Engine
 * Handles projectile motion, gravity, wind, and collision detection
 */

export class Projectile {
    constructor(x, y, angle, power, weapon, gravity, wind) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
        this.angle = angle;
        this.power = power;
        this.weapon = weapon;
        this.gravity = gravity;
        this.wind = wind;

        // Calculate initial velocity
        const speed = (power / 100) * 15 * (weapon.speed || 1.0);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.active = true;
        this.age = 0;
        this.trail = [];
        this.maxTrailLength = 20;

        // Weapon-specific properties
        this.hasSplit = false;
        this.childProjectiles = [];
    }

    /**
     * Update projectile position based on physics
     */
    update(dt, terrain, tanks) {
        if (!this.active) return;

        this.age += dt;

        // Store previous position for collision detection
        this.prevX = this.x;
        this.prevY = this.y;

        // Apply gravity
        this.vy += this.gravity * dt * (this.weapon.mass || 1.0);

        // Apply wind (reduced by weapon's wind resistance)
        const windEffect = this.wind * (this.weapon.windResistance || 1.0);
        this.vx += windEffect * dt * 0.1;

        // Apply homing behavior for seeker weapons
        if (this.weapon.behavior === 'homing' && !this.hasSplit) {
            this.applyHoming(tanks);
        }

        // Update position
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Add to trail
        this.trail.push({ x: this.prevX, y: this.prevY });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // Check for cluster split
        if (this.weapon.behavior === 'cluster' && !this.hasSplit) {
            const splitTime = this.weapon.clusterDelay || 0.8;
            if (this.age > splitTime * 2) { // Approximate flight time
                this.splitCluster();
            }
        }

        // Check collision with terrain
        const collision = terrain.findCollision(this.x, this.y, this.prevX, this.prevY);
        if (collision) {
            this.onImpact(collision.x, collision.y, terrain, tanks);
            return;
        }

        // Check collision with tanks
        for (let tank of tanks) {
            if (tank.isAlive && this.checkTankCollision(tank)) {
                this.onImpact(this.x, this.y, terrain, tanks, tank);
                return;
            }
        }

        // Check bounds
        if (this.x < -100 || this.x > terrain.width + 100 || this.y > terrain.height + 100) {
            this.active = false;
        }
    }

    /**
     * Apply homing behavior
     */
    applyHoming(tanks) {
        let closestTank = null;
        let closestDist = Infinity;

        // Find closest enemy tank
        for (let tank of tanks) {
            if (!tank.isAlive) continue;

            const dx = tank.x - this.x;
            const dy = tank.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < closestDist && dist < this.weapon.homingRange) {
                closestDist = dist;
                closestTank = tank;
            }
        }

        if (closestTank) {
            const dx = closestTank.x - this.x;
            const dy = closestTank.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Apply subtle correction
            const strength = this.weapon.homingStrength || 0.05;
            this.vx += (dx / dist) * strength;
            this.vy += (dy / dist) * strength;
        }
    }

    /**
     * Split into cluster munitions
     */
    splitCluster() {
        this.hasSplit = true;
        const count = this.weapon.clusterCount || 5;
        const spread = this.weapon.clusterSpread || 20;

        for (let i = 0; i < count; i++) {
            const spreadAngle = (Math.random() - 0.5) * (spread * Math.PI / 180);
            const childProjectile = {
                x: this.x,
                y: this.y,
                vx: this.vx * 0.7 + Math.cos(spreadAngle) * 3,
                vy: this.vy * 0.7 + Math.sin(spreadAngle) * 3,
                radius: this.weapon.radius * 0.6,
                damage: this.weapon.baseDamage * 0.5
            };
            this.childProjectiles.push(childProjectile);
        }
    }

    /**
     * Check collision with tank
     */
    checkTankCollision(tank) {
        const dx = this.x - tank.x;
        const dy = this.y - tank.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < (tank.radius + 5);
    }

    /**
     * Handle impact
     */
    onImpact(x, y, terrain, tanks, directHitTank = null) {
        this.active = false;

        // Create explosion effect
        const explosion = {
            x,
            y,
            radius: this.weapon.radius,
            damage: this.weapon.baseDamage,
            color: this.weapon.color,
            behavior: this.weapon.behavior
        };

        // Apply effects based on weapon behavior
        switch (this.weapon.behavior) {
            case 'build':
                // Terraformer - add terrain
                terrain.deform(x, y, this.weapon.radius, true);
                break;

            case 'shield':
                // Shield - apply to nearest tank
                // (handled in game logic)
                break;

            case 'teleport':
                // Jump drone - move tank
                // (handled in game logic)
                break;

            default:
                // Standard explosion - deform terrain
                terrain.deform(x, y, this.weapon.radius, false);

                // Damage tanks in radius
                for (let tank of tanks) {
                    if (!tank.isAlive) continue;

                    const dx = tank.x - x;
                    const dy = tank.y - y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < this.weapon.radius) {
                        const falloff = 1 - (dist / this.weapon.radius);
                        const damage = Math.floor(this.weapon.baseDamage * falloff);
                        tank.takeDamage(damage);
                    }
                }
                break;
        }

        return explosion;
    }
}

/**
 * Simulate trajectory for preview
 */
export function simulateTrajectory(x, y, angle, power, weapon, gravity, wind, maxTime = 3.0) {
    const points = [];
    const speed = (power / 100) * 15 * (weapon.speed || 1.0);
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;
    let px = x;
    let py = y;

    const dt = 0.05;
    const steps = Math.floor(maxTime / dt);
    const sampleRate = 3; // Only return every 3rd point for performance

    for (let i = 0; i < steps; i++) {
        vy += gravity * dt * (weapon.mass || 1.0);

        const windEffect = wind * (weapon.windResistance || 1.0);
        vx += windEffect * dt * 0.1;

        px += vx * dt;
        py += vy * dt;

        if (i % sampleRate === 0) {
            points.push({ x: px, y: py });
        }

        // Stop if trajectory goes too far off screen
        if (py > 900 || px < -200 || px > 1480) {
            break;
        }
    }

    return points;
}

/**
 * Calculate wind for current turn
 */
export function generateWind(windRange) {
    const [min, max] = windRange;
    return min + Math.random() * (max - min);
}
