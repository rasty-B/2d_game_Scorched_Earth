/**
 * Main Entry Point
 * Initializes the game and starts the application
 */

import { Game } from './game.js';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Artillery Game - Modern Scorched Earth ===');
    console.log('DOM Content Loaded');

    // Debug: Check if menu element exists
    const menuElement = document.getElementById('game-menu');
    console.log('Menu element found:', !!menuElement);
    if (menuElement) {
        console.log('Menu initial classes:', menuElement.className);
        console.log('Menu computed display:', window.getComputedStyle(menuElement).display);
    }

    // Get canvas and set size
    const canvas = document.getElementById('gameCanvas');
    console.log('Canvas element found:', !!canvas);

    if (!canvas) {
        console.error('FATAL: Canvas not found!');
        return;
    }

    canvas.width = 1280;
    canvas.height = 720;
    console.log('Canvas sized to:', canvas.width, 'x', canvas.height);

    // Create game instance
    console.log('Creating Game instance...');
    const game = new Game(canvas);
    console.log('Game instance created');

    // Make game accessible from console for debugging
    window.game = game;
    console.log('Game accessible via window.game');

    // Debug function to manually show menu
    window.showMenuDebug = () => {
        console.log('Manual menu show requested');
        const menu = document.getElementById('game-menu');
        if (menu) {
            menu.classList.remove('hidden');
            console.log('Menu classes after manual show:', menu.className);
            console.log('Menu display:', window.getComputedStyle(menu).display);
        }
    };

    console.log('=== Initialization Complete ===');
    console.log('If menu is not visible, try: window.showMenuDebug()');
});
