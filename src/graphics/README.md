# Graphics Module

Enhanced graphics system for the artillery game, providing procedural textures, particle effects, and detailed rendering.

## Module Structure

### `gfx_common.js`
Common utility functions for graphics operations:
- `lightenColor(color, percent)` - Lighten a hex color
- `darkenColor(color, percent)` - Darken a hex color
- `hexToRGBA(hex, alpha)` - Convert hex to RGBA
- `randomRange(min, max)` - Random number in range
- `randomInt(min, max)` - Random integer in range

### `terrain_patterns.js`
Procedural terrain texture generation:
- `createTerrainPattern(stageName)` - Generate terrain pattern for a stage
- `getCachedTerrainPattern(stageName)` - Get cached pattern (recommended)
- `clearPatternCache()` - Clear pattern cache

**Supported Terrain Types:**
- `rock` - Luna Crater, Gas Giant Rim
- `sand` - Red Frontier
- `ice` - Ice Moon
- `lava` - Magma Core

### `particles.js`
Enhanced particle system with fire, smoke, and debris:

**Particle Spawning:**
- `spawnExplosionParticles(x, y, power)` - Explosion with fire/smoke/debris
- `spawnImpactParticles(x, y, terrainColor)` - Terrain impact dust
- `spawnTrailParticles(x, y, color, type)` - Projectile trail

**Particle Types:**
- `fire` - Fast moving, short lived, glowing
- `smoke` - Slow, drifts upward, expands
- `debris` - Chunky, affected by gravity, rotates
- `energy` - Glowing energy particles

**Particle Manager:**
```javascript
const particleManager = new ParticleManager();
particleManager.addParticles(particles);
particleManager.update(dt, gravity);
particleManager.render(ctx);
```

### `tank_graphics.js`
Enhanced tank rendering with detail and effects:

**Functions:**
- `drawEnhancedTank(ctx, tank, isActive)` - Draw detailed tank
- `drawMuzzleFlash(ctx, x, y, angle, size, alpha)` - Muzzle flash effect

**Tank Features:**
- Metallic gradient shading
- Tank treads with wheels
- Shadow beneath tank
- Detailed barrel with highlights
- Enhanced HP bar with gradient
- Pulsing active indicator

## Usage Examples

### Basic Integration

```javascript
import { getCachedTerrainPattern } from './graphics/terrain_patterns.js';
import { drawEnhancedTank } from './graphics/tank_graphics.js';
import { ParticleManager, spawnExplosionParticles } from './graphics/particles.js';

// Initialize
const particleManager = new ParticleManager();

// Draw terrain with texture
const pattern = getCachedTerrainPattern('lunaCrater');
ctx.fillStyle = pattern;
// ... draw terrain polygon

// Draw tank
drawEnhancedTank(ctx, tank, isActive);

// Add explosion
const particles = spawnExplosionParticles(x, y, 1.5);
particleManager.addParticles(particles);

// Update and render
particleManager.update(deltaTime, gravity);
particleManager.render(ctx);
```

### Renderer Integration

The `Renderer` class automatically uses all enhanced graphics:

```javascript
// Renderer handles everything automatically
renderer.drawTerrain(terrain, stage);  // Uses textured terrain
renderer.drawTank(tank, isActive);     // Uses enhanced tank graphics
renderer.addExplosionParticles(x, y, power); // Uses particle system
renderer.updateParticles(dt);          // Updates and renders particles
```

## Performance Notes

- Terrain patterns are cached per stage (only generated once)
- Particle system uses object pooling for efficiency
- Particle count scales with explosion power
- Old particles are automatically removed when dead

## Customization

### Adding New Terrain Types

Edit `terrain_patterns.js` and add a new texture function:

```javascript
function addMyTerrainTexture(ctx, size) {
    // Your custom texture code
}
```

### Adding New Particle Types

Edit `particles.js` and add to the `drawParticle` function:

```javascript
else if (particle.type === "myType") {
    // Your custom particle rendering
}
```

### Customizing Tank Graphics

Edit `tank_graphics.js` functions to modify tank appearance:
- `drawTankBody()` - Main tank shape
- `drawTankTreads()` - Base/wheels
- `drawTankBarrel()` - Gun barrel
- `drawActiveIndicator()` - Selection ring

## Technical Details

- All graphics use Canvas 2D API (no WebGL)
- Texture patterns are 64x64 offscreen canvases
- Particles use composite operations for blending
- Colors use RGBA for transparency
- Gradients provide depth and shading

## Future Enhancements

Potential additions:
- Weather effects (rain, snow, sandstorm)
- Animated backgrounds (moving planets, asteroids)
- Power-up visual indicators
- Damage decals on terrain
- Tank customization options
- Trail effects for different weapon types
