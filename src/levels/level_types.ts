/**
 * Level System Type Definitions
 * Defines the structure for map layouts, terrain, hazards, and spawn points
 */

/**
 * Hazard types that affect gameplay
 */
export type HazardType = "gas" | "ion" | "emp";

/**
 * 2D vector in world coordinates
 */
export interface Vec2 {
  x: number;
  y: number;
}

/**
 * Terrain polyline - ordered points defining ground surface
 * Points should be ordered left to right for proper collision
 */
export interface TerrainPolyline {
  /** Points in world coordinates, ordered left→right */
  points: Vec2[];
}

/**
 * Line segment for cave ceilings, bridges, or overhead obstacles
 */
export interface Segment {
  from: Vec2;
  to: Vec2;
}

/**
 * Environmental hazard zone affecting tanks and projectiles
 */
export interface HazardZone {
  /** Unique identifier for this hazard */
  id: string;

  /** Type of hazard effect */
  type: HazardType;

  /** Center position in world coordinates */
  center: Vec2;

  /** Radius in logical world units */
  radius: number;

  /** Intensity factor for gameplay scaling (0..1) */
  intensity: number;

  /** Visual pulsing effect */
  pulse?: boolean;

  /** Noise amplitude for ion storm shot jitter */
  noiseAmplitude?: number;

  /** Duration in seconds (-1 for permanent) */
  duration?: number;

  /** Tick rate for damage-over-time effects (seconds) */
  tickRate?: number;

  /** Damage per tick (for gas/toxic hazards) */
  damagePerTick?: number;
}

/**
 * Player spawn point
 */
export interface SpawnPoint {
  /** Unique identifier */
  id: string;

  /** Spawn position in world coordinates */
  position: Vec2;

  /** Max spawn radius for small random offset */
  radius: number;

  /** Recommended for specific player count */
  playerCount?: number[];

  /** Terrain difficulty (for balancing) */
  difficulty?: "easy" | "medium" | "hard";

  /** Strategic notes */
  notes?: string;
}

/**
 * Background/atmosphere visual configuration
 */
export interface BackgroundConfig {
  /** Top color of sky gradient (hex) */
  skyGradientTop: string;

  /** Bottom color of sky gradient (hex) */
  skyGradientBottom: string;

  /** Star density (0..1) */
  starDensity: number;

  /** Atmospheric haze color (rgba) */
  hazeColor: string;

  /** Optional parallax layers */
  parallax?: ParallaxLayer[];
}

/**
 * Parallax background layer
 */
export interface ParallaxLayer {
  /** Image or procedural type */
  type: "image" | "clouds" | "stars" | "planets";

  /** Path to image (if type === "image") */
  imagePath?: string;

  /** Parallax scroll speed (0 = fixed, 1 = same as camera) */
  scrollSpeed: number;

  /** Opacity (0..1) */
  opacity: number;

  /** Y offset from camera center */
  yOffset: number;
}

/**
 * Complete level definition
 */
export interface LevelDefinition {
  /** Unique level identifier */
  id: string;

  /** Display name */
  name: string;

  /** Brief description */
  description?: string;

  /** World dimensions in logical units */
  worldWidth: number;
  worldHeight: number;

  /** Recommended camera bounds */
  cameraConstraints?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };

  /** Ground terrain polyline */
  terrain: TerrainPolyline;

  /** Optional cave ceiling or overhead obstacles */
  caveCeiling?: Segment[];

  /** Environmental hazards */
  hazards: HazardZone[];

  /** Player spawn points */
  spawns: SpawnPoint[];

  /** Background/atmosphere config */
  background: BackgroundConfig;

  /** Gameplay metadata */
  metadata?: {
    /** Recommended player count */
    recommendedPlayers: number[];

    /** Difficulty rating */
    difficulty: "beginner" | "intermediate" | "advanced" | "expert";

    /** Estimated match duration (minutes) */
    estimatedDuration: number;

    /** Special mechanics required */
    requiredMechanics?: string[];

    /** Author/designer */
    author?: string;

    /** Version */
    version?: string;
  };

  /** Physics overrides for this level */
  physicsOverrides?: {
    gravity?: number;
    windRange?: [number, number];
    windChangeFrequency?: number;
  };
}

/**
 * Hazard effect definitions for gameplay implementation
 */
export interface HazardEffects {
  gas: {
    damagePerSecond: number;
    visionReduction: number; // 0..1
    movementSlow: number; // 0..1
    accuracyPenalty: number; // 0..1
  };
  ion: {
    trajectoryNoise: number; // angle variance in degrees
    windAmplification: number; // wind effect multiplier
    projectileDeflection: number; // random force applied
  };
  emp: {
    disabledSystems: ("weapons" | "shields" | "abilities" | "movement")[];
    pulseRadius: number;
    disableDuration: number; // seconds
  };
}

/**
 * Default hazard effects (can be overridden per level)
 */
export const DEFAULT_HAZARD_EFFECTS: HazardEffects = {
  gas: {
    damagePerSecond: 5.0,
    visionReduction: 0.3,
    movementSlow: 0.2,
    accuracyPenalty: 0.15
  },
  ion: {
    trajectoryNoise: 3.0, // +/- 3 degrees
    windAmplification: 1.5,
    projectileDeflection: 0.2
  },
  emp: {
    disabledSystems: ["shields", "abilities"],
    pulseRadius: 1.0,
    disableDuration: 2.0
  }
};

/**
 * Level collection/campaign
 */
export interface LevelCollection {
  id: string;
  name: string;
  description: string;
  levels: LevelDefinition[];
  unlockOrder?: string[]; // level IDs in unlock sequence
}
