# Scorched Earth - Energy-Based Artillery Game

![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-2.0--rebuild-blue.svg)
![Build](https://img.shields.io/badge/build-passing-success.svg)

## 🎮 Modern Turn-Based Artillery Combat with Energy Management

A sophisticated 2D artillery game built with HTML5 Canvas, featuring an energy-based gameplay system, heat management, 10 unique weapons, and dynamic environmental hazards.

**⚡ VERSION 2.0 - COMPLETE REBUILD**: This version features a complete game rebuild with energy-based mechanics, heat management, and 10 sophisticated weapons loaded from JSON configurations. See [README_REBUILD.md](README_REBUILD.md) for full details.

---

## 🚀 Quick Start

### Play the Latest Version

```bash
# Clone repository
git clone https://github.com/rasty-B/2d_game_Scorched_Earth.git
cd 2d_game_Scorched_Earth

# Serve with local server
python -m http.server 8000

# Open in browser
http://localhost:8000/index_new.html
```

### Controls
- **Mouse**: Drag from tank to aim and set power, release to fire
- **Arrow Keys / A/D**: Adjust firing angle
- **1/2**: Switch between weapons
- **Spacebar**: Quick fire at 50% power

---

## ✨ New Features (Version 2.0)

### 🎯 Energy-Based Combat System
- **100 Energy Pool**: Shared across weapons, movement, and shields
- **Heat Management**: Heat accumulates from weapon use, reducing energy regeneration
- **Strategic Resource Management**: Balance offense, defense, and mobility

### 🔥 Heat Mechanics
- **5 Heat States**: Optimal (0-40) → Warm (40-60) → Hot (60-80) → Critical (80-100) → Overheated (100+)
- **Overheat Penalty**: Systems disabled for 1 turn at 100+ heat
- **Passive Cooling**: 10 heat/turn (environmental modifiers apply)
- **Active Cooling**: Spend energy to cool faster

### 🔫 10 Unique Weapons
Loaded from `weapons.json` with full stats:

| Tier | Weapon | Cost | Heat | Description |
|------|--------|------|------|-------------|
| **1** | Rail Shot | 10E | 5H | Basic kinetic projectile |
| **2** | Plasma Arc | 25E | 15H | Burning energy weapon with DoT |
| **2** | Cluster Swarm | 30E | 10H | Splits into 6 sub-munitions |
| **2** | Vector Seeker | 35E | 12H | Semi-guided homing missile |
| **2** | Orbital Beacon | 40E | 8H | Delayed orbital strike (1 turn) |
| **2** | EMP Pulse | 30E | 20H | Disables enemy systems |
| **3** | Quantum Bomb | 60E | 35H | Massive damage (2-turn charge) |
| **3** | Phase Disruptor | 50E | 30H | Bypasses shields (1-turn charge) |
| **3** | Gravitic Missile | 45E | 18H | Pulls enemies toward impact |
| **3** | Anti-Grav Barrage | 40E | 16H | Launches enemies upward |

### 🗺️ Level System
- **MVP Stage 1**: "Broken Arch Basin" (2400×1350)
- **JSON-based levels**: Easy level creation and modification
- **Environmental Hazards**: Animated toxic gas, ion storms, EMP zones
- **Cave Systems**: Skill shot opportunities through arched bridges

### 📊 Professional HUD
- **Energy Bar**: Real-time energy tracking with color-coded states
- **Heat Bar**: Visual heat management with threshold warnings
- **HP Bar**: Tank health display
- **Weapon Panel**: Shows energy costs and heat generation for each weapon
- **Turn Info**: Current player, wind, angle, and power

---

## 🎯 Game Systems

### Energy Economy
```javascript
Energy Pool: 100 maximum
Base Regeneration: 20 energy/turn
Heat Penalty: regen × (1 - (heat/maxHeat) × 0.5)

Examples:
  0 heat  → 20 energy/turn (100% efficiency)
  50 heat → 15 energy/turn (75% efficiency)
  100 heat → 10 energy/turn (50% efficiency)
```

### Turn Structure
1. **Start Turn**: Regenerate energy (heat-adjusted), cool heat, update cooldowns
2. **Actions**: Move, adjust aim, select weapon, fire (if resources available)
3. **Projectile Phase**: Physics simulation, collision, damage
4. **End Turn**: Check victory, generate new wind, next player

### Weapon Mechanics
- **Energy Costs**: 10-60 energy per weapon
- **Heat Generation**: 5-35 heat per weapon
- **Cooldowns**: 0-4 turns (prevents rapid-fire of powerful weapons)
- **Charging**: Exotic weapons require 1-2 turns of charging
- **Damage Falloff**: Linear, quadratic, or constant based on weapon type

---

## 📦 Repository Structure

```
📦 Repository
├── 🌐 index_new.html          # ⭐ NEW VERSION - Energy-based gameplay
├── 🌐 index.html              # Legacy version (v1.0)
├── 🌐 level_preview.html      # Level visualization tool
│
├── 📁 src/
│   ├── 📁 core/              # ⭐ NEW - Core game systems
│   │   ├── EnergyManager.js  # Energy pool, heat, regeneration
│   │   ├── WeaponSystem.js   # Weapon loading from JSON
│   │   ├── LevelManager.js   # Level loading and queries
│   │   └── ConfigLoader.js   # Configuration management
│   │
│   ├── 📁 entities/          # ⭐ NEW - Game entities
│   │   ├── Tank.js           # Enhanced tank with energy
│   │   └── Projectile.js     # Weapon-based projectile physics
│   │
│   ├── 📁 game/              # ⭐ NEW - Game controllers
│   │   └── GameNew.js        # Main game loop with energy system
│   │
│   ├── 📁 graphics/          # Enhanced graphics system
│   │   ├── gfx_common.js
│   │   ├── terrain_patterns.js
│   │   ├── particles.js
│   │   └── tank_graphics.js
│   │
│   ├── 📁 levels/            # Level definitions
│   │   ├── level_types.ts    # TypeScript types
│   │   └── mvp_stage_01.ts   # First level
│   │
│   ├── game.js               # Legacy game controller
│   ├── renderer.js           # Enhanced with level rendering
│   ├── terrain.js
│   ├── physics.js
│   ├── weapons.js
│   ├── stages.js
│   ├── ai.js
│   └── ui.js
│
├── 📁 levels/                # Level data (JSON)
│   └── mvp_stage_01.json
│
├── 📄 weapons.json           # ⭐ NEW - 10 weapons (607 lines)
├── 📄 energy_system.json     # ⭐ NEW - Energy rules (399 lines)
├── 📄 physics_rules.json     # ⭐ NEW - Physics constants
│
└── 📚 Documentation
    ├── README.md             # This file (main documentation)
    ├── README_REBUILD.md     # ⭐ Detailed rebuild documentation
    ├── GRAPHICS_UPGRADE.md   # Graphics system details
    ├── HOVER_TANK_SPEC.md    # 3D asset specifications
    ├── PHYSICS_GAMEPLAY_SPEC.md  # Implementation specs
    └── INTEGRATION_ROADMAP.md    # Migration roadmap
```

---

## 🎮 How to Play

### Starting the Game

**IMPORTANT:** This game uses ES6 modules and requires a local web server.

#### Quick Start Scripts

**Linux/Mac:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

Then open: **http://localhost:8080/index_new.html**

#### Manual Start

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

Then navigate to **http://localhost:8080/index_new.html**

### Game Controls

#### Mouse Controls (Primary)
- **Click and drag** from your tank to aim
- **Drag direction** = firing angle
- **Drag distance** = power (longer = more power)
- **Release** to fire

#### Keyboard Controls
- **Arrow Keys / A-D**: Fine-tune angle
- **1/2**: Switch between weapons
- **Spacebar**: Quick fire at 50% power

### Strategic Tips

1. **Manage Energy**: Don't fire expensive weapons when low on energy
2. **Watch Heat**: High heat reduces energy regeneration
3. **Use Cooldowns Wisely**: Plan multi-turn strategies with powerful weapons
4. **Avoid Hazards**: Gas clouds, ion storms, and EMP zones affect tanks
5. **Use the Cave**: Skill shots through the arch deal maximum damage
6. **Balance Resources**: Sometimes it's better to wait a turn and let systems cool

---

## 🛠️ Configuration

### Tuning Gameplay

All balance parameters are in JSON files - no code changes needed!

**Edit weapons.json:**
```json
{
  "rail_shot": {
    "energyCost": 10,        // Increase to make more expensive
    "heatGeneration": 5,     // Increase to generate more heat
    "cooldownTurns": 0,      // Add cooldown penalty
    "damage": {
      "direct": 35,          // Base damage
      "explosionRadius": 15  // Damage radius
    }
  }
}
```

**Edit energy_system.json:**
```json
{
  "energyEconomy": {
    "baseEnergy": { "maximum": 100 },           // Change max energy
    "regeneration": { "baseRegenPerTurn": 20 }  // Change regen rate
  },
  "heatSystem": {
    "heatDissipation": { "passiveCoolingPerTurn": 10 }  // Change cooling
  }
}
```

**Quick Balance Tool:**
- Edit `weapons_balancing.csv` in Excel/Google Sheets
- Import back to `weapons.json`

### Creating New Levels

1. Create JSON file in `levels/` directory
2. Define terrain polyline, hazards, spawns
3. Preview with `level_preview.html`
4. Load in game

**Example:**
```json
{
  "id": "custom_level",
  "name": "My Level",
  "worldWidth": 2400,
  "worldHeight": 1350,
  "terrain": {
    "points": [
      { "x": 0, "y": 900 },
      { "x": 1200, "y": 800 },
      { "x": 2400, "y": 900 }
    ]
  },
  "hazards": [
    {
      "id": "gas_1",
      "type": "gas",
      "center": { "x": 1200, "y": 850 },
      "radius": 200,
      "intensity": 0.8
    }
  ]
}
```

---

## 📊 Technical Details

### Architecture

**Version 2.0 (New)**
- Modular design with core systems
- Configuration-driven gameplay
- JSON-based weapon and level loading
- Fixed timestep physics (60Hz)
- Event-driven turn system

**Technology Stack**
- HTML5 Canvas 2D
- Vanilla JavaScript (ES6 modules)
- JSON configuration files
- No build tools required

### Performance
- 60 FPS rendering
- Efficient particle system with object pooling
- Gradient caching for terrain textures
- Optimized collision detection

---

## 🚀 Roadmap

### ✅ Completed (v2.0)
- Energy-based gameplay system
- Heat management mechanics
- 10 sophisticated weapons
- JSON weapon loading
- Level system with hazards
- Professional HUD with resource bars
- Animated environmental hazards

### 🔄 In Progress
- [ ] Advanced weapon behaviors (homing, cluster, charging)
- [ ] Terrain deformation
- [ ] Hazard gameplay effects
- [ ] Movement system UI

### 📅 Planned

**Phase 1: Polish (Weeks 1-2)**
- Cooldown/charging UI indicators
- Active cooling button
- Movement controls
- Sound effects

**Phase 2: Advanced Features (Weeks 3-4)**
- Implement all weapon behaviors
- Terrain deformation
- Full physics integration

**Phase 3: Content (Weeks 5-8)**
- 5 additional levels
- Campaign mode
- Weapon unlocks
- Tank customization

**Phase 4: Multiplayer (Weeks 9-12)**
- Network multiplayer
- Lobby system
- Replay system

---

## 📄 Version History

### Version 2.0 - Complete Rebuild (Current)
**Branch:** `claude/clean-latest-version-011CUsDC8JeMxyHLrTxTEju8`
**Date:** 2025-11-07

- ✅ Complete architecture rebuild
- ✅ Energy-based gameplay system (100 pool, heat management)
- ✅ 10 weapons from JSON (607 lines)
- ✅ Level loading system (MVP Stage 1)
- ✅ Environmental hazards (gas, ion, EMP)
- ✅ Professional HUD with energy/heat/HP bars
- ✅ Weapon costs and cooldowns
- ✅ Configuration-driven balance
- 📦 **2,575 lines** of new code

**Entry Point:** `index_new.html`

### Version 1.0 - Legacy (Original)
- Basic artillery game
- HP-based combat
- 4 simple weapons
- Procedural terrain
- Basic HUD

**Entry Point:** `index.html`

---

## 📚 Documentation

- **[README_REBUILD.md](README_REBUILD.md)** - Complete rebuild documentation
- **[GRAPHICS_UPGRADE.md](GRAPHICS_UPGRADE.md)** - Graphics system details
- **[PHYSICS_GAMEPLAY_SPEC.md](PHYSICS_GAMEPLAY_SPEC.md)** - Implementation specs
- **[HOVER_TANK_SPEC.md](HOVER_TANK_SPEC.md)** - 3D asset specifications
- **[INTEGRATION_ROADMAP.md](INTEGRATION_ROADMAP.md)** - Future development plan

---

## 🤝 Contributing

This is an active solo project. Contributions, suggestions, and feedback are welcome!

**To contribute:**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📞 Contact & Support

- **Repository**: https://github.com/rasty-B/2d_game_Scorched_Earth
- **Issues**: https://github.com/rasty-B/2d_game_Scorched_Earth/issues

---

## 🙏 Acknowledgments

**Inspired by:**
- Scorched Earth (1991) by Wendell Hicken
- Worms: Armageddon by Team17
- FTL: Faster Than Light (energy management mechanics)
- Into the Breach (strategic resource management)

---

## 📄 License

MIT License - Feel free to use and modify!

---

## 🎮 Browser Compatibility

**Requires:**
- HTML5 Canvas support
- ES6+ JavaScript (modules, async/await, classes)
- CSS3

**Tested on:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

**Current Status:** ✅ Active Development
**Current Branch:** `claude/clean-latest-version-011CUsDC8JeMxyHLrTxTEju8`
**Last Updated:** 2025-11-07

---

Made with ⚡ and 🔥 | **Play now:** `index_new.html`
