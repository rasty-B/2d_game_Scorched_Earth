# Screenshot Guide

This guide explains how to capture screenshots for the README.

## Required Screenshots

### 1. Main Menu (`screenshots/01_menu.png`)
- **What to capture**: Main game menu with "START GAME" button
- **Resolution**: 1280x720
- **How**:
  1. Open `index_new.html`
  2. Wait for menu to load
  3. Press F12 → Console → Run: `document.querySelector('canvas').toDataURL()`
  4. Or use OS screenshot tool (Windows: Win+Shift+S, Mac: Cmd+Shift+4)

### 2. Gameplay - Early Turn (`screenshots/02_gameplay_start.png`)
- **What to capture**: Game in progress, showing:
  - Tank on left plateau
  - Energy/Heat/HP bars visible
  - Weapon panel showing costs
  - Terrain with cave bridge
  - Clean, no projectiles
- **Key elements**: HUD, terrain, tank, hazards visible

### 3. Firing Weapon (`screenshots/03_firing_weapon.png`)
- **What to capture**: Player aiming and firing
  - Aim line visible from tank
  - Power meter showing charge
  - Projectile trail in mid-flight
  - Particle effects
- **Timing**: Capture during projectile flight

### 4. Explosion Impact (`screenshots/04_explosion.png`)
- **What to capture**: Explosion effects
  - Large explosion with particles
  - Fire/smoke/debris particles visible
  - Tank taking damage
  - HP bar decreasing
- **Timing**: Capture right at moment of impact

### 5. Energy Management (`screenshots/05_energy_system.png`)
- **What to capture**: Resource management focus
  - Energy bar at medium level (50-70%)
  - Heat bar elevated (60-80% - orange/red)
  - Weapon costs clearly visible
  - Close-up of resource bars
- **Purpose**: Show energy/heat mechanics

### 6. Environmental Hazards (`screenshots/06_hazards.png`)
- **What to capture**: All three hazards visible
  - Toxic gas cloud (green, pulsing)
  - Ion storm (purple streaks)
  - EMP zone (cyan spikes)
- **Camera**: Pan to show full level if needed

### 7. Weapon Selection (`screenshots/07_weapon_panel.png`)
- **What to capture**: Weapon panel close-up
  - Multiple weapons listed
  - Energy costs (10E, 25E, etc.)
  - Heat generation (5H, 15H, etc.)
  - One weapon highlighted as active
- **Purpose**: Show weapon variety and costs

### 8. Victory Screen (`screenshots/08_game_over.png`)
- **What to capture**: End game state
  - Winner announcement
  - Final scores/stats if visible
  - "Play Again" button

## Capture Methods

### Method 1: Browser DevTools (Recommended)
```javascript
// Open browser console (F12)
// Run this to download canvas as PNG:
const canvas = document.getElementById('gameCanvas');
const link = document.createElement('a');
link.download = 'screenshot.png';
link.href = canvas.toDataURL();
link.click();
```

### Method 2: OS Screenshot Tools
- **Windows**: Win + Shift + S (Snipping Tool)
- **Mac**: Cmd + Shift + 4 (select area)
- **Linux**: Shift + PrtSc (select area)

### Method 3: Browser Extensions
- Awesome Screenshot
- Nimbus Screenshot
- Full Page Screen Capture

## Image Specifications

- **Format**: PNG (preferred) or JPG
- **Resolution**: 1280x720 for full screen, or cropped as needed
- **Compression**: Optimize with TinyPNG or similar (keep under 500KB each)
- **Naming**: Use `01_menu.png`, `02_gameplay_start.png`, etc.

## Post-Processing (Optional)

### Recommended Edits:
1. **Crop**: Remove browser chrome (address bar, etc.)
2. **Resize**: Scale down if too large (max width: 1280px)
3. **Annotate**: Add arrows/labels to highlight features
4. **Optimize**: Compress to reduce file size

### Tools:
- **Free Online**: Photopea (https://www.photopea.com/)
- **Desktop**: GIMP, Paint.NET, Preview (Mac)
- **Command Line**: ImageMagick

## Adding to README

Once screenshots are captured, they'll automatically appear in README.md using:

```markdown
![Description](screenshots/filename.png)
```

## GIF/Video Capture (Optional)

For animated demonstrations:

### Screen Recording Tools:
- **Windows**: Xbox Game Bar (Win + G)
- **Mac**: QuickTime Player (Cmd + Ctrl + N)
- **Linux**: SimpleScreenRecorder, Kazam
- **Cross-platform**: OBS Studio

### Convert to GIF:
```bash
# Using ffmpeg (install first)
ffmpeg -i recording.mp4 -vf "fps=15,scale=800:-1:flags=lanczos" output.gif

# Optimize GIF
gifsicle -O3 output.gif -o optimized.gif
```

### GIF Specs:
- Max 10 seconds
- 15-20 fps
- 800px width max
- Under 5MB

## Checklist

Before submitting screenshots:

- [ ] All 8 required screenshots captured
- [ ] Images are properly named (01-08)
- [ ] Resolution is appropriate (1280x720 or smaller)
- [ ] File sizes are reasonable (<500KB each)
- [ ] Images show key features clearly
- [ ] No personal info visible (browser tabs, etc.)
- [ ] Images placed in `screenshots/` directory
- [ ] README.md updated (if manual update needed)

## Example Screenshot Session

1. Start local server: `python -m http.server 8000`
2. Open `http://localhost:8000/index_new.html`
3. Open DevTools Console (F12)
4. Capture menu screenshot (#1)
5. Click "START GAME"
6. Wait for game to load
7. Capture gameplay screenshot (#2)
8. Aim and fire weapon
9. Capture firing screenshot (#3)
10. Wait for explosion
11. Capture explosion screenshot (#4)
12. Continue for remaining screenshots
13. Move all PNGs to `screenshots/` directory
14. Verify in README

## Notes

- Screenshots show **Version 2.0** (`index_new.html`) with energy-based gameplay
- Capture HUD elements clearly (energy/heat bars are key features)
- Show weapon costs and heat generation in weapon panel
- Demonstrate environmental hazards (gas/ion/EMP)
- Multiple angles/perspectives can be useful

---

**After capturing screenshots, commit them:**
```bash
git add screenshots/
git commit -m "Add gameplay screenshots for README"
git push origin [branch-name]
```
