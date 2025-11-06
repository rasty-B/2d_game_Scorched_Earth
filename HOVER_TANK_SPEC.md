# Hover Tank Asset & Integration Spec

**Version:** 1.0
**Target Game:** Modern 2.5D Artillery Game (Scorched Earth Evolution)
**Primary Unit:** Hover Tank

This document defines the visual and technical specification for the game's primary unit. It serves as the **single source of truth** for creating game-ready tank models and integrating them into the rendering engine.

---

## Table of Contents

1. [Overview](#overview)
2. [Asset Format & Technical Requirements](#asset-format--technical-requirements)
3. [Scale & Coordinate System](#scale--coordinate-system)
4. [Model Structure & Pivots](#model-structure--pivots)
5. [Material Specification](#material-specification)
6. [Texture Maps](#texture-maps)
7. [Animations](#animations)
8. [Integration Guidelines](#integration-guidelines)
9. [Visual Style Guide](#visual-style-guide)
10. [Quality Checklist](#quality-checklist)

---

## Overview

The **Hover Tank** is a futuristic military vehicle that hovers above terrain using anti-gravity technology. It features:

- Sleek, angular design with sci-fi military aesthetic
- Visible hover pads with cyan/teal emissive glow
- Rotating turret with recoil-capable barrel
- Conduits, sensors, and technical details
- Dark gunmetal base with accent lighting

**Design Philosophy:** Functional military hardware meets near-future technology. Think "Halo Scorpion meets Modern Tank" with hover propulsion.

---

## Asset Format & Technical Requirements

### File Format
- **Format:** `.glb` (Binary glTF 2.0)
- **Reason:** Universal format, efficient binary encoding, embedded textures, animation support

### Polygon Budget
- **Target Triangle Count:** 20,000 - 30,000 tris
- **LOD0 (High Detail):** 25,000 - 30,000 tris
- **LOD1 (Medium Detail - Optional):** 12,000 - 15,000 tris
- **LOD2 (Low Detail - Optional):** 5,000 - 8,000 tris

### Material Count
- **Single PBR Material** per tank (recommended)
- Use texture atlasing for efficiency
- Separate material for emissive effects (optional)

### File Size Target
- **Model + Textures:** < 5MB total
- **Compressed textures:** Use .jpg for baseColor (quality 85%), .png for alpha channels

---

## Scale & Coordinate System

### Unit Scale
- **1 Unit = 1 Meter** in world space
- **Tank dimensions:**
  - Length: ~4.5 - 5.5m (including barrel)
  - Width: ~2.5 - 3.0m
  - Height: ~2.0 - 2.5m (including turret)
  - Hover height: 0.3 - 0.5m above terrain

### Coordinate System
- **Forward:** +Z axis (barrel points forward)
- **Right:** +X axis
- **Up:** +Y axis
- **Turret rotation:** Around Y axis (yaw)
- **Barrel elevation:** Around local X axis (pitch)

### Orientation
- Tank should face **+Z direction** by default
- Origin at center of hover mechanism (see pivot details below)

---

## Model Structure & Pivots

The model should be organized into separate meshes for animation control:

### Hierarchy
```
HoverTank_Root (origin at hover center)
├── Tank_Body (hull, hover pads, base structure)
│   ├── HoverPad_FrontLeft
│   ├── HoverPad_FrontRight
│   ├── HoverPad_RearLeft
│   ├── HoverPad_RearRight
│   └── Body_Details (sensors, conduits, panels)
├── Turret_Base (pivot at turret ring center)
│   ├── Turret_Housing
│   ├── Barrel (pivot at barrel mount point)
│   │   └── Barrel_Muzzle
│   └── Turret_Details (optics, sensors)
└── Effects (optional particle spawn points)
    ├── MuzzleFlash_Point
    ├── Exhaust_Point_Left
    └── Exhaust_Point_Right
```

### Pivot Points

#### Root Pivot (HoverTank_Root)
- **Position:** Center of hover mechanism, approximately at geometric center of tank hull
- **Height:** 0.3 - 0.5m above ground plane
- **Purpose:** Tank's world position, entire tank transforms around this point

#### Turret Pivot (Turret_Base)
- **Position:** Center of turret ring on hull top surface
- **Rotation:** Y-axis rotation only (360° yaw)
- **Purpose:** Turret rotation independent of hull

#### Barrel Pivot (Barrel)
- **Position:** Barrel mount point on turret housing
- **Rotation:** X-axis rotation only (-15° to +75° elevation typical)
- **Purpose:** Barrel elevation for aiming

### Important Notes
- All pivots must be **properly centered** and **aligned to axes**
- Turret should rotate smoothly without clipping through hull
- Barrel recoil should slide along barrel's local Z-axis
- Hover pads can have individual pivots for subtle animation (optional)

---

## Material Specification

### PBR Workflow
Using **Metallic-Roughness** PBR workflow (glTF 2.0 standard)

### Base Material Properties

#### Primary Surface (Tank Hull & Turret)
- **Base Color:** Dark gunmetal gray (#2B3033 to #3C4449)
- **Metallic:** 0.7 - 0.9 (metallic armor plating)
- **Roughness:** 0.4 - 0.6 (worn military metal)
- **Normal Intensity:** 0.8 - 1.2 (panel lines, rivets, wear)

#### Accent Surfaces (Technical Details)
- **Base Color:** Darker gray (#1A1D20)
- **Metallic:** 0.3 - 0.5 (matte technical components)
- **Roughness:** 0.6 - 0.8 (non-reflective)

#### Emissive Areas (Hover Pads, Conduits, Sensors)
- **Emissive Color:** Cyan/Teal (#00D4FF to #00FFC8)
- **Emissive Intensity:** 1.5 - 3.0 (HDR emission for bloom)
- **Glow Pattern:** Pulsing/breathing effect (animated via code)

### Material Breakdown by Component

| Component | Base Color | Metallic | Roughness | Emissive |
|-----------|------------|----------|-----------|----------|
| Hull Armor | #2B3033 | 0.8 | 0.5 | None |
| Turret Housing | #3C4449 | 0.9 | 0.4 | None |
| Barrel | #3C4449 | 0.9 | 0.3 | None |
| Hover Pads (Rim) | #1A1D20 | 0.4 | 0.7 | None |
| Hover Pads (Core) | #001820 | 0.1 | 0.9 | #00D4FF (2.0) |
| Energy Conduits | #0D1214 | 0.2 | 0.8 | #00FFC8 (1.5) |
| Sensors/Optics | #1A1D20 | 0.3 | 0.6 | #00B8D4 (1.2) |

---

## Texture Maps

### Required Texture Maps (2K resolution recommended)

#### 1. Base Color Map (2048x2048, RGB)
- **Format:** .jpg (quality 85%) or .png
- **Content:**
  - Main hull color (gunmetal grays)
  - Panel variations and color detail
  - Dirt, wear, scratches (subtle)
  - Decals, markings, numbers (optional)
- **Color Space:** sRGB

#### 2. Normal Map (2048x2048, RGB)
- **Format:** .png (tangent-space normals)
- **Content:**
  - Panel lines and seams
  - Rivets, bolts, fasteners
  - Surface wear and dents
  - Technical details (vents, grilles)
- **Intensity:** 0.8 - 1.2 (adjustable in engine)
- **Color Space:** Linear

#### 3. Metallic-Roughness Map (2048x2048, RG or RGB)
- **Format:** .png
- **Channel Packing:**
  - **Green Channel:** Roughness (0 = smooth, 1 = rough)
  - **Blue Channel:** Metallic (0 = dielectric, 1 = metal)
- **Content:**
  - Metallic areas: armor plates, barrel
  - Rough areas: matte components, worn edges
  - Variation for realism (avoid uniform values)
- **Color Space:** Linear

#### 4. Emissive Map (2048x2048, RGB)
- **Format:** .png
- **Content:**
  - Hover pad glow (cyan/teal circles)
  - Energy conduit lines
  - Sensor lights
  - Status indicators
- **HDR Values:** Can exceed 1.0 for bloom (multiply by intensity)
- **Color Space:** sRGB

#### 5. Ambient Occlusion (AO) Map (Optional, 2048x2048, Grayscale)
- **Format:** .jpg or .png
- **Content:** Cavity shadows, contact shadows
- **Note:** Can be baked into Base Color if needed

### Texture Atlas Layout
If using a single material, organize UV space efficiently:
- Main hull: 40-50% of texture
- Turret: 25-30%
- Barrel: 10-15%
- Details (pads, conduits): 15-20%

---

## Animations

### Placeholder Animations (Embedded in .glb)

#### 1. Turret Rotation (Looping, 2 seconds)
- **Animation:** Turret rotates 360° around Y-axis
- **Duration:** 2.0 seconds
- **Easing:** Linear
- **Purpose:** Testing turret articulation
- **Note:** In-game, this will be driven by gameplay code, not the animation

#### 2. Barrel Recoil (One-shot, 0.5 seconds)
- **Animation:**
  - Barrel slides back along local -Z axis (0.15 - 0.25m)
  - Returns to original position with damping
- **Duration:** 0.5 seconds total
  - Recoil: 0.1s (fast)
  - Return: 0.4s (slower, with ease-out)
- **Easing:** Ease-out for return
- **Purpose:** Firing feedback animation

#### 3. Hover Bob (Looping, 3 seconds)
- **Animation:**
  - Entire tank (root) moves up/down along Y-axis
  - Subtle movement: ±0.05 - 0.10m
  - Optional: slight rotation wobble (±1-2°)
- **Duration:** 3.0 seconds
- **Easing:** Sine wave (smooth oscillation)
- **Purpose:** Idle floating animation

#### 4. Hover Pad Glow (Looping, 2 seconds)
- **Animation:**
  - Emissive intensity pulses from 1.5 to 3.0
  - All pads in sync or slight phase offset
- **Duration:** 2.0 seconds
- **Easing:** Sine wave
- **Purpose:** Living vehicle effect
- **Note:** Can be done via shader/material animation instead

### Animation Export Notes
- Use glTF animation format
- Name animations clearly: `TurretRotate`, `BarrelRecoil`, `HoverBob`, `HoverGlow`
- Ensure animations don't break model hierarchy
- Test in glTF viewer before engine integration

---

## Integration Guidelines

### Three.js Integration

#### Loading the Model
```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('assets/models/hover_tank.glb', (gltf) => {
    const tank = gltf.scene;

    // Find important nodes
    const turret = tank.getObjectByName('Turret_Base');
    const barrel = tank.getObjectByName('Barrel');

    // Set up for rendering
    tank.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    scene.add(tank);
});
```

#### Material Enhancements
```javascript
// Enhance emissive for bloom
tank.traverse((child) => {
    if (child.isMesh && child.material) {
        const material = child.material;

        // Enable emissive bloom
        if (material.emissive) {
            material.emissiveIntensity = 2.0;
        }

        // Adjust normal map strength
        if (material.normalMap) {
            material.normalScale.set(1.0, 1.0);
        }
    }
});
```

#### Turret Control
```javascript
// Aim turret at target
function aimTurret(tank, targetAngleDegrees) {
    const turret = tank.getObjectByName('Turret_Base');
    const targetAngleRad = THREE.MathUtils.degToRad(targetAngleDegrees);
    turret.rotation.y = targetAngleRad;
}

// Elevate barrel
function elevateBarrel(tank, elevationDegrees) {
    const barrel = tank.getObjectByName('Barrel');
    const elevationRad = THREE.MathUtils.degToRad(elevationDegrees);
    barrel.rotation.x = THREE.MathUtils.clamp(elevationRad,
        THREE.MathUtils.degToRad(-15),
        THREE.MathUtils.degToRad(75)
    );
}
```

#### Animations
```javascript
// Play hover bob animation
const mixer = new THREE.AnimationMixer(tank);
const hoverBob = gltf.animations.find(a => a.name === 'HoverBob');
if (hoverBob) {
    const action = mixer.clipAction(hoverBob);
    action.play();
}

// Update in game loop
function animate(deltaTime) {
    mixer.update(deltaTime);
}
```

#### Bloom for Emissive
```javascript
// Three.js Bloom Pass
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const composer = new EffectComposer(renderer);
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,  // Bloom strength
    0.4,  // Bloom radius
    0.85  // Bloom threshold
);
composer.addPass(bloomPass);
```

---

### Unity WebGL Integration

#### Importing the Model
1. Drag `.glb` file into `Assets/Models/`
2. Select the model in Project view
3. In Inspector:
   - **Scale Factor:** 1.0 (already in meters)
   - **Generate Colliders:** Off (custom colliders recommended)
   - **Import Materials:** Yes
   - **Material Location:** Use Embedded Materials

#### Material Setup
1. Unity will create Standard Shader materials by default
2. Upgrade to URP/HDRP if needed:
   - Right-click material > Upgrade to URP/HDRP
3. Adjust emission:
   - Enable **Emission** checkbox
   - Set **Emission Intensity:** 1.5 - 3.0
   - Enable **Global Illumination:** Baked or Realtime

#### Bloom Effect
1. Add **Post Processing Volume** to scene
2. Enable **Bloom** effect:
   - Intensity: 1.0 - 2.0
   - Threshold: 0.8 - 1.0
   - Soft Knee: 0.5

#### Animation Control
```csharp
// Get Animator component
Animator animator = GetComponent<Animator>();

// Play hover animation
animator.Play("HoverBob");

// Control turret rotation (via code, not animation)
Transform turret = transform.Find("Turret_Base");
turret.localRotation = Quaternion.Euler(0, turretAngle, 0);

// Control barrel elevation
Transform barrel = turret.Find("Barrel");
barrel.localRotation = Quaternion.Euler(elevationAngle, 0, 0);
```

---

### Unreal Engine Integration

#### Importing the Model
1. **Import** > Select `.glb` file
2. In Import dialog:
   - **Import Mesh:** Yes
   - **Import Textures:** Yes
   - **Import Materials:** Yes
   - **Convert Scene:** Yes
   - **Transform Vertex to Absolute:** Yes

#### Material Setup
1. Open imported material
2. Set **Material Domain:** Surface
3. Set **Blend Mode:** Opaque
4. For emissive:
   - Connect **Emissive** output
   - Multiply emissive by **2.0 - 5.0** scalar for HDR emission

#### Bloom Effect
1. Add **Post Process Volume** to level
2. Enable **Infinite Extent (Unbound)**
3. Enable **Bloom** settings:
   - Method: Standard
   - Intensity: 1.0 - 2.0
   - Threshold: 0.8 - 1.0

#### Animation Control
```cpp
// In C++ or Blueprint
// Rotate turret
FRotator TurretRotation = FRotator(0, TurretAngle, 0);
TurretMesh->SetRelativeRotation(TurretRotation);

// Elevate barrel
FRotator BarrelRotation = FRotator(ElevationAngle, 0, 0);
BarrelMesh->SetRelativeRotation(BarrelRotation);

// Play animation
AnimInstance->PlayAnimation(HoverBobAnim, true);
```

---

## Visual Style Guide

### Design Principles
1. **Functional Over Ornamental** - Every detail suggests purpose
2. **Chunky Yet Sleek** - Balance between bulk and aerodynamics
3. **Readable Silhouette** - Clear shape even at distance
4. **Tech-Enhanced** - Visible energy systems (glowing conduits)

### Surface Treatment
- **Panel Lines:** Visible but subtle (1-2mm depth)
- **Wear:** Light scratches, edge wear, dust accumulation
- **Avoid:** Extreme battle damage (tanks should look operational)

### Color Palette
- **Primary:** Gunmetal gray (#2B3033)
- **Secondary:** Darker gray (#1A1D20)
- **Accent (Emissive):** Cyan/Teal (#00D4FF to #00FFC8)
- **Optional Markings:** White, yellow, or team colors

### Reference Inspiration
- Halo UNSC Scorpion Tank
- Mass Effect Mako
- Battlefield 2142 hover vehicles
- Modern military vehicles (M1 Abrams, Leopard 2) with hover tech

---

## Quality Checklist

Before finalizing the asset, verify:

### Model Quality
- [ ] Triangle count within budget (20k-30k)
- [ ] No n-gons or non-manifold geometry
- [ ] Clean topology with good edge flow
- [ ] No overlapping faces or z-fighting
- [ ] Scale is correct (1 unit = 1 meter)
- [ ] Pivots are correctly placed and aligned

### UVs & Textures
- [ ] All UVs within 0-1 space
- [ ] No UV overlaps (unless intentional mirroring)
- [ ] Textures are 2K resolution (2048x2048)
- [ ] All maps are correct format (.jpg/.png)
- [ ] Normal maps test correctly (not inverted)
- [ ] Emissive maps are bright enough for bloom

### Materials
- [ ] Single material assigned (or minimal count)
- [ ] PBR values are realistic (metallic, roughness)
- [ ] Emissive intensity is HDR-ready (>1.0)
- [ ] Material displays correctly in glTF viewer

### Hierarchy & Naming
- [ ] Proper mesh hierarchy (body > turret > barrel)
- [ ] Clear, consistent naming convention
- [ ] Pivot points allow rotation without clipping
- [ ] Root node is at hover center

### Animations
- [ ] All placeholder animations are present
- [ ] Animation names are descriptive
- [ ] No broken transforms or hierarchy issues
- [ ] Animations loop smoothly where intended

### Export & Integration
- [ ] Exported as .glb (binary glTF 2.0)
- [ ] File size is reasonable (<5MB)
- [ ] Loads correctly in Three.js / Unity / Unreal
- [ ] Emissive bloom works as expected
- [ ] Turret and barrel rotate smoothly

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-06 | Initial specification document |

---

## Additional Notes

### Performance Considerations
- Keep draw calls low (single material preferred)
- Use texture atlasing to reduce material count
- Consider LOD models for large-scale battles
- Emissive bloom can be expensive - test on target hardware

### Future Enhancements
- **Team Colors:** Add tintable areas for player identification
- **Damage States:** Additional texture variations for damaged tanks
- **Customization:** Modular attachments (armor plates, weapons)
- **Effects Spawners:** Add socket points for particle effects

### Asset Delivery
When delivering the final asset, include:
- `.glb` file with embedded textures
- Source files (.blend, .max, .ma) if applicable
- Texture maps as separate files (for editing)
- Brief documentation of any custom features
- Screenshots/renders for reference

---

**End of Specification**

For questions or clarifications, refer to the game design document or contact the lead developer.
