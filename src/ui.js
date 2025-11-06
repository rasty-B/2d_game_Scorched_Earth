/**
 * UI Controller
 * Manages HUD updates and user interface elements
 */

export class UI {
    constructor() {
        console.log('UI constructor called');

        this.elements = {
            currentPlayer: document.getElementById('current-player'),
            currentWeapon: document.getElementById('current-weapon'),
            windValue: document.getElementById('wind-value'),
            windArrow: document.getElementById('wind-arrow'),
            powerFill: document.getElementById('power-fill'),
            powerValue: document.getElementById('power-value'),
            angleValue: document.getElementById('angle-value'),
            gameMenu: document.getElementById('game-menu'),
            gameOver: document.getElementById('game-over'),
            winnerText: document.getElementById('winner-text'),
            weaponPanel: document.getElementById('weapon-panel')
        };

        // Debug: Check if critical elements exist
        console.log('game-menu element:', this.elements.gameMenu);
        console.log('game-menu has hidden class:', this.elements.gameMenu?.classList.contains('hidden'));

        this.weaponSlots = document.querySelectorAll('.weapon-slot');
        console.log('Found weapon slots:', this.weaponSlots.length);
    }

    /**
     * Update current player display
     */
    updatePlayer(playerName, color) {
        this.elements.currentPlayer.textContent = playerName;
        this.elements.currentPlayer.style.color = color;
    }

    /**
     * Update current weapon display
     */
    updateWeapon(weaponName) {
        this.elements.currentWeapon.textContent = weaponName;

        // Update active weapon slot
        this.weaponSlots.forEach(slot => {
            const weaponId = slot.dataset.weapon;
            if (weaponId === weaponName.toLowerCase().replace(' ', '')) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }
        });
    }

    /**
     * Update wind indicator
     */
    updateWind(wind) {
        this.elements.windValue.textContent = Math.abs(wind).toFixed(1);

        // Update arrow direction
        if (Math.abs(wind) < 1) {
            this.elements.windArrow.textContent = '•';
        } else if (wind > 0) {
            this.elements.windArrow.textContent = '→';
        } else {
            this.elements.windArrow.textContent = '←';
        }

        // Color based on strength
        const strength = Math.abs(wind);
        if (strength < 5) {
            this.elements.windArrow.style.color = '#4ecca3';
        } else if (strength < 15) {
            this.elements.windArrow.style.color = '#f39c12';
        } else {
            this.elements.windArrow.style.color = '#e74c3c';
        }
    }

    /**
     * Update power meter
     */
    updatePower(power) {
        this.elements.powerFill.style.width = `${power}%`;
        this.elements.powerValue.textContent = `${Math.floor(power)}%`;
    }

    /**
     * Update angle display
     */
    updateAngle(angle) {
        const degrees = Math.floor((angle * 180) / Math.PI);
        this.elements.angleValue.textContent = `${degrees}°`;
    }

    /**
     * Show game menu
     */
    showMenu() {
        console.log('showMenu() called');
        console.log('gameMenu element exists:', !!this.elements.gameMenu);

        if (this.elements.gameMenu) {
            console.log('Removing hidden class from menu');
            this.elements.gameMenu.classList.remove('hidden');
            console.log('Menu classes after remove:', this.elements.gameMenu.className);
        } else {
            console.error('ERROR: gameMenu element is null!');
        }

        if (this.elements.gameOver) {
            this.elements.gameOver.classList.add('hidden');
        }
    }

    /**
     * Hide game menu
     */
    hideMenu() {
        this.elements.gameMenu.classList.add('hidden');
    }

    /**
     * Show game over screen
     */
    showGameOver(winnerName, winnerColor) {
        this.elements.winnerText.textContent = `${winnerName} Wins!`;
        this.elements.winnerText.style.color = winnerColor;
        this.elements.gameOver.classList.remove('hidden');
    }

    /**
     * Hide game over screen
     */
    hideGameOver() {
        this.elements.gameOver.classList.add('hidden');
    }

    /**
     * Setup weapon selection listeners
     */
    setupWeaponListeners(callback) {
        this.weaponSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                const weaponId = slot.dataset.weapon;
                callback(weaponId);
            });
        });
    }

    /**
     * Setup keyboard weapon shortcuts
     */
    setupWeaponKeys(callback) {
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '9') {
                const index = parseInt(e.key) - 1;
                const slots = Array.from(this.weaponSlots);
                if (slots[index]) {
                    const weaponId = slots[index].dataset.weapon;
                    callback(weaponId);
                }
            }
        });
    }

    /**
     * Show notification/message
     */
    showNotification(message, duration = 2000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.position = 'absolute';
        notification.style.top = '50%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.background = 'rgba(0, 0, 0, 0.8)';
        notification.style.color = '#fff';
        notification.style.padding = '20px 40px';
        notification.style.borderRadius = '10px';
        notification.style.fontSize = '24px';
        notification.style.fontWeight = 'bold';
        notification.style.zIndex = '1000';
        notification.style.pointerEvents = 'none';
        notification.textContent = message;

        document.getElementById('game-container').appendChild(notification);

        // Remove after duration
        setTimeout(() => {
            notification.remove();
        }, duration);
    }

    /**
     * Update tank count display
     */
    updateTankCountDisplay(count) {
        const display = document.getElementById('tank-count-display');
        if (display) {
            display.textContent = count;
        }
    }

    /**
     * Update AI count display
     */
    updateAICountDisplay(count) {
        const display = document.getElementById('ai-count-display');
        if (display) {
            display.textContent = count;
        }
    }
}
