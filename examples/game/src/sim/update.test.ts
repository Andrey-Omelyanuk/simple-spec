// story: base
import { update } from "./update.js";
import { World, Input } from "./world.js";

function makeWorld(overrides: Partial<World> = {}): World {
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
    rivers: [],
    bridges: [],
    riverFlowOffset: 0,
    score: 0,
    rngState: 12345,
    mapWidth: 800,
    mapHeight: 600,
    swordTimer: 0,
    swordCooldown: 0,
    swordDirection: { dx: 1, dy: 0 },
    level: 1,
    door: { x: 700, y: 500, w: 40, h: 40, visible: false },
    ...overrides,
  };
}

describe("base", () => {
  // story: base — сценарий 1: стоит на месте
  it("does not move when no input", () => {
    const world = makeWorld();
    const input: Input = { dx: 0, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.x).toBe(100);
    expect(next.player.y).toBe(100);
  });

  // story: base — сценарий 2: идёт в сторону
  it("moves in a direction", () => {
    const world = makeWorld();
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.x).toBe(300);
    expect(next.player.y).toBe(100);
  });

  // story: base — сценарий 3: диагональ не быстрее прямой
  it("moves diagonally at the same speed as straight", () => {
    const world = makeWorld();
    const input: Input = { dx: 1, dy: 1 };
    const next = update(world, input, 1);
    const dx = next.player.x - 100;
    const dy = next.player.y - 100;
    const dist = Math.sqrt(dx * dx + dy * dy);
    expect(dist).toBeCloseTo(200, 5);
  });

  // story: base — сценарий 4: упирается в стену
  it("stops at a wall", () => {
    const wall = { x: 200, y: 80, w: 20, h: 60 };
    const world = makeWorld({ walls: [wall] });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.x + next.player.w).toBeLessThanOrEqual(200);
    expect(next.player.x + next.player.w).toBeCloseTo(200, 5);
  });

  // story: base — сценарий 5: скользит вдоль стены
  it("slides along a wall", () => {
    const wall = { x: 200, y: 0, w: 20, h: 200 };
    const world = makeWorld({ walls: [wall] });
    const input: Input = { dx: 1, dy: 1 };
    const next = update(world, input, 1);
    expect(next.player.x + next.player.w).toBeLessThanOrEqual(200);
    expect(next.player.y).toBeGreaterThan(100);
  });

  // story: base — сценарий 6: не уходит за край карты
  it("does not leave the map", () => {
    const world = makeWorld();
    const input: Input = { dx: -1, dy: -1 };
    const next = update(world, input, 100);
    expect(next.player.x).toBe(0);
    expect(next.player.y).toBe(0);
  });
});

// story: cactus-enemy
describe("cactus-enemy", () => {
  // story: cactus-enemy — сценарий 1: кактус стоит на месте
  it("cactus does not move", () => {
    const cactus = { x: 200, y: 100, w: 20, h: 20 };
    const world = makeWorld({ cacti: [cactus] });
    const input: Input = { dx: 0, dy: 0 };
    const next = update(world, input, 1);
    expect(next.cacti[0].x).toBe(200);
    expect(next.cacti[0].y).toBe(100);
  });

  // story: cactus-enemy — сценарий 2: касание — урон
  it("player takes damage on cactus touch", () => {
    const cactus = { x: 115, y: 100, w: 20, h: 20 };
    const world = makeWorld({ cacti: [cactus] });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.hp).toBeLessThan(100);
    expect(next.player.hp).toBe(90);
  });

  // story: cactus-enemy — сценарий 3: касание — отскок
  it("player bounces away from cactus", () => {
    const cactus = { x: 115, y: 100, w: 20, h: 20 };
    const world = makeWorld({ cacti: [cactus] });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.x).toBeLessThan(115);
  });

  // story: cactus-enemy — сценарий 4: повторный урон
  it("player takes damage on each touch", () => {
    const cactus = { x: 115, y: 100, w: 20, h: 20 };
    const world = makeWorld({ cacti: [cactus] });
    const input: Input = { dx: 1, dy: 0 };

    let next = update(world, input, 1);
    expect(next.player.hp).toBe(90);

    const inputBack: Input = { dx: -1, dy: 0 };
    next = update(next, inputBack, 0.5);

    const inputAgain: Input = { dx: 1, dy: 0 };
    next = update(next, inputAgain, 1);
    expect(next.player.hp).toBe(80);
  });

  // story: cactus-enemy — сценарий 5: отскок в стену
  it("bounce respects walls", () => {
    const wall = { x: 0, y: 0, w: 20, h: 200 };
    const cactus = { x: 25, y: 100, w: 20, h: 20 };
    const world = makeWorld({
      player: { x: 50, y: 100, w: 20, h: 20, speed: 200, hp: 100, maxHp: 100, spawnX: 100, spawnY: 100, invulnerableTimer: 0, animPhase: 0 },
      walls: [wall],
      cacti: [cactus],
    });
    const input: Input = { dx: -1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.x).toBeGreaterThanOrEqual(20);
    expect(next.player.hp).toBe(90);
  });
});

// story: player-lives
describe("player-lives", () => {
  // story: player-lives — сценарий 1: здоровье при появлении
  it("player spawns with full health", () => {
    const world = makeWorld();
    expect(world.player.hp).toBe(100);
    expect(world.player.maxHp).toBe(100);
  });

  // story: player-lives — сценарий 2: урон уменьшает здоровье
  it("damage reduces health but not below zero", () => {
    const cactus = { x: 115, y: 100, w: 20, h: 20 };
    const world = makeWorld({ player: { ...makeWorld().player, hp: 15 }, cacti: [cactus] });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.hp).toBe(5);
  });

  // story: player-lives — сценарий 3: смерть и возрождение
  it("player respawns at spawn point with full health on death", () => {
    const cactus = { x: 115, y: 100, w: 20, h: 20 };
    const world = makeWorld({
      player: { ...makeWorld().player, hp: 5, x: 110, y: 100 },
      cacti: [cactus],
    });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 0.1);
    expect(next.player.hp).toBe(100);
    expect(next.player.x).toBe(100);
    expect(next.player.y).toBe(100);
    expect(next.player.invulnerableTimer).toBe(0);
  });

  // story: player-lives — сценарий 4: мигание после удара
  it("player becomes invulnerable after taking damage", () => {
    const cactus = { x: 115, y: 100, w: 20, h: 20 };
    const world = makeWorld({ cacti: [cactus] });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.invulnerableTimer).toBe(1);
  });

  // story: player-lives — сценарий 5: неуязвимость во время мигания
  it("player takes no damage while invulnerable", () => {
    const cactus = { x: 115, y: 100, w: 20, h: 20 };
    const world = makeWorld({
      player: { ...makeWorld().player, hp: 90, invulnerableTimer: 0.5, x: 110, y: 100 },
      cacti: [cactus],
    });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 0.1);
    expect(next.player.hp).toBe(90);
    expect(next.player.invulnerableTimer).toBeGreaterThan(0);
  });

  // story: player-lives — сценарий 6: уязвимость после мигания
  it("player takes damage after invulnerability ends", () => {
    const cactus = { x: 115, y: 100, w: 20, h: 20 };
    const world = makeWorld({
      player: { ...makeWorld().player, hp: 90, invulnerableTimer: 0.5, x: 110, y: 100 },
      cacti: [cactus],
    });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.hp).toBe(80);
  });
});

// story: patrol-enemy
describe("patrol-enemy", () => {
  // story: patrol-enemy — сценарий 1: идёт по маршруту
  it("patrol moves along its route", () => {
    const patrol = {
      x: 200, y: 100, w: 20, h: 20,
      startX: 200, startY: 100,
      endX: 400, endY: 100,
      speed: 100,
      progress: 0,
      direction: 1 as const,
    };
    const world = makeWorld({ patrols: [patrol] });
    const input: Input = { dx: 0, dy: 0 };
    const next = update(world, input, 1);
    expect(next.patrols[0].progress).toBeGreaterThan(0);
    expect(next.patrols[0].progress).toBeLessThanOrEqual(1);
  });

  // story: patrol-enemy — сценарий 2: разворот в конце
  it("patrol turns around at the end of route", () => {
    const patrol = {
      x: 400, y: 100, w: 20, h: 20,
      startX: 200, startY: 100,
      endX: 400, endY: 100,
      speed: 100,
      progress: 0.95,
      direction: 1 as const,
    };
    const world = makeWorld({ patrols: [patrol] });
    const input: Input = { dx: 0, dy: 0 };
    const next = update(world, input, 1);
    expect(next.patrols[0].direction).toBe(-1);
  });

  // story: patrol-enemy — сценарий 3: касание — урон
  it("player takes damage on patrol touch", () => {
    const patrol = {
      x: 115, y: 100, w: 20, h: 20,
      startX: 115, startY: 100,
      endX: 300, endY: 100,
      speed: 0,
      progress: 0,
      direction: 1 as const,
    };
    const world = makeWorld({ patrols: [patrol] });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.hp).toBe(90);
  });

  // story: patrol-enemy — сценарий 4: касание — отскок
  it("player bounces away from patrol", () => {
    const patrol = {
      x: 115, y: 100, w: 20, h: 20,
      startX: 115, startY: 100,
      endX: 300, endY: 100,
      speed: 0,
      progress: 0,
      direction: 1 as const,
    };
    const world = makeWorld({ patrols: [patrol] });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.x).toBeLessThan(115);
  });

  // story: patrol-enemy — сценарий 5: патрульный не проходит сквозь стены
  it("patrol does not pass through walls", () => {
    const wall = { x: 250, y: 80, w: 20, h: 60 };
    const patrol = {
      x: 200, y: 100, w: 20, h: 20,
      startX: 200, startY: 100,
      endX: 400, endY: 100,
      speed: 100,
      progress: 0,
      direction: 1 as const,
    };
    const world = makeWorld({ walls: [wall], patrols: [patrol] });
    const input: Input = { dx: 0, dy: 0 };
    const next = update(world, input, 1);
    expect(next.patrols[0].direction).toBe(-1);
  });

  // story: patrol-enemy — сценарий 6: патрульный не уходит за край карты
  it("patrol does not leave the map", () => {
    const patrol = {
      x: 750, y: 100, w: 20, h: 20,
      startX: 750, startY: 100,
      endX: 900, endY: 100,
      speed: 100,
      progress: 0.2,
      direction: 1 as const,
    };
    const world = makeWorld({ patrols: [patrol] });
    const input: Input = { dx: 0, dy: 0 };
    const next = update(world, input, 1);
    expect(next.patrols[0].direction).toBe(-1);
  });
});

// story: health-heart
describe("health-heart", () => {
  // story: health-heart — сценарий 1: сердечки на карте
  it("hearts are present on the map at start", () => {
    const heart = { x: 300, y: 300, w: 20, h: 20 };
    const world = makeWorld({ hearts: [heart] });
    expect(world.hearts.length).toBe(1);
    expect(world.hearts[0].x).toBe(300);
    expect(world.hearts[0].y).toBe(300);
  });

  // story: health-heart — сценарий 2: подбор сердечка
  it("picking up a heart restores health and removes it", () => {
    const heart = { x: 115, y: 100, w: 20, h: 20 };
    const world = makeWorld({
      player: { ...makeWorld().player, hp: 50 },
      hearts: [heart],
    });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.hp).toBe(60);
    expect(next.hearts.length).toBe(0);
  });

  // story: health-heart — сценарий 3: здоровье не выше максимума
  it("health does not exceed maximum after picking up heart", () => {
    const heart = { x: 115, y: 100, w: 20, h: 20 };
    const world = makeWorld({
      player: { ...makeWorld().player, hp: 95 },
      hearts: [heart],
    });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.hp).toBe(100);
    expect(next.hearts.length).toBe(0);
  });

  // story: health-heart — сценарий 4: полное здоровье
  it("heart is not consumed when health is full", () => {
    const heart = { x: 115, y: 100, w: 20, h: 20 };
    const world = makeWorld({
      player: { ...makeWorld().player, hp: 100 },
      hearts: [heart],
    });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.hp).toBe(100);
    expect(next.hearts.length).toBe(1);
  });

  // story: health-heart — сценарий 5: сердечко исчезает навсегда
  it("picked up heart does not reappear", () => {
    const heart = { x: 115, y: 100, w: 20, h: 20 };
    const world = makeWorld({
      player: { ...makeWorld().player, hp: 50 },
      hearts: [heart],
    });
    const input: Input = { dx: 1, dy: 0 };
    let next = update(world, input, 1);
    expect(next.hearts.length).toBe(0);

    const inputBack: Input = { dx: -1, dy: 0 };
    next = update(next, inputBack, 1);
    expect(next.hearts.length).toBe(0);
  });
});

// story: score-coins
describe("score-coins", () => {
  // story: score-coins — сценарий 1: счёт при появлении
  it("score is zero and 2 coins on map at game start", () => {
    const world = makeWorld({ coins: [{ x: 100, y: 200, w: 20, h: 20 }, { x: 300, y: 400, w: 20, h: 20 }] });
    expect(world.score).toBe(0);
    expect(world.coins.length).toBe(2);
  });

  // story: score-coins — сценарий 2: подбор монетки
  it("picking up a coin increases score by 1 and spawns new one", () => {
    const coin = { x: 115, y: 100, w: 20, h: 20 };
    const world = makeWorld({ coins: [coin, { x: 500, y: 500, w: 20, h: 20 }] });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.score).toBe(1);
    expect(next.coins.length).toBe(2);
  });

  // story: score-coins — сценарий 3: несколько монеток
  it("picking up multiple coins increases score accordingly", () => {
    const coin1 = { x: 115, y: 100, w: 20, h: 20 };
    const coin2 = { x: 250, y: 100, w: 20, h: 20 };
    const world = makeWorld({ coins: [coin1, coin2] });
    
    let input: Input = { dx: 1, dy: 0 };
    let next = update(world, input, 0.1);
    expect(next.score).toBe(1);
    expect(next.coins.length).toBe(2);
    
    next = update(next, input, 0.7);
    expect(next.score).toBe(2);
    expect(next.coins.length).toBe(2);
  });

  // story: score-coins — сценарий 4: всегда 2 монетки
  it("always 2 coins on map - new one spawns when picked up", () => {
    const coin = { x: 115, y: 100, w: 20, h: 20 };
    const world = makeWorld({ coins: [coin, { x: 500, y: 500, w: 20, h: 20 }] });
    const input: Input = { dx: 1, dy: 0 };
    
    let next = update(world, input, 1);
    expect(next.coins.length).toBe(2);
    
    next = update(next, input, 1);
    expect(next.coins.length).toBe(2);
  });

  // story: score-coins — сценарий 5: счёт при смерти
  it("score persists after death and respawn", () => {
    const cactus = { x: 200, y: 100, w: 20, h: 20 };
    const coin = { x: 115, y: 100, w: 20, h: 20 };
    const world = makeWorld({
      player: { ...makeWorld().player, hp: 5, x: 100, y: 100 },
      cacti: [cactus],
      coins: [coin, { x: 500, y: 500, w: 20, h: 20 }],
      score: 2,
    });
    
    let input: Input = { dx: 1, dy: 0 };
    let next = update(world, input, 0.1);
    expect(next.score).toBe(3);
    expect(next.player.hp).toBe(5);
    
    next = update(next, input, 0.5);
    expect(next.player.hp).toBe(100);
    expect(next.player.x).toBe(100);
    expect(next.score).toBe(3);
  });

  // story: score-coins — сценарий 6 (значение): счёт растёт до 5; отображение — в hud.test.ts
  it("score value is tracked in world state", () => {
    const coin1 = { x: 115, y: 100, w: 20, h: 20 };
    const coin2 = { x: 300, y: 100, w: 20, h: 20 };
    const world = makeWorld({ coins: [coin1, coin2], score: 3 });
    
    const input: Input = { dx: 1, dy: 0 };
    let next = update(world, input, 0.1);
    expect(next.score).toBe(4);
    
    next = update(next, input, 0.9);
    expect(next.score).toBe(5);
  });
});

// story: river
describe("river", () => {
  // story: river — сценарий 1: река на карте
  it("river is present on the map", () => {
    const river = { x: 400, y: 0, w: 40, h: 600 };
    const world = makeWorld({ rivers: [river] });
    expect(world.rivers.length).toBe(1);
    expect(world.rivers[0].x).toBe(400);
    expect(world.rivers[0].w).toBe(40);
  });

  // story: river — сценарий 2: вода течёт
  it("water flows — flow offset changes over time", () => {
    const river = { x: 400, y: 0, w: 40, h: 600 };
    const world = makeWorld({ rivers: [river] });
    expect(world.riverFlowOffset).toBe(0);

    const input: Input = { dx: 0, dy: 0 };
    const next = update(world, input, 1);
    expect(next.riverFlowOffset).toBeGreaterThan(0);

    const next2 = update(next, input, 1);
    expect(next2.riverFlowOffset).toBeGreaterThan(next.riverFlowOffset);
  });

  // story: river — сценарий 3: не пройти
  it("player cannot pass through river", () => {
    const river = { x: 200, y: 0, w: 40, h: 600 };
    const world = makeWorld({ rivers: [river] });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.x + next.player.w).toBeLessThanOrEqual(200);
    expect(next.player.x + next.player.w).toBeCloseTo(200, 5);
  });

  // story: river — сценарий 4: скольжение вдоль берега
  it("player slides along river bank", () => {
    const river = { x: 200, y: 0, w: 40, h: 600 };
    const world = makeWorld({ rivers: [river] });
    const input: Input = { dx: 1, dy: 1 };
    const next = update(world, input, 1);
    expect(next.player.x + next.player.w).toBeLessThanOrEqual(200);
    expect(next.player.y).toBeGreaterThan(100);
  });

  // story: river — сценарий 5: река на месте
  it("river stays in place and does not grow", () => {
    const river = { x: 400, y: 0, w: 40, h: 600 };
    const world = makeWorld({ rivers: [river] });
    const input: Input = { dx: 0, dy: 0 };
    const next = update(world, input, 10);
    expect(next.rivers[0].x).toBe(400);
    expect(next.rivers[0].y).toBe(0);
    expect(next.rivers[0].w).toBe(40);
    expect(next.rivers[0].h).toBe(600);
  });
});

// story: bridge
describe("bridge", () => {
  const PLAYER_SIZE = 20;
  const river = { x: 200, y: 0, w: 40, h: 600 };
  const bridge = { x: 180, y: 60, w: 80, h: PLAYER_SIZE * 4 };

  // story: bridge — сценарий 1: мост на реке шириной 3-4 персонажа
  it("bridge is present on the river and is 3-4 player widths wide", () => {
    const world = makeWorld({ rivers: [river], bridges: [bridge] });
    expect(world.bridges.length).toBe(1);
    expect(world.bridges[0].h).toBeGreaterThanOrEqual(PLAYER_SIZE * 3);
    expect(world.bridges[0].h).toBeLessThanOrEqual(PLAYER_SIZE * 4);
  });

  // story: bridge — сценарий 2: проход по мосту
  it("player can cross the river via bridge", () => {
    const world = makeWorld({
      player: { ...makeWorld().player, x: 100, y: 100 },
      rivers: [river],
      bridges: [bridge],
    });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.x).toBeGreaterThan(240);
  });

  // story: bridge — сценарий 3: не пройти вне моста
  it("player cannot pass through river outside bridge", () => {
    const world = makeWorld({
      player: { ...makeWorld().player, x: 100, y: 300 },
      rivers: [river],
      bridges: [bridge],
    });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.x + next.player.w).toBeLessThanOrEqual(200);
    expect(next.player.x + next.player.w).toBeCloseTo(200, 5);
  });

  // story: bridge — сценарий 4: мост широкий — проход по верхнему краю
  it("player can cross at the top edge of the wide bridge", () => {
    const world = makeWorld({
      player: { ...makeWorld().player, x: 100, y: 60 },
      rivers: [river],
      bridges: [bridge],
    });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.x).toBeGreaterThan(240);
  });

  // story: bridge — сценарий 4: мост широкий — проход по центру
  it("player can cross at the center of the wide bridge", () => {
    const world = makeWorld({
      player: { ...makeWorld().player, x: 100, y: 100 },
      rivers: [river],
      bridges: [bridge],
    });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.x).toBeGreaterThan(240);
  });

  // story: bridge — сценарий 4: мост широкий — проход по нижнему краю
  it("player can cross at the bottom edge of the wide bridge", () => {
    const world = makeWorld({
      player: { ...makeWorld().player, x: 100, y: 120 },
      rivers: [river],
      bridges: [bridge],
    });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.player.x).toBeGreaterThan(240);
  });

  // story: bridge — сценарий 5: мост на месте
  it("bridge stays in place", () => {
    const world = makeWorld({ rivers: [river], bridges: [bridge] });
    const input: Input = { dx: 0, dy: 0 };
    const next = update(world, input, 10);
    expect(next.bridges[0].x).toBe(bridge.x);
    expect(next.bridges[0].y).toBe(bridge.y);
    expect(next.bridges[0].w).toBe(bridge.w);
    expect(next.bridges[0].h).toBe(bridge.h);
  });
});

// story: sword-attack
describe("sword-attack", () => {
  // story: sword-attack — сценарий 1: покой без меча
  it("sword is inactive when not attacking", () => {
    const world = makeWorld();
    const input: Input = { dx: 0, dy: 0, attack: false };
    const next = update(world, input, 1);
    expect(next.swordTimer).toBe(0);
    expect(next.swordCooldown).toBe(0);
  });

  // story: sword-attack — сценарий 2: замах в сторону движения
  it("sword swings in the direction of last movement", () => {
    const world = makeWorld();
    let input: Input = { dx: 1, dy: 0, attack: false };
    let next = update(world, input, 0.1);
    input = { dx: 0, dy: 0, attack: true };
    next = update(next, input, 0.01);
    expect(next.swordTimer).toBeGreaterThan(0);
    expect(next.swordDirection.dx).toBe(1);
    expect(next.swordDirection.dy).toBe(0);
  });

  // story: sword-attack — сценарий 3: удар убивает патрульного
  it("sword kills patrol in range", () => {
    const patrol = {
      x: 130, y: 100, w: 20, h: 20,
      startX: 130, startY: 100,
      endX: 300, endY: 100,
      speed: 0, progress: 0, direction: 1 as const,
    };
    const world = makeWorld({ patrols: [patrol] });
    const input: Input = { dx: 0, dy: 0, attack: true };
    const next = update(world, input, 0.01);
    expect(next.patrols.length).toBe(0);
  });

  // story: sword-attack — сценарий 4: удар срубает кактус
  it("sword kills cactus in range", () => {
    const cactus = { x: 130, y: 100, w: 20, h: 20 };
    const world = makeWorld({ cacti: [cactus] });
    const input: Input = { dx: 0, dy: 0, attack: true };
    const next = update(world, input, 0.01);
    expect(next.cacti.length).toBe(0);
  });

  // story: sword-attack — сценарий 5: промах
  it("sword does not hit enemy out of range", () => {
    const cactus = { x: 500, y: 100, w: 20, h: 20 };
    const world = makeWorld({ cacti: [cactus] });
    const input: Input = { dx: 0, dy: 0, attack: true };
    const next = update(world, input, 0.01);
    expect(next.cacti.length).toBe(1);
  });

  // story: sword-attack — сценарий 6: перезарядка
  it("sword has cooldown after attack", () => {
    const world = makeWorld();
    let input: Input = { dx: 0, dy: 0, attack: true };
    let next = update(world, input, 0.01);
    expect(next.swordCooldown).toBeGreaterThan(0);
    input = { dx: 0, dy: 0, attack: true };
    next = update(next, input, 0.01);
    expect(next.swordTimer).toBeLessThan(0.2);
  });

  // story: sword-attack — сценарий 7: направление по умолчанию
  it("sword swings right by default when no movement", () => {
    const world = makeWorld();
    const input: Input = { dx: 0, dy: 0, attack: true };
    const next = update(world, input, 0.01);
    expect(next.swordTimer).toBeGreaterThan(0);
    expect(next.swordDirection.dx).toBe(1);
    expect(next.swordDirection.dy).toBe(0);
  });
});

// story: levels
describe("levels", () => {
  // story: levels — сценарий 1: дверь появляется
  it("door appears when score reaches 10", () => {
    const world = makeWorld({ score: 9, door: { x: 700, y: 500, w: 40, h: 40, visible: false } });
    const coin = { x: 115, y: 100, w: 20, h: 20 };
    const worldWithCoin = { ...world, coins: [coin, { x: 500, y: 500, w: 20, h: 20 }] };
    const input: Input = { dx: 1, dy: 0 };
    const next = update(worldWithCoin, input, 1);
    expect(next.score).toBe(10);
    expect(next.door.visible).toBe(true);
  });

  // story: levels — сценарий 2: переход на следующий уровень
  it("player transitions to next level when entering door", () => {
    const world = makeWorld({
      score: 10,
      door: { x: 115, y: 100, w: 40, h: 40, visible: true },
      player: { ...makeWorld().player, hp: 50 },
    });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.level).toBe(2);
    expect(next.score).toBe(0);
    expect(next.player.hp).toBe(100);
    expect(next.player.x).toBe(100);
    expect(next.player.y).toBe(100);
  });

  // story: levels — сценарий 3: три уровня
  it("after level 3 returns to level 1", () => {
    const world = makeWorld({
      level: 3,
      score: 10,
      door: { x: 115, y: 100, w: 40, h: 40, visible: true },
    });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.level).toBe(1);
    expect(next.score).toBe(0);
    expect(next.player.hp).toBe(100);
  });

  // story: levels — сценарий 4: разные карты
  it("level 2 has different map than level 1", () => {
    const world = makeWorld({
      score: 10,
      door: { x: 115, y: 100, w: 40, h: 40, visible: true },
    });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.level).toBe(2);
    expect(next.walls.length).toBeGreaterThan(0);
  });

  // story: levels — сценарий 5: дверь исчезает при переходе
  it("door disappears after transitioning to new level", () => {
    const world = makeWorld({
      score: 10,
      door: { x: 115, y: 100, w: 40, h: 40, visible: true },
    });
    const input: Input = { dx: 1, dy: 0 };
    const next = update(world, input, 1);
    expect(next.door.visible).toBe(false);
  });

  // story: levels — сценарий 6: счёт для двери на каждом уровне
  it("door appears on level 2 when score reaches 10", () => {
    const world = makeWorld({
      level: 2,
      score: 9,
      door: { x: 700, y: 500, w: 40, h: 40, visible: false },
    });
    const coin = { x: 115, y: 100, w: 20, h: 20 };
    const worldWithCoin = { ...world, coins: [coin, { x: 500, y: 500, w: 20, h: 20 }] };
    const input: Input = { dx: 1, dy: 0 };
    const next = update(worldWithCoin, input, 1);
    expect(next.score).toBe(10);
    expect(next.door.visible).toBe(true);
  });
});
