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
    score: 0,
    rngState: 12345,
    mapWidth: 800,
    mapHeight: 600,
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
