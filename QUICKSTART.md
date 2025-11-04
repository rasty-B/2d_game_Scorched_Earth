# 🚀 Quick Start Guide

## Launch the Game

Simply run the launcher script:

**Linux/Mac:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

The script will:
- ✅ Start a web server automatically
- ✅ Open your browser to the game
- ✅ Display controls and instructions

## Game Controls

### Aiming & Firing
- **Click and drag** from your tank to aim
- **Drag length** = power
- **Drag direction** = angle
- **Release** to fire

### Weapons (Press number keys)
- **1** = Rail Gun (fast, direct trajectory)
- **2** = RPG (rocket with thrust phase)

### Other Controls
- **Arrow Keys / A-D** = Fine-tune angle
- **ESC** = Cancel shot
- **Spacebar** = Quick fire at 50% power

## Game Features

✅ **2 Weapons:**
   - Rail Gun: Nearly straight trajectory, fast
   - RPG: Rocket-powered with visible thrust flame

✅ **Smart AI:**
   - Uses trajectory simulation
   - Accounts for wind
   - Much more accurate than before

✅ **3 Planetary Stages:**
   - Luna Crater (low gravity)
   - Red Frontier (Mars-like)
   - Gas Giant Rim (high gravity, strong wind)

## Troubleshooting

### Browser Cache Issue?
The launcher script uses timestamps to bypass cache. If you still see old version:

1. Close ALL browser tabs with the game
2. Run the launcher script again
3. It will open a fresh URL with timestamp

### Manual Server Start
If the launcher doesn't work:
```bash
python3 -m http.server 8080
```
Then open: http://localhost:8080/index.html

## What's New

- ✅ Simplified to 2 weapons (was 4)
- ✅ RPG now has powered flight with thrust flames
- ✅ Much smarter AI with trajectory planning
- ✅ ESC key to cancel shots
- ✅ Projectiles launch from barrel tip (no more self-damage bug)
- ✅ Auto-launch scripts for easy setup

---

**Enjoy the game!** 💥🎯
