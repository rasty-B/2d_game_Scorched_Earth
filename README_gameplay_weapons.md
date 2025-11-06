# Energy-Based Gameplay & Weapons System

**Version:** 1.0.0
**Status:** Design Complete, Implementation Pending
**Design Goal:** "Every turn should feel immediate; every decision should impact energy balance and heat management. Strategic restraint is as powerful as aggression."

---

## Overview

This document describes the energy-first gameplay core and futuristic weapon system that replaces the generic "fire-and-hit" mechanic. The system provides scalable strategic depth while maintaining turn-based clarity and fast iteration potential for WebGL/Canvas builds.

### Core Philosophy

- **Energy-First Economy:** All systems (movement, shields, weapons) draw from a single shared energy pool
- **Heat-Energy Tradeoffs:** High-power weapons cause steep heat increases that reduce energy regeneration
- **Positional Play:** Movement costs energy, rewarding careful positioning over constant repositioning
- **Strategic Restraint:** Sometimes not firing is the best move to manage energy/heat economy

---

## Configuration Files

### Primary Configuration Files

| File | Purpose | Size | Format |
|------|---------|------|--------|
| `weapons.json` | Complete weapon definitions with energy costs, heat generation, cooldowns, and damage profiles | ~15KB | JSON |
| `energy_system.json` | Energy economy, regeneration, heat efficiency curves, cooling costs, and movement costs | ~8KB | JSON |
| `physics_rules.json` | Base physics constants, gravity, wind, terrain deformation, hover height modifiers | ~10KB | JSON |
| `weapons_balancing.csv` | Flat, editable tuning sheet with default weapon balance values | ~2KB | CSV |

### Supporting Documentation

| File | Purpose |
|------|---------|
| `README_gameplay_weapons.md` | This file - Integration notes and design principles |
| `PHYSICS_GAMEPLAY_SPEC.md` | Code-oriented implementation specification |
| `HOVER_TANK_SPEC.md` | Visual and technical spec for 3D hover tank model |

---

## System Integration

### 1. Loading Configuration Files

#### JavaScript/ES6 Integration

```javascript
// Load configuration files
import weaponsConfig from './weapons.json' assert { type: 'json' };
import energyConfig from './energy_system.json' assert { type: 'json' };
import physicsConfig from './physics_rules.json' assert { type: 'json' };

// Access weapon data
const railShot = weaponsConfig.weapons.rail_shot;
console.log(`Energy Cost: ${railShot.energyCost}`);
console.log(`Heat Generation: ${railShot.heatGeneration}`);

// Access energy system rules
const baseRegen = energyConfig.energyEconomy.regeneration.baseRegenPerTurn;
console.log(`Base Energy Regen: ${baseRegen} per turn`);
```

#### Dynamic Loading

```javascript
// Load JSON files dynamically
async function loadGameConfig() {
    const [weapons, energy, physics] = await Promise.all([
        fetch('weapons.json').then(r => r.json()),
        fetch('energy_system.json').then(r => r.json()),
        fetch('physics_rules.json').then(r => r.json())
    ]);

    return { weapons, energy, physics };
}

// Usage
const config = await loadGameConfig();
```

---

### 2. Core Game Loop Integration

#### Energy & Heat Management

```javascript
class EnergyManager {
    constructor(config) {
        this.config = config.energyEconomy;
        this.currentEnergy = this.config.baseEnergy.maximum;
        this.currentHeat = 0;
        this.maxEnergy = this.config.baseEnergy.maximum;
        this.maxHeat = config.heatSystem.heatPool.maximum;
    }

    /**
     * Regenerate energy at start of turn
     */
    regenerateEnergy() {
        const baseRegen = this.config.regeneration.baseRegenPerTurn;

        // Apply heat efficiency modifier
        const heatFactor = this.currentHeat / this.maxHeat;
        const heatPenalty = this.config.regeneration.heatEfficiencyModifier.heatPenaltyFactor;
        const efficiency = 1.0 - (heatFactor * heatPenalty);

        const actualRegen = baseRegen * efficiency;
        this.currentEnergy = Math.min(this.maxEnergy, this.currentEnergy + actualRegen);

        return actualRegen;
    }

    /**
     * Consume energy for action
     */
    consumeEnergy(amount) {
        if (this.currentEnergy < amount) {
            return false; // Insufficient energy
        }
        this.currentEnergy -= amount;
        return true;
    }

    /**
     * Add heat from weapon use
     */
    addHeat(amount) {
        this.currentHeat = Math.min(this.maxHeat, this.currentHeat + amount);

        // Check overheat
        if (this.currentHeat >= this.maxHeat) {
            return 'overheated';
        } else if (this.currentHeat >= 80) {
            return 'critical';
        } else if (this.currentHeat >= 60) {
            return 'hot';
        }
        return 'normal';
    }

    /**
     * Cool down heat (passive + active)
     */
    coolHeat(passiveOnly = false, activeCoolingAmount = 0) {
        const passiveCooling = this.config.heatSystem.heatDissipation.passiveCoolingPerTurn;

        // Passive cooling
        this.currentHeat = Math.max(0, this.currentHeat - passiveCooling);

        // Active cooling (costs energy)
        if (!passiveOnly && activeCoolingAmount > 0) {
            const energyCost = activeCoolingAmount *
                this.config.heatSystem.heatDissipation.activeCooling.energyCostPerHeat;

            if (this.consumeEnergy(energyCost)) {
                this.currentHeat = Math.max(0, this.currentHeat - activeCoolingAmount);
            }
        }
    }

    /**
     * Check if action can be performed
     */
    canPerformAction(energyCost, heatGeneration) {
        // Check energy availability
        if (this.currentEnergy < energyCost) {
            return { allowed: false, reason: 'insufficient_energy' };
        }

        // Check if would cause overheat
        if (this.currentHeat + heatGeneration > this.maxHeat) {
            return { allowed: false, reason: 'would_overheat' };
        }

        return { allowed: true };
    }
}
```

#### Weapon System Integration

```javascript
class WeaponSystem {
    constructor(weaponsConfig, energyManager) {
        this.weapons = weaponsConfig.weapons;
        this.energyManager = energyManager;
        this.cooldowns = {}; // {weaponId: turnsRemaining}
        this.chargeStates = {}; // {weaponId: turnsCharged}
    }

    /**
     * Fire weapon
     */
    fireWeapon(weaponId, angle, power) {
        const weapon = this.weapons[weaponId];

        // Check cooldown
        if (this.cooldowns[weaponId] > 0) {
            return { success: false, reason: 'on_cooldown' };
        }

        // Check charging requirement
        if (weapon.chargeTurnsRequired) {
            const charged = this.chargeStates[weaponId] || 0;
            if (charged < weapon.chargeTurnsRequired) {
                return { success: false, reason: 'insufficient_charge' };
            }
        }

        // Check energy and heat
        const canFire = this.energyManager.canPerformAction(
            weapon.energyCost,
            weapon.heatGeneration
        );

        if (!canFire.allowed) {
            return { success: false, reason: canFire.reason };
        }

        // Consume resources
        this.energyManager.consumeEnergy(weapon.energyCost);
        const heatStatus = this.energyManager.addHeat(weapon.heatGeneration);

        // Set cooldown
        this.cooldowns[weaponId] = weapon.cooldownTurns;

        // Reset charge
        if (weapon.chargeTurnsRequired) {
            this.chargeStates[weaponId] = 0;
        }

        // Spawn projectile (handled by physics system)
        return {
            success: true,
            weapon: weapon,
            heatStatus: heatStatus
        };
    }

    /**
     * Charge weapon for next turn
     */
    chargeWeapon(weaponId) {
        const weapon = this.weapons[weaponId];

        if (!weapon.chargeTurnsRequired) {
            return { success: false, reason: 'weapon_does_not_require_charge' };
        }

        this.chargeStates[weaponId] = (this.chargeStates[weaponId] || 0) + 1;

        return {
            success: true,
            currentCharge: this.chargeStates[weaponId],
            requiredCharge: weapon.chargeTurnsRequired
        };
    }

    /**
     * Tick cooldowns at end of turn
     */
    tickCooldowns() {
        for (const weaponId in this.cooldowns) {
            if (this.cooldowns[weaponId] > 0) {
                this.cooldowns[weaponId]--;
            }
        }
    }

    /**
     * Get weapon status
     */
    getWeaponStatus(weaponId) {
        const weapon = this.weapons[weaponId];
        const cooldown = this.cooldowns[weaponId] || 0;
        const charge = this.chargeStates[weaponId] || 0;

        return {
            energyCost: weapon.energyCost,
            heatGeneration: weapon.heatGeneration,
            cooldownRemaining: cooldown,
            chargeProgress: charge,
            chargeRequired: weapon.chargeTurnsRequired || 0,
            ready: cooldown === 0 && (
                !weapon.chargeTurnsRequired ||
                charge >= weapon.chargeTurnsRequired
            )
        };
    }
}
```

#### Movement System Integration

```javascript
class MovementSystem {
    constructor(energyConfig, terrain) {
        this.config = energyConfig.movementCosts;
        this.terrain = terrain;
    }

    /**
     * Calculate movement cost
     */
    calculateMovementCost(fromX, toX, stepNumber) {
        const distance = Math.abs(toX - fromX);
        const baseCost = this.config.baseCost.perStep;

        // Get terrain type and slope
        const terrainType = this.terrain.getTerrainType(fromX, toX);
        const terrainMultiplier = this.config.terrainMultipliers[terrainType] || 1.0;

        // Calculate slope
        const fromY = this.terrain.getHeightAt(fromX);
        const toY = this.terrain.getHeightAt(toX);
        const slopeAngle = Math.atan2(Math.abs(toY - fromY), distance) * (180 / Math.PI);
        const slopeModifier = 1.0 + (slopeAngle / 45) * 0.8;

        // Consecutive move penalty
        const stepPenalties = this.config.consecutiveMovePenalty;
        const stepKeys = ['firstStep', 'secondStep', 'thirdStep', 'fourthStep', 'fifthStep'];
        const stepPenalty = stepPenalties[stepKeys[stepNumber - 1]] || 1.6;

        // Calculate final cost
        const cost = baseCost * terrainMultiplier * slopeModifier * stepPenalty;

        return Math.ceil(cost);
    }

    /**
     * Check if movement is possible
     */
    canMove(energyManager, fromX, toX, stepNumber) {
        const cost = this.calculateMovementCost(fromX, toX, stepNumber);
        const reserveBuffer = this.config.movementBudget.reserveEnergyBuffer;

        return {
            allowed: energyManager.currentEnergy >= cost + reserveBuffer,
            cost: cost,
            energyAfter: energyManager.currentEnergy - cost
        };
    }
}
```

---

### 3. Turn-Based Flow

#### Complete Turn Cycle

```javascript
class TurnManager {
    constructor(config) {
        this.energyManager = new EnergyManager(config.energySystem);
        this.weaponSystem = new WeaponSystem(config.weapons, this.energyManager);
        this.movementSystem = new MovementSystem(config.energySystem, terrain);
        this.turnNumber = 0;
    }

    /**
     * Start new turn
     */
    startTurn() {
        this.turnNumber++;

        // Regenerate energy
        const regenAmount = this.energyManager.regenerateEnergy();
        console.log(`Turn ${this.turnNumber}: Regenerated ${regenAmount} energy`);

        // Passive cooling
        this.energyManager.coolHeat(true);

        // Tick weapon cooldowns
        this.weaponSystem.tickCooldowns();

        // Update UI
        this.updateEnergyHUD();
    }

    /**
     * End turn
     */
    endTurn() {
        // Final heat check
        if (this.energyManager.currentHeat >= this.energyManager.maxHeat) {
            console.warn('Tank overheated! Systems disabled next turn.');
            return 'overheated';
        }

        return 'normal';
    }

    /**
     * Update HUD display
     */
    updateEnergyHUD() {
        const energy = this.energyManager.currentEnergy;
        const maxEnergy = this.energyManager.maxEnergy;
        const heat = this.energyManager.currentHeat;
        const maxHeat = this.energyManager.maxHeat;

        // Update UI elements
        document.getElementById('energy-bar').style.width = `${(energy / maxEnergy) * 100}%`;
        document.getElementById('energy-text').textContent = `${Math.floor(energy)} / ${maxEnergy}`;

        document.getElementById('heat-bar').style.width = `${(heat / maxHeat) * 100}%`;
        document.getElementById('heat-text').textContent = `${Math.floor(heat)} / ${maxHeat}`;

        // Visual warnings
        if (heat >= 80) {
            document.getElementById('heat-bar').classList.add('critical');
        } else if (heat >= 60) {
            document.getElementById('heat-bar').classList.add('warning');
        }
    }
}
```

---

## HUD Implementation

### Required UI Elements

#### 1. Energy Bar (Bottom-Left)

```html
<div id="energy-container" class="hud-element">
    <div class="hud-label">ENERGY</div>
    <div class="meter-bar">
        <div id="energy-bar" class="energy-fill"></div>
    </div>
    <div id="energy-text" class="meter-text">100 / 100</div>
    <div class="regen-text">+<span id="energy-regen">20</span>/turn</div>
</div>
```

```css
#energy-container {
    position: absolute;
    bottom: 80px;
    left: 20px;
    width: 200px;
    background: rgba(0, 0, 0, 0.7);
    padding: 10px;
    border-radius: 5px;
}

.energy-fill {
    background: linear-gradient(90deg, #00d4ff, #00b8d4);
    height: 100%;
    transition: width 0.3s ease;
}
```

#### 2. Heat Bar (Below Energy)

```html
<div id="heat-container" class="hud-element">
    <div class="hud-label">HEAT</div>
    <div class="meter-bar">
        <div id="heat-bar" class="heat-fill"></div>
    </div>
    <div id="heat-text" class="meter-text">0 / 100</div>
    <div class="cooling-text">-<span id="heat-cooling">10</span>/turn</div>
</div>
```

```css
.heat-fill {
    background: linear-gradient(90deg, #f39c12, #e74c3c);
    height: 100%;
    transition: width 0.3s ease;
}

.heat-fill.warning {
    background: linear-gradient(90deg, #e74c3c, #c0392b);
    animation: heat-pulse 1s infinite;
}

.heat-fill.critical {
    background: linear-gradient(90deg, #c0392b, #8b0000);
    animation: heat-pulse 0.5s infinite;
}

@keyframes heat-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}
```

#### 3. Weapon Panel with Costs

```html
<div id="weapon-panel" class="hud-element">
    <div class="weapon-slot" data-weapon="rail_shot">
        <div class="weapon-icon">🔫</div>
        <div class="weapon-name">Rail Shot</div>
        <div class="weapon-cost">
            <span class="energy-cost">⚡10</span>
            <span class="heat-cost">🔥5</span>
        </div>
        <div class="cooldown hidden">CD: <span>0</span></div>
    </div>
    <!-- More weapon slots... -->
</div>
```

```css
.weapon-slot {
    position: relative;
    padding: 10px;
    border: 2px solid #4ecca3;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.weapon-slot.on-cooldown {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #888;
}

.weapon-slot.insufficient-energy {
    border-color: #e74c3c;
}

.weapon-cost {
    font-size: 11px;
    display: flex;
    gap: 8px;
}

.energy-cost {
    color: #00d4ff;
}

.heat-cost {
    color: #ff4500;
}
```

---

## Gameplay Guidelines

### Energy Management Strategy

#### Early Game (Turns 1-3)
- **Priority:** Establish position, conserve energy
- **Actions:** 1-2 basic shots (Rail Shot) + movement
- **Heat:** Keep below 40 to maintain optimal regen

#### Mid Game (Turns 4-8)
- **Priority:** Apply pressure with mixed weapons
- **Actions:** Cluster Swarm or Plasma Arc for area denial
- **Heat:** Manage 40-60 range, use active cooling if needed

#### Late Game (Turns 9+)
- **Priority:** Finish with high-impact weapons
- **Actions:** Charge Quantum Bomb or use Orbital Beacon
- **Heat:** Can afford to push to 80+ if finishing blow

### Weapon Selection Decision Tree

```
Turn Start
    ├─ Energy > 60?
    │   ├─ Yes → Consider high-cost weapons (Quantum Bomb, Phase Disruptor)
    │   └─ No → Stick to basic weapons (Rail Shot, Plasma Arc)
    │
    ├─ Heat < 40?
    │   ├─ Yes → Can use any weapon safely
    │   └─ No → Avoid high-heat weapons (Exotic tier)
    │
    ├─ Enemy in range?
    │   ├─ Yes → Damage weapons (Kinetic, Energy, Exotic)
    │   └─ No → Utility weapons (Orbital Beacon, EMP Pulse)
    │
    └─ Need positioning?
        ├─ Yes → Save energy for movement
        └─ No → Spend energy on weapons
```

### Heat Crisis Management

**If Heat > 80 (Critical):**
1. **Stop firing** - Don't add more heat
2. **Active cool** - Spend 10-15 energy to cool 20-30 heat
3. **Next turn** - Fire low-heat weapon (Rail Shot, EMP Pulse)

**If Heat = 100 (Overheated):**
1. **Systems disabled** - Can't fire weapons or shields
2. **Emergency cooling** - Automatic 30 heat reduction
3. **Move only** - Use movement to reposition while cooling
4. **Next turn** - Resume combat with caution

---

## Balancing & Tuning

### Quick Balance Adjustments

| Problem | Solution | File | Parameter |
|---------|----------|------|-----------|
| Players run out of energy too fast | Increase base regen | `energy_system.json` | `energyEconomy.regeneration.baseRegenPerTurn` |
| Overheat happens too often | Reduce weapon heat | `weapons.json` | `weapons[id].heatGeneration` |
| Movement too expensive | Lower step cost | `energy_system.json` | `movementCosts.baseCost.perStep` |
| Exotic weapons too weak | Increase damage | `weapons.json` | `weapons[id].damage.direct` |
| Too easy to spam weapons | Increase cooldowns | `weapons.json` | `weapons[id].cooldownTurns` |

### Using weapons_balancing.csv

The CSV file provides a flat view of weapon stats for easy spreadsheet editing:

```csv
weaponId,name,tier,energyCost,heatGeneration,cooldownTurns,damage,explosionRadius
rail_shot,Rail Shot,1,10,5,0,35,15
plasma_arc,Plasma Arc,2,25,15,1,30,20
cluster_swarm,Cluster Swarm,2,30,10,2,20,12
...
```

**Workflow:**
1. Open `weapons_balancing.csv` in Excel/Google Sheets
2. Adjust values based on playtesting
3. Export as CSV
4. Run converter script to update `weapons.json`

### Playtesting Metrics

Track these metrics during playtesting:

- **Energy Starvation Rate:** % of turns with energy < 20
- **Overheat Frequency:** How often tanks overheat per game
- **Weapon Usage Distribution:** Which weapons are most/least used
- **Average Turn Energy:** Track energy patterns over time
- **Heat Spike Events:** When do players hit critical heat?

**Target Metrics:**
- Energy Starvation: <15% of turns
- Overheat Frequency: 0-1 times per game
- Weapon Diversity: No single weapon >40% usage
- Average Turn Energy: 40-70 range
- Heat Critical: 1-2 times per game (strategic moments)

---

## Implementation Checklist

### Phase 1: Core Systems (Week 1)

- [ ] Load JSON configuration files into game
- [ ] Implement `EnergyManager` class
- [ ] Implement `WeaponSystem` class with cooldowns
- [ ] Implement `MovementSystem` with terrain costs
- [ ] Create energy and heat HUD elements
- [ ] Test basic energy economy flow

### Phase 2: Weapon Integration (Week 2)

- [ ] Integrate all weapon types from `weapons.json`
- [ ] Implement weapon behaviors (cluster, homing, phase)
- [ ] Add weapon charging system for exotic weapons
- [ ] Create weapon tooltips showing costs
- [ ] Test all 10 weapons
- [ ] Balance initial weapon stats

### Phase 3: Advanced Features (Week 3)

- [ ] Implement heat effects on accuracy/regen
- [ ] Add active cooling system
- [ ] Implement overheat shutdown
- [ ] Add special abilities (boost, overcharge, etc.)
- [ ] Create visual effects for heat states
- [ ] Add terrain-dependent movement costs

### Phase 4: Polish & Balance (Week 4)

- [ ] Playtesting sessions
- [ ] Collect telemetry data
- [ ] Balance weapon costs/damage
- [ ] Fine-tune energy regen curve
- [ ] Add tutorial explaining energy system
- [ ] Create difficulty presets

---

## Debug & Testing

### Debug Mode

Enable debug mode to visualize energy/heat systems:

```javascript
const DEBUG = {
    showEnergyLog: true,
    showHeatLog: true,
    showWeaponCosts: true,
    showMovementCosts: true,
    infiniteEnergy: false,  // For testing
    noHeatGeneration: false  // For testing
};

if (DEBUG.showEnergyLog) {
    console.log(`Energy: ${energy}/${maxEnergy} (Regen: +${regen})`);
    console.log(`Heat: ${heat}/${maxHeat} (Cool: -${cooling})`);
}
```

### Test Scenarios

#### Test 1: Energy Starvation
- Spam expensive weapons (Plasma Arc x3)
- Should run low on energy by turn 4
- Energy regen should slow due to heat

#### Test 2: Overheat Crisis
- Fire Quantum Bomb (35 heat)
- Fire Plasma Arc (15 heat)
- Fire Cluster Swarm (10 heat)
- Should hit 60 heat, trigger warning

#### Test 3: Movement Economy
- Move 5 steps in one turn
- Should cost ~20-25 energy
- Should limit weapon choices next turn

#### Test 4: Strategic Restraint
- Hold fire for 2 turns
- Energy should regenerate to full
- Heat should cool to zero
- Then able to use exotic weapons

---

## FAQ & Troubleshooting

**Q: Players always run out of energy. What do I adjust?**
A: Increase `baseRegenPerTurn` from 20 to 25, or decrease weapon `energyCost` values by 10-20%.

**Q: Nobody uses exotic weapons. Why?**
A: Exotic weapons require charging. Add UI indicators showing charge progress more clearly, or reduce `chargeTurnsRequired`.

**Q: Heat system feels invisible. How to improve?**
A: Add more visual feedback - screen tint, particle effects, sound effects at heat thresholds (60, 80, 100).

**Q: Movement costs are confusing. How to communicate better?**
A: Show energy cost preview when hovering over destination. Add "Energy Cost: 5" tooltip.

**Q: How do I balance a new weapon?**
A: Use this formula: `energyCost ≈ damage * 0.5`. Example: 40 damage weapon = 20 energy cost.

**Q: Can I disable heat system for simpler gameplay?**
A: Yes. Set `globalHeatMultiplier: 0.0` in `energy_system.json`. Weapons still cost energy but generate no heat.

---

## Next Steps

1. **Hook JSON configs into gameplay logic** (weapon fire, energy regen, heat tracking)
2. **Add debug HUD** showing Energy, Heat, Cooldown timers
3. **Validate projectile physics** vs `physics_rules.json` values
4. **Log telemetry during playtests** to refine regen/heat balance
5. **Add placeholder effects** (sound, emissive, particle) for overheat and quantum events

---

## Design Notes

### Why Energy-First?

Traditional artillery games have unlimited shots. This leads to:
- Spamming weapons without strategy
- No resource management
- Repetitive gameplay

Energy-first gameplay adds:
- **Strategic depth** - Every action has opportunity cost
- **Risk/reward** - High-damage weapons cost more
- **Pacing control** - Energy regen controls game tempo
- **Skill expression** - Managing resources = skill

### Why Heat System?

Heat provides a secondary resource constraint that:
- **Prevents spam** - Can't just fire expensive weapon every turn
- **Adds tension** - Heat buildup creates critical moments
- **Rewards restraint** - Cooling down is sometimes optimal play
- **Visual drama** - Overheating is a visible crisis

### Weapon Tier Philosophy

- **Tier 1 (Kinetic):** Basic, reliable, low cost. Always viable.
- **Tier 2 (Energy, Smart, Utility):** Situational, moderate cost. Tactical options.
- **Tier 3 (Exotic, Gravitic):** Game-changing, high cost. Require setup.

This ensures:
- New players can use Tier 1 effectively
- Experienced players leverage Tier 2 for advantage
- Epic moments come from well-executed Tier 3 plays

---

**End of Documentation**

For implementation details, see `PHYSICS_GAMEPLAY_SPEC.md`.
For visual specifications, see `HOVER_TANK_SPEC.md`.
For migration planning, see `INTEGRATION_ROADMAP.md`.
