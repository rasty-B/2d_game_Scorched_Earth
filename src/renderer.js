/**
 * Renderer - Handles all Canvas drawing operations
 */

import { getCachedTerrainPattern } from './graphics/terrain_patterns.js';
import { drawEnhancedTank, drawMuzzleFlash } from './graphics/tank_graphics.js';
import { ParticleManager, spawnExplosionParticles, spawnImpactParticles } from './graphics/particles.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.particles = [];
        this.particleManager = new ParticleManager();
        this.currentStage = null;
        this.muzzleFlashes = []; // Track muzzle flash effects
    }

    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Draw background/sky
     */
    drawSky(stage) {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, stage.colors.sky[0]);
        gradient.addColorStop(1, stage.colors.sky[1]);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw stars if applicable
        if (stage.colors.stars) {
            this.drawStars();
        }
    }

    /**
     * Draw stars
     */
    drawStars() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height * 0.6;
            const size = Math.random() * 2;

            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    /**
     * Draw terrain with enhanced textures
     */
    drawTerrain(terrain, stage) {
        this.currentStage = stage;

        // Get terrain pattern for this stage
        const pattern = getCachedTerrainPattern(stage.name || 'lunaCrater');

        // Draw terrain fill with texture
        this.ctx.fillStyle = pattern;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height);

        for (let x = 0; x < terrain.width; x++) {
            const y = terrain.getHeightAt(x);
            this.ctx.lineTo(x, y);
        }

        this.ctx.lineTo(terrain.width, this.height);
        this.ctx.closePath();
        this.ctx.fill();

        // Draw terrain outline/shadow
        this.ctx.strokeStyle = stage.colors.terrainDark;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();

        for (let x = 0; x < terrain.width; x++) {
            const y = terrain.getHeightAt(x);
            if (x === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();

        // Add subtle shading to terrain peaks and valleys
        this.addTerrainShading(terrain);
    }

    /**
     * Add shading to terrain for depth
     */
    addTerrainShading(terrain) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.2;

        for (let x = 1; x < terrain.width - 1; x += 2) {
            const yPrev = terrain.getHeightAt(x - 1);
            const y = terrain.getHeightAt(x);
            const yNext = terrain.getHeightAt(x + 1);

            // Calculate slope
            const leftSlope = y - yPrev;
            const rightSlope = yNext - y;
            const avgSlope = (leftSlope + rightSlope) / 2;

            // Add highlights to peaks, shadows to valleys
            if (avgSlope < -2) {
                // Peak - add highlight
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.fillRect(x, y, 2, 5);
            } else if (avgSlope > 2) {
                // Valley - add shadow
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                this.ctx.fillRect(x, y, 2, 5);
            }
        }

        this.ctx.restore();
    }

    /**
     * Draw a tank using enhanced graphics
     */
    drawTank(tank, isActive = false) {
        if (!tank.isAlive) return;
        drawEnhancedTank(this.ctx, tank, isActive);
    }

    /**
     * Add muzzle flash effect when tank fires
     */
    addMuzzleFlash(x, y, angle, size = 20) {
        this.muzzleFlashes.push({
            x,
            y,
            angle,
            size,
            alpha: 1.0,
            life: 0.2 // Duration in seconds
        });
    }

    /**
     * Update and draw muzzle flashes
     */
    updateMuzzleFlashes(dt = 1.0) {
        for (let i = this.muzzleFlashes.length - 1; i >= 0; i--) {
            const flash = this.muzzleFlashes[i];
            flash.life -= dt * 0.016;
            flash.alpha = Math.max(0, flash.life / 0.2);

            if (flash.life <= 0) {
                this.muzzleFlashes.splice(i, 1);
            } else {
                drawMuzzleFlash(this.ctx, flash.x, flash.y, flash.angle, flash.size, flash.alpha);
            }
        }
    }

    /**
     * Draw projectile
     */
    drawProjectile(projectile) {
        if (!projectile.active) return;

        const { x, y, weapon, trail } = projectile;

        // Draw trail
        if (trail.length > 1) {
            this.ctx.strokeStyle = weapon.trailColor;
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = 0.5;

            this.ctx.beginPath();
            this.ctx.moveTo(trail[0].x, trail[0].y);

            for (let i = 1; i < trail.length; i++) {
                this.ctx.lineTo(trail[i].x, trail[i].y);
            }

            this.ctx.stroke();
            this.ctx.globalAlpha = 1.0;
        }

        // Draw projectile
        this.ctx.fillStyle = weapon.color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 4, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw glow effect
        this.ctx.shadowColor = weapon.color;
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = weapon.color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    /**
     * Draw trajectory preview
     */
    drawTrajectory(points, color = '#4ecca3') {
        if (points.length < 2) return;

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.globalAlpha = 0.7;

        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }

        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.globalAlpha = 1.0;
    }

    /**
     * Draw aim line from tank
     */
    drawAimLine(tank, angle, power) {
        const length = (power / 100) * 60 + 30;
        const endX = tank.x + Math.cos(angle) * length;
        const endY = tank.y + Math.sin(angle) * length;

        // Draw line
        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(tank.x, tank.y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();

        // Draw arrow head
        const arrowSize = 10;
        const arrowAngle = Math.PI / 6;

        this.ctx.fillStyle = '#ffd700';
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
            endX - arrowSize * Math.cos(angle - arrowAngle),
            endY - arrowSize * Math.sin(angle - arrowAngle)
        );
        this.ctx.lineTo(
            endX - arrowSize * Math.cos(angle + arrowAngle),
            endY - arrowSize * Math.sin(angle + arrowAngle)
        );
        this.ctx.closePath();
        this.ctx.fill();
    }

    /**
     * Draw explosion effect with enhanced graphics
     */
    drawExplosion(explosion) {
        const { x, y, radius, color, age, maxAge } = explosion;
        const progress = age / maxAge;
        const currentRadius = radius * (1 + progress * 0.5);
        const alpha = 1 - progress;

        this.ctx.save();

        // Outer shockwave ring
        this.ctx.globalAlpha = alpha * 0.3;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(x, y, currentRadius * 1.2, 0, Math.PI * 2);
        this.ctx.stroke();

        // Outer glow
        this.ctx.globalAlpha = alpha * 0.5;
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, currentRadius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner fire core
        this.ctx.globalCompositeOperation = 'lighter';
        this.ctx.globalAlpha = alpha * 0.8;
        const fireGradient = this.ctx.createRadialGradient(x, y, 0, x, y, currentRadius * 0.6);
        fireGradient.addColorStop(0, '#fff');
        fireGradient.addColorStop(0.3, '#ffaa00');
        fireGradient.addColorStop(0.6, color);
        fireGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = fireGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, currentRadius * 0.6, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    /**
     * Add particle effect using enhanced particle system
     */
    addParticles(x, y, count, color) {
        // Keep backward compatibility while using new system
        const power = count / 30; // Normalize count to power
        const particles = spawnExplosionParticles(x, y, power);
        this.particleManager.addParticles(particles);
    }

    /**
     * Add explosion particles
     */
    addExplosionParticles(x, y, power = 1.0) {
        const particles = spawnExplosionParticles(x, y, power);
        this.particleManager.addParticles(particles);
    }

    /**
     * Add impact particles (when projectile hits terrain)
     */
    addImpactParticles(x, y, terrainColor) {
        const particles = spawnImpactParticles(x, y, terrainColor);
        this.particleManager.addParticles(particles);
    }

    /**
     * Update and draw particles using enhanced system
     */
    updateParticles(dt) {
        // Update particle manager
        const gravity = this.currentStage ? this.currentStage.gravity : 0.2;
        this.particleManager.update(dt, gravity);

        // Render all particles
        this.particleManager.render(this.ctx);

        // Update muzzle flashes
        this.updateMuzzleFlashes(dt);
    }

    /**
     * Clear all particles
     */
    clearParticles() {
        this.particleManager.clear();
        this.muzzleFlashes = [];
    }

    /**
     * Draw text with shadow
     */
    drawText(text, x, y, size = 20, color = '#fff') {
        this.ctx.font = `${size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Shadow
        this.ctx.fillStyle = '#000';
        this.ctx.fillText(text, x + 2, y + 2);

        // Text
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }
}
