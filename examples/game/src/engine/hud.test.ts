// story: score-coins
import { hud } from "./hud.js";
import { World } from "../sim/world.js";

function makeWorld(overrides: Partial<World> = {}): World {
  return {
    player: {
      x: 100, y: 100, w: 20, h: 20, speed: 200,
      hp: 100, maxHp: 100, spawnX: 100, spawnY: 100,
      invulnerableTimer: 0, animPhase: 0,
    },
    walls: [], cacti: [], patrols: [], hearts: [], coins: [], rivers: [], bridges: [],
    riverFlowOffset: 0,
    score: 0, rngState: 12345, mapWidth: 800, mapHeight: 600,
    swordTimer: 0, swordCooldown: 0, swordDirection: { dx: 1, dy: 0 },
    level: 1,
    door: { x: 700, y: 500, w: 40, h: 40, visible: false },
    ...overrides,
  };
}

describe("score-coins (HUD)", () => {
  // story: score-coins — сценарий 6: счёт на экране
  it("score is shown as a number in the top-right corner", () => {
    const world = makeWorld({ score: 5 });
    const item = hud(world).find((i) => i.corner === "top-right");
    expect(item).toBeDefined();
    expect(item!.text).toBe("Score: 5");
  });
});
