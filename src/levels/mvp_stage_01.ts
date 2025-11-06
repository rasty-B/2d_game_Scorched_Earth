/**
 * MVP Stage 1: "Broken Arch Basin"
 *
 * First playable level featuring:
 * - Wide left plateau (beginner-friendly spawn)
 * - Central arched cave bridge with skill shot opportunity
 * - Taller right plateau (high ground advantage)
 * - Three environmental hazards (gas, ion storm, EMP)
 *
 * Layout Philosophy:
 * - Left spawn: Safe, sheltered, good for learning
 * - Right spawn: Exposed but elevated, tactical advantage
 * - Cave: High-skill route for threading shots under the arch
 * - Hazards: Create strategic zones to avoid or exploit
 */

import { LevelDefinition } from './level_types';

export const LEVEL_MVP_01: LevelDefinition = {
  id: "MVP_STAGE_01",
  name: "Broken Arch Basin",
  description: "A shattered bridge spans a toxic basin. Master the skill shot through the cave or rain fire from above.",

  worldWidth: 2400,
  worldHeight: 1350,

  cameraConstraints: {
    minX: 0,
    maxX: 2400,
    minY: 0,
    maxY: 1350
  },

  /**
   * Ground terrain polyline
   * Points ordered left to right, defining the ground surface
   * Y-axis: 0 = top of world, 1350 = bottom
   */
  terrain: {
    points: [
      // Left plateau region (gentle, safe spawn area)
      { x: 0,    y: 880 },  // Far left edge
      { x: 150,  y: 840 },  // Rising to plateau
      { x: 350,  y: 820 },  // Left plateau peak (P1 spawn)
      { x: 550,  y: 830 },  // Plateau gentle slope

      // Descent into basin
      { x: 750,  y: 900 },  // Slope down
      { x: 900,  y: 940 },  // Steeper descent
      { x: 1050, y: 960 },  // Basin floor (lowest point, toxic zone)

      // Rise toward arch base
      { x: 1200, y: 940 },  // Rising from basin
      { x: 1350, y: 920 },  // Arch foundation area
      { x: 1500, y: 930 },  // Under arch center

      // Climb to right plateau
      { x: 1650, y: 880 },  // Ascending slope
      { x: 1850, y: 840 },  // Steep climb
      { x: 2050, y: 820 },  // Right plateau peak (P2 spawn - high ground)
      { x: 2250, y: 830 },  // Plateau gentle slope
      { x: 2400, y: 870 }   // Far right edge
    ]
  },

  /**
   * Cave ceiling - defines the "bridge arch" overhead
   * Three-segment arch that projectiles can pass under or over
   * Creates a skill shot opportunity through the cave
   */
  caveCeiling: [
    // Left arch support
    {
      from: { x: 900,  y: 780 },  // Cave mouth left
      to:   { x: 1125, y: 720 }   // Arch apex approach
    },
    // Arch crown (flat top)
    {
      from: { x: 1125, y: 720 },  // Apex left
      to:   { x: 1375, y: 720 }   // Apex right
    },
    // Right arch support
    {
      from: { x: 1375, y: 720 },  // Arch apex exit
      to:   { x: 1600, y: 780 }   // Cave mouth right
    }
  ],

  /**
   * Environmental hazards
   * Three distinct zones with different tactical implications
   */
  hazards: [
    /**
     * 1. Toxic Gas Cloud
     * Location: Basin floor (lowest point)
     * Effect: Damage-over-time + vision obscuration
     * Strategy: Punishes camping, but provides cover if resisted
     */
    {
      id: "gas_basin_center",
      type: "gas",
      center: { x: 1125, y: 980 },
      radius: 260,
      intensity: 0.7,
      pulse: true,
      tickRate: 1.0,
      damagePerTick: 5.0,
      duration: -1  // Permanent hazard
    },

    /**
     * 2. Ion Storm Band
     * Location: Mid-altitude strip across map center
     * Effect: Perturbs projectile trajectories passing through
     * Strategy: Shots through this zone are less accurate but can surprise
     */
    {
      id: "ion_mid_band",
      type: "ion",
      center: { x: 1200, y: 520 },  // Mid-altitude
      radius: 700,  // Wide horizontal band
      intensity: 0.4,
      noiseAmplitude: 0.15,  // +/- 15% trajectory noise
      duration: -1  // Permanent hazard
    },

    /**
     * 3. EMP Disruption Node
     * Location: Right side near high ground
     * Effect: Disables abilities (shields, drones, teleports) within radius
     * Strategy: Forces basic combat, negates ability advantages
     */
    {
      id: "emp_right_node",
      type: "emp",
      center: { x: 1900, y: 820 },
      radius: 220,
      intensity: 1.0,
      pulse: true,
      duration: -1  // Permanent hazard
    }
  ],

  /**
   * Spawn points for 2-4 players
   * Balanced for different playstyles and skill levels
   */
  spawns: [
    /**
     * P1: Left Plateau (Recommended for beginners)
     * - Safe, sheltered position
     * - Good visibility across map
     * - Protected from most angles
     */
    {
      id: "P1_left_plateau",
      position: { x: 350, y: 820 },
      radius: 40,
      playerCount: [1, 2, 3, 4],
      difficulty: "easy",
      notes: "Beginner-friendly spawn with good sightlines and shelter"
    },

    /**
     * P2: Right Plateau (High ground advantage)
     * - Elevated position (highest spawn)
     * - More exposed to fire
     * - Near EMP zone (ability limitation)
     * - Requires skill to leverage
     */
    {
      id: "P2_right_plateau",
      position: { x: 2050, y: 820 },
      radius: 40,
      playerCount: [2, 3, 4],
      difficulty: "medium",
      notes: "High ground advantage but more exposed; near EMP zone"
    },

    /**
     * P3: Cave Entrance (Optional - 3-4 players)
     * - Near toxic gas (requires management)
     * - Can use cave for trick shots
     * - Central position (can attack both sides)
     */
    {
      id: "P3_cave_entrance",
      position: { x: 900, y: 900 },
      radius: 35,
      playerCount: [3, 4],
      difficulty: "hard",
      notes: "Near toxic zone; central position for multi-angle attacks"
    },

    /**
     * P4: Right Mid-Slope (Optional - 4 players)
     * - Between arch and high ground
     * - Balanced position
     * - Near ion storm (shot accuracy issues)
     */
    {
      id: "P4_right_slope_mid",
      position: { x: 1750, y: 860 },
      radius: 35,
      playerCount: [4],
      difficulty: "medium",
      notes: "Mid-slope spawn between arch and plateau"
    }
  ],

  /**
   * Visual atmosphere
   * Dark sci-fi aesthetic with teal energy accents
   */
  background: {
    skyGradientTop: "#050814",      // Deep space black-blue
    skyGradientBottom: "#0b101b",   // Slightly lighter at horizon
    starDensity: 0.35,              // Moderate starfield
    hazeColor: "rgba(0, 183, 196, 0.18)",  // Subtle teal atmospheric haze

    // Optional parallax layers for depth
    parallax: [
      {
        type: "stars",
        scrollSpeed: 0.1,
        opacity: 0.4,
        yOffset: -100
      },
      {
        type: "planets",
        scrollSpeed: 0.3,
        opacity: 0.6,
        yOffset: -200
      }
    ]
  },

  /**
   * Level metadata
   */
  metadata: {
    recommendedPlayers: [2, 3, 4],
    difficulty: "beginner",
    estimatedDuration: 5,  // 5-minute matches
    requiredMechanics: [
      "basic_firing",
      "trajectory_prediction",
      "hazard_avoidance"
    ],
    author: "Scorched Earth Dev Team",
    version: "1.0.0"
  },

  /**
   * Physics overrides
   * Slightly reduced gravity for more dramatic arcing shots
   */
  physicsOverrides: {
    gravity: -8.0,  // Slightly lower than Earth for more floaty projectiles
    windRange: [-12, 12],  // Moderate wind variance
    windChangeFrequency: 0.3  // Wind changes 30% of turns
  }
};

/**
 * Export as default for easy importing
 */
export default LEVEL_MVP_01;
