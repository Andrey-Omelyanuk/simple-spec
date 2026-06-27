import { World, Input, Cactus } from "./world.js";
import { clampToMap, resolveX, resolveY } from "./collision.js";

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

export function update(world: World, input: Input, dt: number): World {
  const { player, walls, cacti, mapWidth, mapHeight } = world;

  const invulnerableTimer = Math.max(0, player.invulnerableTimer - dt);

  const len = Math.sqrt(input.dx * input.dx + input.dy * input.dy);
  const ndx = len > 0 ? input.dx / len : 0;
  const ndy = len > 0 ? input.dy / len : 0;

  const moveX = ndx * player.speed * dt;
  const moveY = ndy * player.speed * dt;

  let x = player.x + moveX;
  x = clampToMap(x, player.y, player.w, player.h, mapWidth, mapHeight).x;
  x = resolveX(player.x, player.y, player.w, player.h, x, walls);

  let y = player.y + moveY;
  y = clampToMap(x, y, player.w, player.h, mapWidth, mapHeight).y;
  y = resolveY(x, player.y, player.w, player.h, y, walls);

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
      x = resolveX(player.x, y, player.w, player.h, x, walls);
      y = clampToMap(x, y, player.w, player.h, mapWidth, mapHeight).y;
      y = resolveY(x, player.y, player.w, player.h, y, walls);
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
  };
}
