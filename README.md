# Artillery Game - Modern Scorched Earth

A modern, browser-based 2D artillery game inspired by Scorched Earth and Worms. Battle with tanks across different planets with unique physics!

## Features

- **Turn-based artillery combat** with 2-6 tanks
- **Mouse-driven aiming** with trajectory preview
- **Dynamic physics** including gravity, wind, and terrain deformation
- **5 Planetary Stages** with unique conditions:
  - Luna Crater - Low gravity moon
  - Red Frontier - Mars-like dunes
  - Gas Giant Rim - High gravity, strong winds
  - Ice Moon - Frozen cliffs
  - Magma Core - Volcanic hellscape
- **4 Weapon Types**:
  - Rail Shot - High-speed kinetic shell
  - Plasma Arc - Burning energy weapon
  - Cluster Swarm - Splits into sub-munitions
  - Vector Seeker - Homing projectile
- **AI Opponents** with multiple difficulty levels
- **Destructible terrain** using heightmap system
- **Clean, modern UI** with minimal overlays

## How to Play

### Starting the Game

1. Open `index.html` in a modern web browser
2. Select a planetary stage
3. Choose number of tanks (2-6)
4. Choose number of AI opponents
5. Click "Start Game"

### Controls

#### Mouse Controls (Primary)
- **Click and hold** on your tank to aim
- **Drag** to set angle and power:
  - Direction of drag = angle
  - Length of drag = power
- **Release** to fire

#### Keyboard Controls
- **Arrow Keys / A-D**: Fine-tune angle
- **Spacebar**: Fire with 50% power
- **1-4**: Select weapon

### Game Rules

- Players take turns firing at each other
- Each tank starts with 100 HP
- Explosions damage tanks within radius
- Terrain is destroyed by impacts
- Last tank standing wins!
- Wind affects projectile trajectory (varies by planet)
- Different weapons have unique behaviors

## Technical Details

### Built With
- HTML5 Canvas
- Vanilla JavaScript (ES6+)
- CSS3

### File Structure
```
/index.html          - Main HTML file
/styles/
  main.css          - Styling and UI
/src/
  main.js           - Entry point
  game.js           - Main game loop and state management
  renderer.js       - Canvas drawing operations
  terrain.js        - Heightmap generation and deformation
  physics.js        - Projectile physics and collision
  weapons.js        - Weapon definitions
  stages.js         - Planetary stage configurations
  ai.js             - AI opponent logic
  ui.js             - HUD and interface management
/assets/            - Sound and image assets (future)
```

### Features Implemented

✅ Terrain generation with multiple profiles
✅ Heightmap-based collision detection
✅ Physics simulation (gravity, wind, projectiles)
✅ Mouse-driven aiming with trajectory preview
✅ 4 weapon types with unique behaviors
✅ 3+ planetary stages with different physics
✅ AI opponents (Easy, Medium, Hard)
✅ Turn-based gameplay
✅ Tank HP and damage system
✅ Explosion effects and terrain deformation
✅ Clean HUD with power meter, wind indicator
✅ Weapon selection system
✅ Game over and menu screens

## Deployment

### GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select branch and root folder
4. Access at `https://[username].github.io/[repo-name]/`

### Local Testing
Simply open `index.html` in a web browser. No build process or server required!

## Future Enhancements

- Online multiplayer (WebSockets)
- More weapons (Orbital Strike, Shield, Teleporter)
- Campaign mode with progression
- Mobile touch controls
- Sound effects and music
- Particle system improvements
- More planetary stages
- Tank customization
- Power-ups and items

## Browser Compatibility

Requires a modern browser with:
- HTML5 Canvas support
- ES6+ JavaScript
- CSS3

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - Feel free to use and modify!

## Credits

Inspired by:
- Scorched Earth (1991) by Wendell Hicken
- Worms: Armageddon by Team17
- ShellShock Live

---

**Enjoy the game! 🚀💥**
