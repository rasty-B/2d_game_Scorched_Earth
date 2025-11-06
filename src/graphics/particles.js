/**
 * Enhanced Particle System
 * Handles fire, smoke, debris, and other particle effects
 */

import { randomRange } from './gfx_common.js';

/**
 * Spawn explosion particles with fire, smoke, and debris
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} power - Explosion power multiplier (0.5 - 2.0)
 * @returns {Array} Array of particle objects
 */
export function spawnExplosionParticles(x, y, power = 1.0) {
    const particles = [];

    // Fire particles - fast moving, short lived
    const fireCount = Math.round(25 * power);
    for (let i = 0; i < fireCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = randomRange(0.5, 1.5) * power;
        particles.push({
            type: "fire",
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: randomRange(0.5, 0.9),
            maxLife: randomRange(0.5, 0.9),
            size: randomRange(4, 8)
        });
    }

    // Smoke particles - slower, longer lived, drift upward
    const smokeCount = Math.round(18 * power);
    for (let i = 0; i < smokeCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = randomRange(0.2, 0.8) * power;
        particles.push({
            type: "smoke",
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.1, // Drift up
            life: randomRange(0.8, 1.5),
            maxLife: randomRange(0.8, 1.5),
            size: randomRange(6, 14),
            growth: randomRange(0.5, 1.0) // Smoke expands over time
        });
    }

    // Debris particles - chunky, affected by gravity
    const debrisCount = Math.round(10 * power);
    for (let i = 0; i < debrisCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = randomRange(1.2, 2.0) * power;
        particles.push({
            type: "debris",
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: randomRange(1.0, 1.7),
            maxLife: randomRange(1.0, 1.7),
            size: randomRange(3, 6),
            spin: randomRange(-6.0, 6.0),
            angle: Math.random() * Math.PI * 2,
            color: Math.random() > 0.5 ? '#3b3b3b' : '#5a5a5a'
        });
    }

    return particles;
}

/**
 * Spawn impact particles when projectile hits terrain
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} terrainColor - Color of terrain for matching debris
 * @returns {Array} Array of particle objects
 */
export function spawnImpactParticles(x, y, terrainColor = '#6b6b7b') {
    const particles = [];

    // Dust cloud
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = randomRange(0.3, 1.0);
        particles.push({
            type: "smoke",
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.2,
            life: randomRange(0.4, 0.8),
            maxLife: randomRange(0.4, 0.8),
            size: randomRange(4, 8),
            growth: randomRange(0.3, 0.6)
        });
    }

    // Terrain debris
    for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = randomRange(0.8, 1.5);
        particles.push({
            type: "debris",
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.5,
            life: randomRange(0.6, 1.2),
            maxLife: randomRange(0.6, 1.2),
            size: randomRange(2, 4),
            spin: randomRange(-4.0, 4.0),
            angle: Math.random() * Math.PI * 2,
            color: terrainColor
        });
    }

    return particles;
}

/**
 * Spawn trail particles for projectiles
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} color - Trail color
 * @param {string} type - Trail type (smoke, fire, energy)
 * @returns {Array} Array of particle objects
 */
export function spawnTrailParticles(x, y, color = '#4ecca3', type = 'smoke') {
    const particles = [];

    if (type === 'smoke') {
        particles.push({
            type: "smoke",
            x: x + randomRange(-2, 2),
            y: y + randomRange(-2, 2),
            vx: randomRange(-0.1, 0.1),
            vy: randomRange(-0.1, 0.1),
            life: randomRange(0.3, 0.6),
            maxLife: randomRange(0.3, 0.6),
            size: randomRange(3, 6),
            growth: 0.3
        });
    } else if (type === 'fire') {
        particles.push({
            type: "fire",
            x: x + randomRange(-1, 1),
            y: y + randomRange(-1, 1),
            vx: randomRange(-0.2, 0.2),
            vy: randomRange(-0.2, 0.2),
            life: randomRange(0.2, 0.4),
            maxLife: randomRange(0.2, 0.4),
            size: randomRange(3, 5)
        });
    } else if (type === 'energy') {
        particles.push({
            type: "energy",
            x: x + randomRange(-1, 1),
            y: y + randomRange(-1, 1),
            vx: randomRange(-0.1, 0.1),
            vy: randomRange(-0.1, 0.1),
            life: randomRange(0.1, 0.3),
            maxLife: randomRange(0.1, 0.3),
            size: randomRange(2, 4),
            color: color
        });
    }

    return particles;
}

/**
 * Update a particle (movement, aging, physics)
 * @param {Object} particle - Particle object
 * @param {number} dt - Delta time
 * @param {number} gravity - Gravity value
 * @returns {boolean} True if particle is still alive
 */
export function updateParticle(particle, dt = 1.0, gravity = 0.2) {
    // Update position
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;

    // Apply gravity to debris
    if (particle.type === "debris") {
        particle.vy += gravity * dt;
        particle.angle += particle.spin * dt * 0.1;
    }

    // Smoke drifts up and expands
    if (particle.type === "smoke") {
        particle.vy -= 0.05 * dt; // Drift upward
        if (particle.growth) {
            particle.size += particle.growth * dt * 0.1;
        }
    }

    // Fire rises slightly
    if (particle.type === "fire") {
        particle.vy -= 0.02 * dt;
    }

    // Age the particle
    particle.life -= dt * 0.016; // Approximately 60fps

    return particle.life > 0;
}

/**
 * Draw a single particle
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} particle - Particle object
 */
export function drawParticle(ctx, particle) {
    if (particle.life <= 0) return;

    const alpha = Math.max(0, Math.min(1, particle.life / particle.maxLife));

    ctx.save();

    if (particle.type === "fire") {
        // Fire particle with radial gradient
        ctx.globalCompositeOperation = "lighter"; // Additive blending
        const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size
        );
        gradient.addColorStop(0, `rgba(255, 200, 80, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(255, 100, 0, ${alpha * 0.7})`);
        gradient.addColorStop(1, `rgba(255, 80, 0, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }
    else if (particle.type === "smoke") {
        // Smoke particle - soft and fading
        const smokeAlpha = alpha * 0.7;
        ctx.fillStyle = `rgba(50, 50, 50, ${smokeAlpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }
    else if (particle.type === "debris") {
        // Debris particle - rotating rectangle
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.angle);
        ctx.fillStyle = particle.color || '#3b3b3b';
        ctx.globalAlpha = alpha;
        ctx.fillRect(-particle.size * 0.5, -particle.size * 0.5, particle.size, particle.size);
    }
    else if (particle.type === "energy") {
        // Energy particle - glowing orb
        ctx.globalCompositeOperation = "lighter";
        const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(0.5, `${particle.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${particle.color}00`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

/**
 * Particle Manager Class
 * Manages a collection of particles with automatic updating and rendering
 */
export class ParticleManager {
    constructor() {
        this.particles = [];
    }

    /**
     * Add particles to the manager
     * @param {Array} newParticles - Array of particle objects
     */
    addParticles(newParticles) {
        this.particles.push(...newParticles);
    }

    /**
     * Add a single particle
     * @param {Object} particle - Particle object
     */
    addParticle(particle) {
        this.particles.push(particle);
    }

    /**
     * Update all particles
     * @param {number} dt - Delta time
     * @param {number} gravity - Gravity value
     */
    update(dt = 1.0, gravity = 0.2) {
        // Update and filter out dead particles
        this.particles = this.particles.filter(p => updateParticle(p, dt, gravity));
    }

    /**
     * Render all particles
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        for (const particle of this.particles) {
            drawParticle(ctx, particle);
        }
    }

    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
    }

    /**
     * Get particle count
     * @returns {number} Number of active particles
     */
    getCount() {
        return this.particles.length;
    }
}
