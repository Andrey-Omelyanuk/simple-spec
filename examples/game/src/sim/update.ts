import { World, Input, Cactus, Patrol, Rect, Heart, Coin, River, Bridge } from "./world.js";
import { clampToMap, resolveX, resolveY } from "./collision.js";

function nextRng(state: number): { value: number; state: number } {
  const newState = (state * 1664525 + 1013904223) & 0xffffffff;
  return { value: (newState >>> 0) / 0x100000000, state: newState };
}

function spawnCoin(world: World): { coin: Coin; rngState: number } {
  const margin = 40;
  let { value: rx, state: s1 } = nextRng(world.rngState);
  let { value: ry, state: s2 } = nextRng(s1);
  
  const x = margin + rx * (world.mapWidth - margin * 2);
  const y = margin + ry * (world.mapHeight - margin * 2);
  
  return { coin: { x, y, w: 20, h: 20 }, rngState: s2 };
}

function rectIntersects(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function subtractRect(a: Rect, b: Rect): Rect[] {
  if (!rectIntersects(a.x, a.y, a.w, a.h, b.x, b.y, b.w, b.h)) return [a];

  const ix1 = Math.max(a.x, b.x);
  const iy1 = Math.max(a.y, b.y);
  const ix2 = Math.min(a.x + a.w, b.x + b.w);
  const iy2 = Math.min(a.y + a.h, b.y + b.h);

  const result: Rect[] = [];

  if (ix1 > a.x) {
    result.push({ x: a.x, y: a.y, w: ix1 - a.x, h: a.h });
  }
  if (ix2 < a.x + a.w) {
    result.push({ x: ix2, y: a.y, w: (a.x + a.w) - ix2, h: a.h });
  }
  if (iy1 > a.y) {
    result.push({ x: ix1, y: a.y, w: ix2 - ix1, h: iy1 - a.y });
  }
  if (iy2 < a.y + a.h) {
    result.push({ x: ix1, y: iy2, w: ix2 - ix1, h: (a.y + a.h) - iy2 });
  }

  return result;
}

function buildObstacles(walls: Rect[], rivers: Rect[], bridges: Rect[]): Rect[] {
  let riverObstacles: Rect[] = [...rivers];
  for (const bridge of bridges) {
    const next: Rect[] = [];
    for (const segment of riverObstacles) {
      next.push(...subtractRect(segment, bridge));
    }
    riverObstacles = next;
  }
  return [...walls, ...riverObstacles];
}

function resolveCactusCollision(
  oldX: number,
  oldY: number,
  newX: number,
  newY: number,
  playerW: number,
  playerH: number,
  cactus: Cactus,
): { x: number; y: number; collided: boolean } {
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = oldX + (newX - oldX) * t;
    const y = oldY + (newY - oldY) * t;

    if (rectIntersects(x, y, playerW, playerH, cactus.x, cactus.y, cactus.w, cactus.h)) {
      const playerCenterX = x + playerW / 2;
      const playerCenterY = y + playerH / 2;
      const cactusCenterX = cactus.x + cactus.w / 2;
      const cactusCenterY = cactus.y + cactus.h / 2;

      const dx = playerCenterX - cactusCenterX;
      const dy = playerCenterY - cactusCenterY;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len === 0) {
        return { x: oldX, y: oldY, collided: true };
      }

      const ndx = dx / len;
      const ndy = dy / len;

      const moveDx = newX - oldX;
      const moveDy = newY - oldY;
      const bounceDistance = Math.sqrt(moveDx * moveDx + moveDy * moveDy);
      const bounceX = x + ndx * bounceDistance;
      const bounceY = y + ndy * bounceDistance;

      return { x: bounceX, y: bounceY, collided: true };
    }
  }

  return { x: newX, y: newY, collided: false };
}

function getPatrolPosition(patrol: Patrol): { x: number; y: number } {
  const t = patrol.progress;
  return {
    x: patrol.startX + (patrol.endX - patrol.startX) * t,
    y: patrol.startY + (patrol.endY - patrol.startY) * t,
  };
}

function updatePatrols(patrols: Patrol[], dt: number, walls: Rect[], mapWidth: number, mapHeight: number): Patrol[] {
  return patrols.map((patrol) => {
    const dx = patrol.endX - patrol.startX;
    const dy = patrol.endY - patrol.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return patrol;

    const progressDelta = (patrol.speed * dt * patrol.direction) / distance;
    let newProgress = patrol.progress + progressDelta;
    let newDirection = patrol.direction;

    if (newProgress >= 1) {
      newProgress = 1;
      newDirection = -1;
    } else if (newProgress <= 0) {
      newProgress = 0;
      newDirection = 1;
    }

    const oldPos = getPatrolPosition(patrol);
    const tempPatrol = { ...patrol, progress: newProgress };
    const newPos = getPatrolPosition(tempPatrol);
    
    let x = newPos.x;
    let y = newPos.y;
    
    const clamped = clampToMap(x, y, patrol.w, patrol.h, mapWidth, mapHeight);
    x = clamped.x;
    y = clamped.y;
    
    x = resolveX(oldPos.x, oldPos.y, patrol.w, patrol.h, x, walls);
    y = resolveY(x, oldPos.y, patrol.w, patrol.h, y, walls);

    if (x !== newPos.x || y !== newPos.y) {
      newDirection = (newDirection * -1) as 1 | -1;
      newProgress = patrol.progress;
    }

    return { ...patrol, progress: newProgress, direction: newDirection };
  });
}

export function update(world: World, input: Input, dt: number): World {
  const { player, walls, cacti, patrols, rivers, bridges, mapWidth, mapHeight } = world;

  const obstacles = buildObstacles(walls, rivers, bridges);

  const updatedPatrols = updatePatrols(patrols, dt, obstacles, mapWidth, mapHeight);

  const riverFlowOffset = world.riverFlowOffset + dt * 50;

  const invulnerableTimer = Math.max(0, player.invulnerableTimer - dt);

  const len = Math.sqrt(input.dx * input.dx + input.dy * input.dy);
  const ndx = len > 0 ? input.dx / len : 0;
  const ndy = len > 0 ? input.dy / len : 0;

  const moveX = ndx * player.speed * dt;
  const moveY = ndy * player.speed * dt;

  let x = player.x + moveX;
  x = clampToMap(x, player.y, player.w, player.h, mapWidth, mapHeight).x;
  x = resolveX(player.x, player.y, player.w, player.h, x, obstacles);

  let y = player.y + moveY;
  y = clampToMap(x, y, player.w, player.h, mapWidth, mapHeight).y;
  y = resolveY(x, player.y, player.w, player.h, y, obstacles);

  let hp = player.hp;
  let bounced = false;
  let tookDamage = false;

  for (const cactus of cacti) {
    const result = resolveCactusCollision(player.x, player.y, x, y, player.w, player.h, cactus);
    if (result.collided) {
      x = result.x;
      y = result.y;
      bounced = true;

      if (invulnerableTimer <= 0) {
        hp -= 10;
        tookDamage = true;
      }

      x = clampToMap(x, y, player.w, player.h, mapWidth, mapHeight).x;
      x = resolveX(player.x, y, player.w, player.h, x, obstacles);
      y = clampToMap(x, y, player.w, player.h, mapWidth, mapHeight).y;
      y = resolveY(x, player.y, player.w, player.h, y, obstacles);
    }
  }

  for (const patrol of updatedPatrols) {
    const pos = getPatrolPosition(patrol);
    const patrolRect = { x: pos.x, y: pos.y, w: patrol.w, h: patrol.h };
    const result = resolveCactusCollision(player.x, player.y, x, y, player.w, player.h, patrolRect);
    if (result.collided) {
      x = result.x;
      y = result.y;
      bounced = true;

      if (invulnerableTimer <= 0) {
        hp -= 10;
        tookDamage = true;
      }

      x = clampToMap(x, y, player.w, player.h, mapWidth, mapHeight).x;
      x = resolveX(player.x, y, player.w, player.h, x, obstacles);
      y = clampToMap(x, y, player.w, player.h, mapWidth, mapHeight).y;
      y = resolveY(x, player.y, player.w, player.h, y, obstacles);
    }
  }

  if (tookDamage) {
    hp = Math.max(0, hp);
  }

  let finalX = x;
  let finalY = y;
  let finalHp = hp;
  let finalInvulnerableTimer = tookDamage ? 1 : invulnerableTimer;
  let finalAnimPhase = player.animPhase;

  const moved = Math.abs(x - player.x) > 0.01 || Math.abs(y - player.y) > 0.01;
  if (moved) {
    finalAnimPhase += dt * 10;
  }

  let remainingHearts = [...world.hearts];
  for (let i = remainingHearts.length - 1; i >= 0; i--) {
    const heart = remainingHearts[i];
    const steps = 10;
    let collected = false;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const checkX = player.x + (finalX - player.x) * t;
      const checkY = player.y + (finalY - player.y) * t;
      if (rectIntersects(checkX, checkY, player.w, player.h, heart.x, heart.y, heart.w, heart.h)) {
        collected = true;
        break;
      }
    }
    if (collected && finalHp < player.maxHp) {
      finalHp = Math.min(player.maxHp, finalHp + 10);
      remainingHearts.splice(i, 1);
    }
  }

  let finalScore = world.score;
  let remainingCoins = [...world.coins];
  let currentRngState = world.rngState;
  
  for (let i = remainingCoins.length - 1; i >= 0; i--) {
    const coin = remainingCoins[i];
    const steps = 10;
    let collected = false;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const checkX = player.x + (finalX - player.x) * t;
      const checkY = player.y + (finalY - player.y) * t;
      if (rectIntersects(checkX, checkY, player.w, player.h, coin.x, coin.y, coin.w, coin.h)) {
        collected = true;
        break;
      }
    }
    if (collected) {
      finalScore += 1;
      remainingCoins.splice(i, 1);
      const spawnResult = spawnCoin({ ...world, coins: remainingCoins, rngState: currentRngState });
      remainingCoins.push(spawnResult.coin);
      currentRngState = spawnResult.rngState;
    }
  }

  if (hp <= 0) {
    finalX = player.spawnX;
    finalY = player.spawnY;
    finalHp = player.maxHp;
    finalInvulnerableTimer = 0;
    finalAnimPhase = 0;
  }

  return {
    ...world,
    player: { ...player, x: finalX, y: finalY, hp: finalHp, invulnerableTimer: finalInvulnerableTimer, animPhase: finalAnimPhase },
    patrols: updatedPatrols,
    hearts: remainingHearts,
    coins: remainingCoins,
    riverFlowOffset,
    score: finalScore,
    rngState: currentRngState,
  };
}
