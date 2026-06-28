export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Player extends Rect {
  speed: number;
  hp: number;
  maxHp: number;
  spawnX: number;
  spawnY: number;
  invulnerableTimer: number;
  animPhase: number;
}

export interface Cactus extends Rect {}

export interface Patrol extends Rect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  speed: number;
  progress: number;
  direction: 1 | -1;
}

export interface Heart extends Rect {}

export interface Coin extends Rect {}

export interface World {
  player: Player;
  walls: Rect[];
  cacti: Cactus[];
  patrols: Patrol[];
  hearts: Heart[];
  coins: Coin[];
  score: number;
  rngState: number;
  mapWidth: number;
  mapHeight: number;
}

export interface Input {
  dx: number;
  dy: number;
}

export function createWorld(): World {
  return {
    player: {
      x: 100,
      y: 100,
      w: 20,
      h: 20,
      speed: 200,
      hp: 100,
      maxHp: 100,
      spawnX: 100,
      spawnY: 100,
      invulnerableTimer: 0,
      animPhase: 0,
    },
    walls: [],
    cacti: [],
    patrols: [],
    hearts: [],
    coins: [],
    score: 0,
    rngState: 12345,
    mapWidth: 800,
    mapHeight: 600,
  };
}
