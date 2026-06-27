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
