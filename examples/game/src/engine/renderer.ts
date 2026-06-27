import { World } from "../sim/world.js";

export class Renderer {
  constructor(private ctx: CanvasRenderingContext2D) {}

  draw(world: World): void {
    const { ctx } = this;
    const { player, walls, cacti, mapWidth, mapHeight } = world;

    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, mapWidth, mapHeight);

    ctx.fillStyle = "#888";
    for (const wall of walls) {
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    }

    ctx.fillStyle = "#2a2";
    for (const cactus of cacti) {
      ctx.fillRect(cactus.x, cactus.y, cactus.w, cactus.h);
    }

    const isBlinking = player.invulnerableTimer > 0;
    const blinkVisible = !isBlinking || Math.floor(player.invulnerableTimer * 10) % 2 === 0;

    if (blinkVisible) {
      ctx.fillStyle = "#4f4";
      ctx.fillRect(player.x, player.y, player.w, player.h);
    }

    ctx.fillStyle = "#fff";
    ctx.font = "16px monospace";
    ctx.fillText(`HP: ${player.hp}`, 10, 20);
  }
}
