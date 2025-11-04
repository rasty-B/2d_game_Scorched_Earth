/**
 * Main Entry Point
 * Initializes the game and starts the application
 */

import { Game } from './game.js';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Artillery Game - Modern Scorched Earth');
    console.log('Initializing...');

    // Get canvas and set size
    const canvas = document.getElementById('gameCanvas');
    canvas.width = 1280;
    canvas.height = 720;

    // Create game instance
    const game = new Game(canvas);

    console.log('Game ready! Use the menu to start.');

    // Make game accessible from console for debugging
    window.game = game;
});
