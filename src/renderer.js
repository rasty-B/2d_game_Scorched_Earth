/**
 * Renderer - Handles all Canvas drawing operations
 */

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.particles = [];
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
     * Draw terrain
     */
    drawTerrain(terrain, stage) {
        // Draw terrain fill
        this.ctx.fillStyle = stage.colors.terrain;
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
    }

    /**
     * Draw a tank
     */
    drawTank(tank, isActive = false) {
        if (!tank.isAlive) return;

        const { x, y, angle, color, radius } = tank;

        // Draw tank body
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Draw barrel
        const barrelLength = radius * 1.8;
        const barrelX = x + Math.cos(angle) * barrelLength;
        const barrelY = y + Math.sin(angle) * barrelLength;

        this.ctx.strokeStyle = isActive ? '#ffd700' : '#333';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(barrelX, barrelY);
        this.ctx.stroke();

        // Draw HP bar
        this.drawHealthBar(x, y - radius - 10, tank.hp, tank.maxHp);

        // Draw active indicator
        if (isActive) {
            this.ctx.strokeStyle = '#ffd700';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    /**
     * Draw health bar
     */
    drawHealthBar(x, y, hp, maxHp) {
        const width = 40;
        const height = 6;
        const percent = hp / maxHp;

        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(x - width / 2, y, width, height);

        // HP fill
        const hpColor = percent > 0.6 ? '#4ecca3' : percent > 0.3 ? '#f39c12' : '#e74c3c';
        this.ctx.fillStyle = hpColor;
        this.ctx.fillRect(x - width / 2, y, width * percent, height);

        // Border
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x - width / 2, y, width, height);
    }

    /**
     * Draw projectile
     */
    drawProjectile(projectile) {
        if (!projectile.active) return;

        const { x, y, weapon, trail, thrustFrames } = projectile;

        // Check if this is an RPG in powered flight
        const isPowered = weapon.behavior === 'powered' && thrustFrames < weapon.thrustDuration;

        // Draw trail
        if (trail.length > 1) {
            this.ctx.strokeStyle = weapon.trailColor;
            this.ctx.lineWidth = isPowered ? 3 : 2;
            this.ctx.globalAlpha = isPowered ? 0.7 : 0.5;

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

        // Draw glow effect (stronger for powered flight)
        this.ctx.shadowColor = weapon.color;
        this.ctx.shadowBlur = isPowered ? 15 : 10;
        this.ctx.fillStyle = weapon.color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, isPowered ? 8 : 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Draw thrust flame for RPG during powered phase
        if (isPowered) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.8;
            this.ctx.translate(x, y);
            this.ctx.rotate(projectile.angle + Math.PI);

            // Draw flame
            const flameLength = 10 + Math.random() * 5;
            const gradient = this.ctx.createLinearGradient(0, 0, flameLength, 0);
            gradient.addColorStop(0, '#ff6b00');
            gradient.addColorStop(0.5, '#ff9500');
            gradient.addColorStop(1, 'rgba(255, 200, 0, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(flameLength, -3);
            this.ctx.lineTo(flameLength, 3);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.restore();
        }
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
     * Draw explosion effect
     */
    drawExplosion(explosion) {
        const { x, y, radius, color, age, maxAge } = explosion;
        const progress = age / maxAge;
        const currentRadius = radius * (1 + progress * 0.5);
        const alpha = 1 - progress;

        // Outer ring
        this.ctx.globalAlpha = alpha * 0.5;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner core
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(x, y, currentRadius * 0.5, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.globalAlpha = 1.0;
    }

    /**
     * Add particle effect
     */
    addParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                life: 1.0,
                color
            });
        }
    }

    /**
     * Update and draw particles
     */
    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 0.2; // Gravity
            p.life -= dt * 0.5;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.globalAlpha = 1.0;
    }

    /**
     * Draw seeker target indicator
     */
    drawSeekerTarget(target) {
        const { x, y } = target;

        // Pulsing animation
        const time = Date.now() / 200;
        const pulse = Math.sin(time) * 0.3 + 0.7;

        // Outer circle
        this.ctx.strokeStyle = '#9b59b6';
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = pulse;

        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.stroke();

        // Inner crosshair
        this.ctx.strokeStyle = '#9b59b6';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.moveTo(x - 15, y);
        this.ctx.lineTo(x - 5, y);
        this.ctx.moveTo(x + 5, y);
        this.ctx.lineTo(x + 15, y);
        this.ctx.moveTo(x, y - 15);
        this.ctx.lineTo(x, y - 5);
        this.ctx.moveTo(x, y + 5);
        this.ctx.lineTo(x, y + 15);
        this.ctx.stroke();

        this.ctx.globalAlpha = 1.0;

        // Label
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = '#9b59b6';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('TARGET', x, y - 25);
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
