/**
 * Projectile
 * Basic projectile physics for weapons
 * TODO: Implement advanced behaviors (homing, cluster, etc.)
 */

export class Projectile {
    constructor(x, y, angle, power, weapon, gravity, wind) {
        this.x = x;
        this.y = y;
        this.weapon = weapon;
        this.active = true;

        // Physics
        const velocity = (power / 100) * (weapon.projectile?.velocity || 100);
        this.vx = Math.cos(angle) * velocity;
        this.vy = Math.sin(angle) * velocity;
        this.gravity = gravity;
        this.wind = wind * (weapon.projectile?.windResistance || 1.0);
        this.mass = weapon.projectile?.mass || 1.0;
        this.radius = weapon.projectile?.radius || 0.2;

        // Trail
        this.trailPoints = [];
        this.maxTrailLength = weapon.visual?.trailLength || 20;
    }

    /**
     * Update projectile physics
     */
    update(dt, levelManager, tanks) {
        if (!this.active) return;

        // Update velocity
        this.vx += this.wind * dt * 0.1;
        this.vy += this.gravity * dt;

        // Update position
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Add trail point
        this.trailPoints.push({ x: this.x, y: this.y });
        if (this.trailPoints.length > this.maxTrailLength) {
            this.trailPoints.shift();
        }

        // Check collisions
        this.checkCollisions(levelManager, tanks);
    }

    /**
     * Check collisions with terrain, ceiling, and tanks
     */
    checkCollisions(levelManager, tanks) {
        // Check terrain collision
        if (levelManager.isPointInTerrain(this.x, this.y)) {
            this.onImpact(this.x, this.y, levelManager, tanks);
            return;
        }

        // Check cave ceiling collision
        if (levelManager.isPointInCaveCeiling(this.x, this.y)) {
            this.onImpact(this.x, this.y, levelManager, tanks);
            return;
        }

        // Check tank collisions
        for (const tank of tanks) {
            if (!tank.isAlive) continue;

            const dx = this.x - tank.x;
            const dy = this.y - tank.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < tank.radius + this.radius) {
                this.onImpact(tank.x, tank.y, levelManager, tanks);
                return;
            }
        }

        // Check world boundaries
        const worldDim = levelManager.getWorldDimensions();
        if (this.x < 0 || this.x > worldDim.width || this.y > worldDim.height) {
            this.active = false;
        }
    }

    /**
     * Handle impact
     */
    onImpact(x, y, levelManager, tanks) {
        this.active = false;

        const damage = this.weapon.damage;
        const explosionRadius = damage.explosionRadius || 25;

        // Apply damage to tanks in radius
        for (const tank of tanks) {
            if (!tank.isAlive) continue;

            const dx = x - tank.x;
            const dy = y - tank.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < explosionRadius) {
                const falloff = this.calculateFalloff(dist, explosionRadius, damage.falloffType);
                const actualDamage = damage.direct * falloff;
                tank.takeDamage(actualDamage);

                console.log(`Tank ${tank.id} took ${actualDamage.toFixed(1)} damage (${falloff.toFixed(2)}x falloff)`);
            }
        }

        return {
            x,
            y,
            radius: explosionRadius,
            damage: damage.direct,
            color: this.weapon.visual?.trailColor || '#ff0000'
        };
    }

    /**
     * Calculate damage falloff
     */
    calculateFalloff(distance, radius, falloffType) {
        const ratio = distance / radius;

        switch (falloffType) {
            case 'linear':
                return Math.max(0, 1 - ratio);
            case 'quadratic':
                return Math.max(0, 1 - ratio * ratio);
            case 'constant':
                return 1.0;
            default:
                return Math.max(0, 1 - ratio);
        }
    }

    /**
     * Get trail color
     */
    getTrailColor() {
        return this.weapon.visual?.trailColor || '#4ecca3';
    }
}
