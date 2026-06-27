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
}

export interface Cactus extends Rect {}

export interface World {
  player: Player;
  walls: Rect[];
  cacti: Cactus[];
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
    },
    walls: [],
    cacti: [],
    mapWidth: 800,
    mapHeight: 600,
  };
}
