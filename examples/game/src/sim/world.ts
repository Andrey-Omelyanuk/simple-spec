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

export interface River extends Rect {}

export interface Bridge extends Rect {}

export interface Portal extends Rect {}

export interface Door extends Rect {
  visible: boolean;
}

export interface ShopItem extends Rect {
  type: "sword";
  price: number;
}

export interface Shop extends Rect {
  items: ShopItem[];
}

export interface LevelData {
  walls: Rect[];
  cacti: Cactus[];
  patrols: Patrol[];
  hearts: Heart[];
  coins: Coin[];
  rivers: River[];
  bridges: Bridge[];
  portals: Portal[];
  shop: Shop;
  spawnX: number;
  spawnY: number;
}

export interface World {
  player: Player;
  walls: Rect[];
  cacti: Cactus[];
  patrols: Patrol[];
  hearts: Heart[];
  coins: Coin[];
  rivers: River[];
  bridges: Bridge[];
  portals: Portal[];
  portalCooldown: number;
  riverFlowOffset: number;
  score: number;
  rngState: number;
  mapWidth: number;
  mapHeight: number;
  swordTimer: number;
  swordCooldown: number;
  swordDirection: { dx: number; dy: number };
  swordUpgraded: boolean;
  level: number;
  door: Door;
  shop: Shop;
}

export interface Input {
  dx: number;
  dy: number;
  attack?: boolean;
}

export function createWorld(): World {
  const levelData = LEVELS[0];

  return {
    player: {
      x: levelData.spawnX,
      y: levelData.spawnY,
      w: 20,
      h: 20,
      speed: 200,
      hp: 100,
      maxHp: 100,
      spawnX: levelData.spawnX,
      spawnY: levelData.spawnY,
      invulnerableTimer: 0,
      animPhase: 0,
    },
    walls: levelData.walls,
    cacti: levelData.cacti,
    patrols: levelData.patrols,
    hearts: levelData.hearts,
    coins: levelData.coins,
    rivers: levelData.rivers,
    bridges: levelData.bridges,
    portals: levelData.portals,
    portalCooldown: 0,
    riverFlowOffset: 0,
    score: 0,
    rngState: 12345,
    mapWidth: 800,
    mapHeight: 600,
    swordTimer: 0,
    swordCooldown: 0,
    swordDirection: { dx: 1, dy: 0 },
    swordUpgraded: false,
    level: 1,
    door: { x: 700, y: 500, w: 40, h: 40, visible: false },
    shop: levelData.shop,
  };
}

export const LEVELS: LevelData[] = [
  {
    walls: [],
    cacti: [],
    patrols: [],
    hearts: [],
    coins: [
      { x: 200, y: 200, w: 20, h: 20 },
      { x: 400, y: 300, w: 20, h: 20 },
    ],
    rivers: [],
    bridges: [],
    portals: [],
    shop: {
      x: 600, y: 50, w: 100, h: 60,
      items: [{ x: 640, y: 70, w: 20, h: 20, type: "sword", price: 3 }],
    },
    spawnX: 100,
    spawnY: 100,
  },
  {
    walls: [{ x: 300, y: 0, w: 20, h: 400 }],
    cacti: [{ x: 500, y: 300, w: 20, h: 20 }],
    patrols: [],
    hearts: [{ x: 600, y: 100, w: 20, h: 20 }],
    coins: [
      { x: 150, y: 150, w: 20, h: 20 },
      { x: 400, y: 200, w: 20, h: 20 },
    ],
    rivers: [],
    bridges: [],
    portals: [
      { x: 100, y: 400, w: 30, h: 30 },
      { x: 600, y: 100, w: 30, h: 30 },
    ],
    shop: {
      x: 600, y: 50, w: 100, h: 60,
      items: [{ x: 640, y: 70, w: 20, h: 20, type: "sword", price: 3 }],
    },
    spawnX: 100,
    spawnY: 100,
  },
  {
    walls: [{ x: 200, y: 200, w: 400, h: 20 }],
    cacti: [],
    patrols: [{
      x: 400, y: 400, w: 20, h: 20,
      startX: 400, startY: 400,
      endX: 600, endY: 400,
      speed: 100,
      progress: 0,
      direction: 1,
    }],
    hearts: [],
    coins: [
      { x: 150, y: 100, w: 20, h: 20 },
      { x: 500, y: 150, w: 20, h: 20 },
    ],
    rivers: [{ x: 0, y: 500, w: 800, h: 40 }],
    bridges: [{ x: 350, y: 480, w: 100, h: 80 }],
    portals: [],
    shop: {
      x: 600, y: 50, w: 100, h: 60,
      items: [{ x: 640, y: 70, w: 20, h: 20, type: "sword", price: 3 }],
    },
    spawnX: 100,
    spawnY: 100,
  },
];
