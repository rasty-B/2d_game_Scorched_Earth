# Scorched Earth - Artillery Game

A modern, browser-based 2D artillery game inspired by Scorched Earth and Worms. Battle with tanks across different planets with unique physics!

## Features

- **Turn-based artillery combat** with 2-6 tanks
- **Mouse-driven aiming** with trajectory preview
- **Dynamic physics** including gravity, wind, and terrain deformation
- **3 Planetary Stages** with unique conditions:
  - Luna Crater - Low gravity moon
  - Red Frontier - Mars-like dunes
  - Gas Giant Rim - High gravity, strong winds
- **2 Weapon Types**:
  - **Rail Gun** - High-speed direct fire with minimal arc (fast kinetic shell)
  - **RPG** - Rocket-powered explosive with thrust phase then gravity ballistic arc
- **Intelligent AI Opponents** with trajectory simulation and wind compensation
- **Destructible terrain** using heightmap system
- **Clean, modern UI** with minimal overlays

## How to Play

### Starting the Game

**IMPORTANT:** This game uses ES6 modules and requires a local web server. You cannot open `index.html` directly due to CORS restrictions.

#### Quick Start (Recommended)

**Linux/Mac:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

The launcher script will:
- Start a local web server on port 8080
- Automatically open your browser
- Display game controls and instructions

**That's it!** The game should open automatically in your browser.

#### Manual Start

Choose one of these methods:

**Python 3 (Recommended):**
```bash
python3 -m http.server 8080
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8080
```

**Node.js:**
```bash
npx http-server -p 8080
```

**PHP:**
```bash
php -S localhost:8080
```

Then navigate to **http://localhost:8080** in your browser.

#### Playing the Game

1. Select a planetary stage (Luna Crater, Red Frontier, or Gas Giant Rim)
2. Choose number of tanks (2-6)
3. Choose number of AI opponents (0-5)
4. Click "Start Game"
5. Game begins!

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
- **1**: Select Rail Gun (fast, direct fire)
- **2**: Select RPG (rocket-powered)
- **ESC**: Cancel current shot/aim

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
✅ 2 weapon types: Rail Gun (direct fire) and RPG (powered rocket)
✅ 3 planetary stages with different physics
✅ **Intelligent AI** with trajectory simulation and wind compensation
✅ Turn-based gameplay
✅ Tank HP and damage system
✅ Explosion effects and terrain deformation
✅ Clean HUD with power meter, wind indicator
✅ Weapon selection system
✅ Game over and menu screens
✅ ESC key to cancel shots
✅ **Auto-launch scripts** for easy setup (start.sh / start.bat)

## Deployment

### GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select branch and root folder
4. Access at `https://[username].github.io/[repo-name]/`

### Local Testing
Use the launcher scripts (`start.sh` or `start.bat`) for the easiest setup. They automatically start a web server and open your browser.

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
