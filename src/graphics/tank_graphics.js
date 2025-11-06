/**
 * Enhanced Tank Graphics
 * Renders tanks with detailed graphics including shadows, gradients, and highlights
 */

import { lightenColor, darkenColor } from './gfx_common.js';

/**
 * Draw an enhanced tank with detailed graphics
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} tank - Tank object with x, y, angle, color, radius, hp, maxHp
 * @param {boolean} isActive - Whether this tank is currently active
 */
export function drawEnhancedTank(ctx, tank, isActive = false) {
    if (!tank.isAlive) return;

    const { x, y, angle, color, radius } = tank;

    ctx.save();

    // Draw shadow
    drawTankShadow(ctx, x, y, radius);

    // Draw tank treads/base
    drawTankTreads(ctx, x, y, radius, color);

    // Draw tank body with metallic gradient
    drawTankBody(ctx, x, y, radius, color);

    // Draw barrel
    drawTankBarrel(ctx, x, y, angle, radius, color, isActive);

    // Draw active indicator (golden ring)
    if (isActive) {
        drawActiveIndicator(ctx, x, y, radius);
    }

    // Draw HP bar above tank
    drawEnhancedHealthBar(ctx, x, y - radius - 10, tank.hp, tank.maxHp);

    ctx.restore();
}

/**
 * Draw tank shadow beneath the tank
 */
function drawTankShadow(ctx, x, y, radius) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(x + 2, y + radius - 2, radius * 1.2, radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

/**
 * Draw tank treads/base platform
 */
function drawTankTreads(ctx, x, y, radius, color) {
    const treadWidth = radius * 2.4;
    const treadHeight = radius * 0.8;
    const darkColor = darkenColor(color, 40);

    // Left tread
    ctx.fillStyle = darkColor;
    ctx.fillRect(x - treadWidth / 2, y + radius - treadHeight, treadWidth / 2 - 2, treadHeight);

    // Right tread
    ctx.fillRect(x + 2, y + radius - treadHeight, treadWidth / 2 - 2, treadHeight);

    // Tread details (wheels)
    ctx.strokeStyle = darkenColor(color, 60);
    ctx.lineWidth = 2;
    const wheelCount = 4;
    for (let i = 0; i < wheelCount; i++) {
        const wheelX = x - treadWidth / 2 + (treadWidth / wheelCount) * (i + 0.5);
        const wheelY = y + radius - treadHeight / 2;
        ctx.beginPath();
        ctx.arc(wheelX, wheelY, 3, 0, Math.PI * 2);
        ctx.stroke();
    }
}

/**
 * Draw tank body with metallic gradient effect
 */
function drawTankBody(ctx, x, y, radius, color) {
    // Create radial gradient for metallic effect
    const gradient = ctx.createRadialGradient(
        x - radius * 0.3, y - radius * 0.3, radius * 0.2,
        x, y, radius
    );
    gradient.addColorStop(0, lightenColor(color, 40));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, darkenColor(color, 30));

    // Main body circle
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Body outline
    ctx.strokeStyle = darkenColor(color, 50);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top highlight
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = lightenColor(color, 60);
    ctx.beginPath();
    ctx.arc(x - radius * 0.2, y - radius * 0.3, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Turret ring detail
    ctx.strokeStyle = darkenColor(color, 40);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
}

/**
 * Draw tank barrel with detail
 */
function drawTankBarrel(ctx, x, y, angle, radius, color, isActive) {
    const barrelLength = radius * 1.8;
    const barrelWidth = 5;
    const barrelX = x + Math.cos(angle) * barrelLength;
    const barrelY = y + Math.sin(angle) * barrelLength;

    // Barrel shadow
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = barrelWidth + 2;
    ctx.beginPath();
    ctx.moveTo(x + 1, y + 1);
    ctx.lineTo(barrelX + 1, barrelY + 1);
    ctx.stroke();
    ctx.restore();

    // Main barrel
    const barrelColor = isActive ? '#ffd700' : darkenColor(color, 20);
    ctx.strokeStyle = barrelColor;
    ctx.lineWidth = barrelWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(barrelX, barrelY);
    ctx.stroke();

    // Barrel highlight
    ctx.strokeStyle = lightenColor(barrelColor, 30);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(barrelX, barrelY);
    ctx.stroke();

    // Barrel tip (muzzle)
    ctx.fillStyle = darkenColor(color, 60);
    ctx.beginPath();
    ctx.arc(barrelX, barrelY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = darkenColor(color, 40);
    ctx.lineWidth = 1;
    ctx.stroke();
}

/**
 * Draw active turn indicator
 */
function drawActiveIndicator(ctx, x, y, radius) {
    ctx.save();

    // Pulsing effect using time
    const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
    const glowRadius = radius + 5 + pulse * 3;

    // Outer glow
    ctx.strokeStyle = `rgba(255, 215, 0, ${0.3 + pulse * 0.2})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner ring
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

/**
 * Draw enhanced health bar with gradient
 */
function drawEnhancedHealthBar(ctx, x, y, hp, maxHp) {
    const width = 40;
    const height = 6;
    const percent = Math.max(0, Math.min(1, hp / maxHp));

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x - width / 2, y, width, height);

    // HP fill with gradient
    const hpColor = percent > 0.6 ? '#4ecca3' : percent > 0.3 ? '#f39c12' : '#e74c3c';

    if (percent > 0) {
        const gradient = ctx.createLinearGradient(x - width / 2, y, x - width / 2 + width * percent, y);
        gradient.addColorStop(0, hpColor);
        gradient.addColorStop(1, lightenColor(hpColor, 20));

        ctx.fillStyle = gradient;
        ctx.fillRect(x - width / 2, y, width * percent, height);
    }

    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - width / 2, y, width, height);

    // Shine effect
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - width / 2, y, width * percent, height / 2);
    ctx.restore();
}

/**
 * Draw muzzle flash effect when tank fires
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} angle - Barrel angle
 * @param {number} size - Flash size
 * @param {number} alpha - Flash opacity (0-1)
 */
export function drawMuzzleFlash(ctx, x, y, angle, size = 20, alpha = 1.0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha;

    // Flash position at barrel end
    const flashX = x + Math.cos(angle) * size;
    const flashY = y + Math.sin(angle) * size;

    // Bright core
    const gradient = ctx.createRadialGradient(flashX, flashY, 0, flashX, flashY, size);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.8)');
    gradient.addColorStop(0.6, 'rgba(255, 100, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(flashX, flashY, size, 0, Math.PI * 2);
    ctx.fill();

    // Flash spikes
    const spikeCount = 6;
    for (let i = 0; i < spikeCount; i++) {
        const spikeAngle = (Math.PI * 2 / spikeCount) * i + angle;
        const spikeLength = size * (0.8 + Math.random() * 0.4);

        ctx.strokeStyle = `rgba(255, 200, 100, ${alpha * 0.6})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(flashX, flashY);
        ctx.lineTo(
            flashX + Math.cos(spikeAngle) * spikeLength,
            flashY + Math.sin(spikeAngle) * spikeLength
        );
        ctx.stroke();
    }

    ctx.restore();
}
