# Changelog - Scorched Earth Artillery Game

## Version 2.0 - Complete Overhaul (Latest)

### 🎯 Major Features

#### 1. Simplified Weapon System
- **Reduced from 4 to 2 weapons** for better gameplay
- **Rail Gun**: High-speed direct fire with minimal gravity arc (2.5x speed, 0.5x mass)
- **RPG**: Rocket-powered explosive with visible thrust phase
  - 30 frames of continuous thrust acceleration
  - Transitions from powered flight to gravity-based ballistic arc
  - Visual thrust flame effect during powered phase

#### 2. Significantly Improved AI
- **Medium AI**: Uses trajectory simulation (8 angle × 6 power = 48 tests)
- **Hard AI**: Enhanced simulation (20 angle × 12 power = 240 tests)
- **Smart targeting**: Focuses search around target direction
- **Wind compensation**: AI accounts for wind in calculations
- **Distance optimization**: Adjusts power range based on target distance
- **Reduced error margins**:
  - Medium: ±22.5° accuracy
  - Hard: ±4.5° accuracy (very precise)

#### 3. Auto-Launch System
- **start.sh** (Linux/Mac) and **start.bat** (Windows)
- Automatically starts web server on port 8080
- Kills existing servers to prevent conflicts
- Opens browser automatically
- Adds timestamp to URL for cache busting
- Displays controls and instructions

### 🐛 Bug Fixes

#### Projectile Launch Issues (Critical Fix)
- **Issue**: Projectiles were invisible and only damaged launching tank
- **Cause**: Projectiles started at tank center, immediately colliding with terrain
- **Fix**: Changed launch position to barrel tip (barrel length * 1.8 from tank center)
- **Result**: Projectiles now fly properly and are visible throughout flight

#### ESC Key Support
- Added ESC key handler to cancel aiming mode
- Resets power meter, trajectory preview, and clears aim state
- Provides user control to abort unwanted shots

### 🎨 Visual Improvements

#### RPG Thrust Effects
- Animated orange/yellow thrust flame during powered phase
- Enhanced trail effect (thicker, more visible)
- Stronger glow during thrust (shadowBlur: 15 vs 10)
- Flame gradient from orange (#ff6b00) to yellow (transparent)

#### Renderer Optimizations
- Dynamic visual effects based on projectile state
- Proper alpha blending for thrust effects
- Smooth transitions between powered and ballistic phases

### 📁 File Structure Updates

```
/
├── index.html              - Updated weapon panel (2 weapons)
├── start.sh               - Enhanced launcher (Linux/Mac)
├── start.bat              - Enhanced launcher (Windows)
├── README.md              - Updated documentation
├── QUICKSTART.md          - Quick reference guide
├── CHANGELOG.md           - This file
├── /src/
│   ├── weapons.js         - Simplified to 2 weapons
│   ├── physics.js         - RPG powered flight implementation
│   ├── ai.js              - Smart trajectory simulation
│   ├── game.js            - Barrel-tip launch, ESC handler
│   ├── renderer.js        - RPG thrust flame visuals
│   ├── ui.js              - Simplified weapon display
│   └── [other files]      - Various improvements
└── /styles/
    └── main.css           - Updated for 2-weapon layout
```

### 🔧 Technical Changes

#### Physics Engine
- Added `thrustFrames` counter for RPG tracking
- Implemented powered flight behavior (`behavior: 'powered'`)
- Removed complex behaviors (homing, cluster, shields)
- Simplified collision and impact handling

#### AI System
- `findBestTrajectory()` now accepts angle/power step parameters
- Focused angle search range (±54° from target direction)
- Distance-based power estimation
- Wind parameter passed to trajectory simulation
- Only considers impact points near terrain surface

#### Cache Management
- Removed broken `?v=2` cache-busting parameters
- Launcher scripts use URL timestamps instead
- Format: `http://localhost:8080/index.html?t=<unix_timestamp>`
- Forces browser to load fresh files on each launch

### 📊 Performance

- AI trajectory calculation optimized with focused search ranges
- Reduced unnecessary computations (removed unused weapon behaviors)
- Cleaner codebase with ~200 fewer lines of code

### 🎮 Gameplay Changes

**Before:**
- 4 weapons (Rail Shot, Plasma Arc, Cluster Swarm, Vector Seeker)
- Basic AI with simple angle/power estimation
- Projectiles sometimes glitchy/invisible
- No way to cancel shots

**After:**
- 2 weapons (Rail Gun, RPG) with distinct characteristics
- Smart AI that consistently hits targets
- Reliable projectile physics and visibility
- ESC key cancels shots
- Visual feedback for RPG thrust phase

### 🚀 Getting Started

**Quick Start:**
```bash
# Linux/Mac
./start.sh

# Windows
start.bat
```

**Manual Start:**
```bash
python3 -m http.server 8080
# Open: http://localhost:8080/index.html
```

### 📝 Documentation Updates

- README.md reflects current 2-weapon system
- Added QUICKSTART.md for easy reference
- Updated controls documentation
- Launcher script instructions
- Removed outdated 4-weapon references

---

## Version 1.0 - Initial Release

- Basic artillery game implementation
- 4 weapon types
- 3 planetary stages
- Simple AI opponents
- Terrain deformation
- Turn-based gameplay

---

**For detailed commit history, see:** `git log`
