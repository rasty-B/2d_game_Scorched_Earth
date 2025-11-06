# Integration Roadmap: 2D to 2.5D Upgrade

**Status:** Planning Phase
**Target:** Transition from 2D Canvas artillery game to 2.5D Hover Tank game
**Timeline:** TBD (Phased approach recommended)

This document provides a comprehensive roadmap for integrating the new specifications ([HOVER_TANK_SPEC.md](HOVER_TANK_SPEC.md) and [PHYSICS_GAMEPLAY_SPEC.md](PHYSICS_GAMEPLAY_SPEC.md)) with the existing codebase.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Target State](#target-state)
3. [Gap Analysis](#gap-analysis)
4. [Migration Strategy](#migration-strategy)
5. [Implementation Phases](#implementation-phases)
6. [Compatibility Considerations](#compatibility-considerations)
7. [Risk Assessment](#risk-assessment)
8. [Decision Points](#decision-points)

---

## Current State Analysis

### Existing Architecture

```
Current Game (2D Canvas)
├── src/
│   ├── main.js           - Entry point
│   ├── game.js           - Game loop, Tank class, state management
│   ├── physics.js        - Projectile class, basic ballistics
│   ├── renderer.js       - Canvas 2D drawing
│   ├── terrain.js        - Heightfield terrain with deformation
│   ├── weapons.js        - Weapon definitions
│   ├── stages.js         - Planet/stage configurations
│   ├── ai.js             - AI opponent logic
│   ├── ui.js             - HUD and menu management
│   └── graphics/         - Enhanced graphics (NEW)
│       ├── gfx_common.js
│       ├── terrain_patterns.js
│       ├── particles.js
│       └── tank_graphics.js
```

### Current Features

**✅ Working Well:**
- Turn-based gameplay loop
- Mouse-driven aiming with trajectory preview
- Tank class with HP, position, angle
- Projectile physics (gravity, wind, drag)
- Terrain collision and deformation
- Multiple weapons (4 types)
- AI opponents (3 difficulty levels)
- Stage-specific physics (gravity, wind ranges)
- Enhanced 2D graphics with particles
- Clean UI/HUD

**⚠️ Current Limitations:**
- 2D Canvas rendering only (no 3D capability)
- Simple circle+line tank graphics
- No hover mechanics (tanks sit on terrain)
- No step-based movement system
- Physics not fully modular/data-driven
- No weapon cooldown system
- Fixed timestep not implemented
- Limited extensibility

### Technology Stack

- **Rendering:** HTML5 Canvas 2D
- **Language:** JavaScript ES6+ (vanilla, no frameworks)
- **Architecture:** Object-oriented with module imports
- **Physics:** Custom 2D ballistics

---

## Target State

### Target Architecture (from Specifications)

```
Target Game (2.5D with 3D Rendering)
├── src/
│   ├── physics/
│   │   ├── ruleset_terran.js      - Data-driven config
│   │   ├── physics_world.js       - Fixed-timestep engine
│   │   ├── projectile.js          - Projectile state/behavior
│   │   ├── terrain_interface.js   - Terrain abstraction
│   │   └── collision.js           - Collision utilities
│   ├── entities/
│   │   ├── hover_tank.js          - HoverTank class
│   │   └── tank_controller.js     - Input handling
│   ├── game/
│   │   ├── turn_controller.js     - Turn-based flow
│   │   └── game_state.js          - State manager
│   ├── rendering/
│   │   ├── three_renderer.js      - Three.js 2.5D renderer
│   │   ├── tank_model_loader.js   - .glb model loading
│   │   ├── effects.js             - Particle/VFX
│   │   └── camera_controller.js   - 2.5D camera
│   └── utils/
│       ├── math.js
│       └── constants.js
```

### Target Features

**🎯 New Features:**
- 3D hover tank models (.glb format)
- 2.5D rendering (Three.js with side-view camera)
- Hover mechanics (tanks float above terrain)
- Step-based movement per turn
- Weapon cooldown system
- Fixed timestep physics (deterministic)
- Fully data-driven weapon/config system
- Modular behavior system (cluster, homing, area fields)
- Enhanced visual effects (emissive bloom, shadows)

**🔄 Upgraded Features:**
- Physics engine (deterministic, fixed timestep)
- Tank representation (3D model vs 2D circle)
- Weapon system (cooldowns, behaviors)
- Terrain interface (abstracted)

---

## Gap Analysis

### What Exists vs. What's Needed

| Feature | Current State | Target State | Gap |
|---------|---------------|--------------|-----|
| **Rendering** | Canvas 2D | Three.js 3D/2.5D | **LARGE** - Need Three.js integration |
| **Tank Representation** | Tank class (circle) | HoverTank class (3D model) | **MEDIUM** - Rewrite tank entity |
| **Tank Graphics** | 2D procedural | 3D .glb model | **LARGE** - Need 3D model asset |
| **Physics Engine** | Projectile class | PhysicsWorld class | **MEDIUM** - Refactor physics |
| **Timestep** | Variable (dt) | Fixed (60Hz) | **SMALL** - Add accumulator |
| **Weapons** | weapons.js | ruleset_terran.js | **SMALL** - Migrate data structure |
| **Weapon Behaviors** | Limited (cluster, homing) | Extensible (ballistic, cluster, homing, areaField) | **MEDIUM** - Expand behavior system |
| **Weapon Cooldowns** | None | Per-weapon cooldowns | **SMALL** - Add cooldown tracking |
| **Terrain** | Terrain class | ITerrainProvider interface | **SMALL** - Wrap existing terrain |
| **Turn Control** | Game class | TurnController class | **MEDIUM** - Refactor game loop |
| **Movement** | None | Step-based movement | **MEDIUM** - Add movement system |
| **Hover Mechanics** | Tanks on terrain | Tanks float above terrain | **SMALL** - Adjust positioning |
| **Config System** | Hardcoded values | Data-driven ruleset | **MEDIUM** - Extract all tunables |
| **Determinism** | No | Yes (fixed timestep) | **MEDIUM** - Ensure deterministic |

### Technology Gaps

| Technology | Current | Target | Action Required |
|------------|---------|--------|-----------------|
| Rendering Library | None (Canvas 2D) | Three.js | **Install** `three.js` via npm or CDN |
| 3D Model Loader | N/A | GLTFLoader | **Include** Three.js examples loader |
| Post-Processing | N/A | EffectComposer, BloomPass | **Include** Three.js post-processing |
| 3D Assets | None | Hover Tank .glb model | **Commission** or **create** 3D model |
| Build System | None | Optional (for bundling) | **Consider** Vite or Webpack |

---

## Migration Strategy

### Approach Options

#### Option A: Big Bang Migration (Not Recommended)
**Description:** Rewrite entire game to match specifications in one go.

**Pros:**
- Clean start
- No legacy code

**Cons:**
- ⛔ High risk of breaking existing game
- ⛔ Long development time with no playable version
- ⛔ Difficult to test incrementally

**Verdict:** ❌ **Not Recommended**

---

#### Option B: Phased Migration (Recommended)
**Description:** Incrementally upgrade components while maintaining playable game.

**Pros:**
- ✅ Low risk - game always playable
- ✅ Incremental testing
- ✅ Can pause/pivot at any phase
- ✅ Parallel development of 2D and 2.5D versions

**Cons:**
- Longer timeline
- Temporary duplication of code

**Verdict:** ✅ **Recommended**

---

#### Option C: Parallel Development
**Description:** Create new 2.5D version alongside existing 2D game.

**Pros:**
- ✅ No risk to existing game
- ✅ Can compare both versions
- ✅ Easier A/B testing

**Cons:**
- Duplicate maintenance effort
- Harder to port fixes between versions

**Verdict:** ⚠️ **Consider if 2D version must remain production-ready**

---

### Recommended Strategy: **Phased Migration (Option B)**

Incrementally upgrade the game while maintaining playability at each step.

---

## Implementation Phases

### Phase 0: Preparation (Current Phase)

**Goals:**
- Create specification documents ✅
- Analyze existing codebase ✅
- Plan migration strategy ✅
- Set up development environment

**Tasks:**
- [x] Write HOVER_TANK_SPEC.md
- [x] Write PHYSICS_GAMEPLAY_SPEC.md
- [x] Write INTEGRATION_ROADMAP.md
- [ ] Decide on rendering approach (2D vs 2.5D)
- [ ] Set up Three.js if going 2.5D
- [ ] Commission or create hover tank 3D model

**Deliverable:** Specifications and roadmap (this document)

---

### Phase 1: Physics Refactor (2D Compatible)

**Goal:** Upgrade physics engine to spec without changing rendering.

**Duration:** 1-2 weeks

**Tasks:**

1. **Create Config System**
   - Create `src/physics/ruleset_terran.js`
   - Migrate all hardcoded values (gravity, weapon stats, etc.)
   - Test: Verify existing weapons work with new config

2. **Implement Fixed Timestep**
   - Add accumulator to game loop
   - Implement `WORLD_CONFIG.fixedTimestep` (1/60 sec)
   - Test: Verify deterministic behavior (same inputs = same outputs)

3. **Refactor Physics to PhysicsWorld**
   - Create `src/physics/physics_world.js` class
   - Migrate `Projectile` class to `ProjectileState`
   - Implement fixed-timestep update loop
   - Test: Verify projectiles behave identically to before

4. **Create Terrain Interface**
   - Create `src/physics/terrain_interface.js`
   - Wrap existing `Terrain` class with `ITerrainProvider`
   - Test: Verify terrain collision still works

5. **Expand Weapon Behaviors**
   - Implement behavior system in `PhysicsWorld`
   - Add `areaField` behavior (plasma arc lingering damage)
   - Test: Verify cluster and homing still work

**Deliverables:**
- Fully modular, data-driven physics engine
- Fixed timestep (deterministic)
- **Game still renders in 2D Canvas** (no visual changes yet)

**Risk:** Low (physics logic only, no rendering changes)

---

### Phase 2: Tank Entity Refactor

**Goal:** Upgrade Tank to HoverTank with hover mechanics and movement.

**Duration:** 1 week

**Tasks:**

1. **Create HoverTank Class**
   - Create `src/entities/hover_tank.js`
   - Implement hover offset above terrain
   - Implement step-based movement
   - Implement weapon cooldowns
   - Test: Verify hover positioning works

2. **Migrate Tank to HoverTank**
   - Replace `Tank` class usage with `HoverTank`
   - Update game loop to use `HoverTank`
   - Test: Verify existing gameplay works

3. **Add Movement System**
   - Implement `tryStep(direction)` with slope checking
   - Add movement input handling (arrow keys or buttons)
   - Add "steps remaining" UI indicator
   - Test: Verify movement constrained by max steps per turn

4. **Add Cooldown System**
   - Implement `tickCooldowns()` per turn
   - Update UI to show weapon cooldowns
   - Test: Verify cooldowns prevent rapid weapon use

**Deliverables:**
- HoverTank entity with hover mechanics
- Step-based movement system
- Weapon cooldowns
- **Game still renders in 2D Canvas**

**Risk:** Low (entity logic only, still 2D rendering)

---

### Phase 3: Turn Controller Refactor

**Goal:** Extract turn logic into TurnController for cleaner architecture.

**Duration:** 3-5 days

**Tasks:**

1. **Create TurnController**
   - Create `src/game/turn_controller.js`
   - Migrate turn logic from `Game` class
   - Implement `handleFire()`, `handleMove()`, input methods
   - Test: Verify turn flow works identically

2. **Refactor Game Class**
   - `Game` class becomes orchestrator/coordinator
   - `Game` delegates to `TurnController` for gameplay
   - Test: Verify game loop unchanged

3. **Cleanup**
   - Remove duplicate code
   - Improve separation of concerns

**Deliverables:**
- Cleaner architecture
- TurnController handles game flow
- **Game still renders in 2D Canvas**

**Risk:** Very Low (code organization only)

---

### Phase 4: Rendering Decision Point 🚧

**CRITICAL DECISION:** Choose rendering path forward.

#### Path A: Stay with Enhanced 2D Canvas

**If choosing this path:**
- Keep existing Canvas 2D renderer
- Enhance tank graphics with enhanced `tank_graphics.js`
- Skip 3D model integration
- Continue with Phase 5A (2D Polish)

**Pros:**
- ✅ Fast load times
- ✅ Works everywhere
- ✅ No 3D modeling required
- ✅ Lower complexity

**Cons:**
- ❌ Limited visual fidelity
- ❌ No true 2.5D perspective
- ❌ Can't use hover tank 3D model spec

---

#### Path B: Upgrade to Three.js 2.5D

**If choosing this path:**
- Integrate Three.js for rendering
- Create 3D hover tank model per spec
- Continue with Phase 5B (3D Integration)

**Pros:**
- ✅ Modern 2.5D visuals
- ✅ Emissive bloom, shadows
- ✅ Professional polish
- ✅ Follows hover tank spec

**Cons:**
- ⚠️ Requires 3D modeling work
- ⚠️ Larger file size (Three.js ~600KB)
- ⚠️ More complex rendering code

---

### Recommendation for Rendering Decision

**Consider:**
1. **Target Audience** - Casual web players? Stay 2D. Serious gamers? Go 2.5D.
2. **Development Resources** - Can you create or commission 3D models?
3. **Performance Requirements** - Mobile support critical? Stay 2D.
4. **Visual Goals** - Want modern AAA look? Go 2.5D.

**My Recommendation:**
- **If unsure:** Complete Phases 1-3 first (physics/entity refactor) with 2D rendering
- **Then:** Try a quick Three.js prototype in parallel
- **Then:** Make informed decision based on prototype

This allows you to:
- Get benefits of improved physics/architecture regardless of rendering choice
- Evaluate 2.5D rendering with minimal risk
- Keep 2D version as fallback

---

### Phase 5A: 2D Polish (If staying 2D)

**Goal:** Maximize 2D visual quality with existing graphics system.

**Duration:** 1 week

**Tasks:**

1. **Enhanced Tank Graphics**
   - Use existing `tank_graphics.js` for detailed tank rendering
   - Add hover pad glow effects
   - Add movement animations

2. **Improved Effects**
   - Enhanced explosions with shockwaves
   - Better particle variety (stage-specific)
   - Muzzle flashes on firing

3. **UI/UX Polish**
   - Animate UI transitions
   - Add weapon preview icons
   - Improve feedback (sounds, screen shake)

**Deliverables:**
- Professional-quality 2D game
- Enhanced visual feedback

**Risk:** Very Low

---

### Phase 5B: Three.js Integration (If going 2.5D)

**Goal:** Replace Canvas 2D renderer with Three.js 2.5D renderer.

**Duration:** 2-3 weeks

**Tasks:**

1. **Set Up Three.js**
   - Install Three.js (npm or CDN)
   - Create `src/rendering/three_renderer.js`
   - Set up scene, camera, renderer
   - Implement side-view camera (2.5D perspective)
   - Test: Render simple box

2. **Integrate Terrain**
   - Convert heightfield terrain to Three.js geometry
   - Apply terrain textures from `terrain_patterns.js`
   - Add lighting
   - Test: Render terrain

3. **Create Placeholder Tank**
   - Use Three.js primitives (boxes, cylinders)
   - Position tanks in 3D space
   - Test: Render tanks on terrain

4. **Integrate 3D Tank Model**
   - Load hover tank .glb model per spec
   - Configure materials (PBR, emissive)
   - Set up turret/barrel rotation
   - Test: Render detailed hover tank

5. **Add Post-Processing**
   - Implement bloom for emissive glow
   - Add shadows
   - Test: Verify bloom on hover pads

6. **Migrate VFX to Three.js**
   - Convert particle system to Three.js particles
   - Convert explosions to 3D effects
   - Test: Verify all effects work

7. **Parallel Rendering Mode (Optional)**
   - Support both 2D and 3D rendering
   - Add toggle in settings
   - Use adapter pattern

**Deliverables:**
- Fully functional Three.js 2.5D renderer
- 3D hover tank model integrated
- Bloom and effects working
- **Game now renders in 2.5D**

**Risk:** Medium-High (significant rendering changes)

**Mitigation:**
- Keep 2D renderer as backup
- Implement in separate branch
- Test thoroughly before merging

---

### Phase 6: Final Polish & Launch

**Goal:** Finish all features, optimize, and launch.

**Duration:** 1-2 weeks

**Tasks:**

1. **Content**
   - Add more weapons (if desired)
   - Add more stages
   - Balance gameplay

2. **Optimization**
   - Profile performance
   - Optimize rendering (LOD, culling if 3D)
   - Optimize physics

3. **Audio**
   - Add sound effects
   - Add background music

4. **Testing**
   - Cross-browser testing
   - Mobile testing (if supported)
   - Playtesting and balance

5. **Documentation**
   - Update README
   - Create player guide
   - Document code

6. **Deployment**
   - Deploy to hosting (GitHub Pages, Netlify, etc.)
   - Share with players

**Deliverables:**
- Complete, polished game
- Deployed and playable

---

## Compatibility Considerations

### Maintaining Backward Compatibility

If you want to keep both 2D and 2.5D versions:

**Strategy: Renderer Abstraction**

Create a renderer interface:

```javascript
// src/rendering/renderer_interface.js
export class IRenderer {
    drawTerrain(terrain, stage) {}
    drawTank(tank, isActive) {}
    drawProjectile(projectile) {}
    drawExplosion(explosion) {}
    updateParticles(dt) {}
    clear() {}
}

// Implementations:
// - Canvas2DRenderer (existing)
// - ThreeJSRenderer (new)
```

**Benefits:**
- Game logic doesn't care about rendering
- Easy to switch renderers
- Can compare performance/quality

**Drawbacks:**
- More abstraction overhead
- Maintain two renderers

---

## Risk Assessment

### High-Risk Areas

1. **Three.js Integration** (If going 2.5D)
   - **Risk:** Breaking existing rendering
   - **Mitigation:** Parallel development, feature flags

2. **3D Model Creation**
   - **Risk:** Model doesn't meet spec or has issues
   - **Mitigation:** Use placeholder model first, test early

3. **Physics Determinism**
   - **Risk:** Floating point inconsistencies
   - **Mitigation:** Extensive testing, fixed timestep

### Medium-Risk Areas

1. **HoverTank Refactor**
   - **Risk:** Breaking existing tank behavior
   - **Mitigation:** Comprehensive unit tests

2. **Weapon Behavior Expansion**
   - **Risk:** Breaking existing weapons
   - **Mitigation:** Test each weapon after refactor

### Low-Risk Areas

1. **Config System**
   - Easy to verify, no logic changes

2. **TurnController Refactor**
   - Code organization only

3. **2D Graphics Enhancements**
   - Already implemented and tested

---

## Decision Points

### Key Questions to Answer

1. **Rendering: 2D or 2.5D?**
   - **When:** Before Phase 4
   - **Impact:** Large (determines Phase 5 path)
   - **Recommendation:** Try 2.5D prototype, evaluate

2. **3D Model: Create in-house or commission?**
   - **When:** If going 2.5D, before Phase 5B
   - **Impact:** Medium (affects timeline)
   - **Options:**
     - Commission from 3D artist (~$200-500)
     - Create in Blender (free, requires skill)
     - Use asset store model (cheap, may not match spec)

3. **Parallel Rendering: Support both 2D and 3D?**
   - **When:** During Phase 5B
   - **Impact:** Medium (more code to maintain)
   - **Recommendation:** Only if needed for A/B testing

4. **Build System: Add Vite/Webpack?**
   - **When:** Before Phase 5B (if going 3D)
   - **Impact:** Low-Medium (dev workflow)
   - **Recommendation:** Add if Three.js tree-shaking needed

---

## Next Steps

### Immediate Actions

1. **Review** this roadmap with team/stakeholders
2. **Decide** on rendering approach (2D vs 2.5D)
3. **Set** timeline and milestones
4. **Begin** Phase 1: Physics Refactor

### Phase 1 Kickoff Checklist

- [ ] Create `src/physics/` directory
- [ ] Create `src/physics/ruleset_terran.js`
- [ ] Start migrating weapon definitions
- [ ] Implement fixed timestep in game loop
- [ ] Write tests for deterministic physics

---

## Timeline Estimate

### Conservative Estimate (Phased, 2.5D)

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 0: Preparation | 1 week | 1 week |
| Phase 1: Physics Refactor | 2 weeks | 3 weeks |
| Phase 2: Tank Entity | 1 week | 4 weeks |
| Phase 3: Turn Controller | 1 week | 5 weeks |
| Phase 4: Decision Point | 1 week | 6 weeks |
| Phase 5B: Three.js | 3 weeks | 9 weeks |
| Phase 6: Polish | 2 weeks | 11 weeks |

**Total:** ~11 weeks (2.5-3 months) for full 2.5D upgrade

### Aggressive Estimate (Phased, 2.5D)

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 0: Preparation | 3 days | 3 days |
| Phase 1: Physics Refactor | 1 week | 10 days |
| Phase 2: Tank Entity | 5 days | 15 days |
| Phase 3: Turn Controller | 3 days | 18 days |
| Phase 4: Decision Point | 2 days | 20 days |
| Phase 5B: Three.js | 2 weeks | 34 days |
| Phase 6: Polish | 1 week | 41 days |

**Total:** ~6 weeks (1.5 months) for full 2.5D upgrade

### If Staying 2D

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 0-3 | 5 weeks | 5 weeks |
| Phase 5A: 2D Polish | 1 week | 6 weeks |
| Phase 6: Polish | 1 week | 7 weeks |

**Total:** ~7 weeks (1.5-2 months) for enhanced 2D

---

## Conclusion

This roadmap provides a clear path from the current 2D Canvas game to either:
- **Enhanced 2D** with professional graphics (lower risk, faster)
- **Modern 2.5D** with Three.js and 3D models (higher quality, more work)

The phased approach ensures the game remains playable at every step, reducing risk and allowing for course correction.

**Recommended Next Steps:**
1. Complete Phase 1 (Physics Refactor) with 2D rendering
2. Evaluate 2.5D rendering in parallel
3. Make informed rendering decision
4. Continue with chosen path

The specifications provide a solid foundation for a modern, extensible artillery game. Choose the path that best fits your resources, timeline, and vision.

---

**Version History**

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-06 | Initial integration roadmap |

---

**End of Roadmap**
