import { World, Patrol } from "../sim/world.js";
import { hud } from "./hud.js";

export class Renderer {
  constructor(private ctx: CanvasRenderingContext2D) {}

  draw(world: World, totalTime: number): void {
    const { ctx } = this;
    const { player, walls, cacti, patrols, mapWidth, mapHeight } = world;

    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, mapWidth, mapHeight);

    this.drawWalls(walls);
    this.drawCacti(cacti, totalTime);
    this.drawPatrols(patrols, totalTime);
    this.drawHearts(world.hearts, totalTime);
    this.drawCoins(world.coins, totalTime);
    this.drawPlayer(player);

    ctx.fillStyle = "#fff";
    ctx.font = "16px monospace";
    for (const item of hud(world)) {
      const x = item.corner === "top-right" ? mapWidth - 100 : 10;
      ctx.fillText(item.text, x, 20);
    }
  }

  private drawWalls(walls: { x: number; y: number; w: number; h: number }[]): void {
    const { ctx } = this;
    const blockSize = 20;

    for (const wall of walls) {
      for (let bx = 0; bx < wall.w; bx += blockSize) {
        for (let by = 0; by < wall.h; by += blockSize) {
          const bw = Math.min(blockSize, wall.w - bx);
          const bh = Math.min(blockSize, wall.h - by);
          const x = wall.x + bx;
          const y = wall.y + by;

          ctx.fillStyle = "#888";
          ctx.fillRect(x, y, bw, bh);

          ctx.fillStyle = "#aaa";
          ctx.fillRect(x, y, bw, 3);
          ctx.fillRect(x, y, 3, bh);

          ctx.fillStyle = "#555";
          ctx.fillRect(x, y + bh - 3, bw, 3);
          ctx.fillRect(x + bw - 3, y, 3, bh);
        }
      }
    }
  }

  private drawCacti(cacti: { x: number; y: number; w: number; h: number }[], totalTime: number): void {
    const { ctx } = this;

    for (const cactus of cacti) {
      const phase = cactus.x * 0.1 + cactus.y * 0.2;
      const amplitude = 0.05 + (cactus.x % 7) * 0.01;
      const frequency = 2 + (cactus.y % 5) * 0.3;
      const angle = Math.sin(totalTime * frequency + phase) * amplitude;

      ctx.save();
      ctx.translate(cactus.x + cactus.w / 2, cactus.y + cactus.h);
      ctx.rotate(angle);
      ctx.fillStyle = "#2a2";
      ctx.fillRect(-cactus.w / 2, -cactus.h, cactus.w, cactus.h);
      ctx.restore();
    }
  }

  private drawPatrols(patrols: Patrol[], totalTime: number): void {
    const { ctx } = this;

    for (const patrol of patrols) {
      const x = patrol.startX + (patrol.endX - patrol.startX) * patrol.progress;
      const y = patrol.startY + (patrol.endY - patrol.startY) * patrol.progress;

      const legOffset = Math.sin(totalTime * 8) * 3;
      const bodyH = patrol.h * 0.6;
      const legH = patrol.h * 0.4;
      const legW = patrol.w * 0.3;

      ctx.fillStyle = "#c33";
      ctx.fillRect(x, y, patrol.w, bodyH);

      ctx.fillStyle = "#822";
      ctx.fillRect(x + patrol.w * 0.2, y + bodyH, legW, legH + legOffset);
      ctx.fillRect(x + patrol.w * 0.5, y + bodyH, legW, legH - legOffset);
    }
  }

  private drawHearts(hearts: { x: number; y: number; w: number; h: number }[], totalTime: number): void {
    const { ctx } = this;

    for (const heart of hearts) {
      const pulse = 1 + Math.sin(totalTime * 4) * 0.1;
      const size = heart.w * pulse;
      const offsetX = (heart.w - size) / 2;
      const offsetY = (heart.h - size) / 2;

      ctx.fillStyle = "#f44";
      ctx.beginPath();
      const cx = heart.x + heart.w / 2;
      const cy = heart.y + heart.h / 2;
      const topY = cy - size * 0.3;
      ctx.moveTo(cx, cy + size * 0.4);
      ctx.bezierCurveTo(cx - size * 0.5, cy, cx - size * 0.5, topY, cx, topY + size * 0.1);
      ctx.bezierCurveTo(cx + size * 0.5, topY, cx + size * 0.5, cy, cx, cy + size * 0.4);
      ctx.fill();
    }
  }

  private drawCoins(coins: { x: number; y: number; w: number; h: number }[], totalTime: number): void {
    const { ctx } = this;

    for (const coin of coins) {
      const pulse = 1 + Math.sin(totalTime * 3 + coin.x * 0.1) * 0.1;
      const size = coin.w * pulse;

      ctx.fillStyle = "#fc0";
      ctx.beginPath();
      ctx.arc(coin.x + coin.w / 2, coin.y + coin.h / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#da0";
      ctx.beginPath();
      ctx.arc(coin.x + coin.w / 2, coin.y + coin.h / 2, size / 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawPlayer(player: { x: number; y: number; w: number; h: number; animPhase: number; invulnerableTimer: number }): void {
    const { ctx } = this;

    const isBlinking = player.invulnerableTimer > 0;
    const blinkVisible = !isBlinking || Math.floor(player.invulnerableTimer * 10) % 2 === 0;

    if (!blinkVisible) return;

    const legOffset = Math.sin(player.animPhase) * 3;
    const bodyX = player.x;
    const bodyY = player.y;
    const bodyW = player.w;
    const bodyH = player.h * 0.6;
    const legW = player.w * 0.3;
    const legH = player.h * 0.4;

    ctx.fillStyle = "#4f4";
    ctx.fillRect(bodyX, bodyY, bodyW, bodyH);

    ctx.fillStyle = "#2a2";
    ctx.fillRect(bodyX + bodyW * 0.2, bodyY + bodyH, legW, legH + legOffset);
    ctx.fillRect(bodyX + bodyW * 0.5, bodyY + bodyH, legW, legH - legOffset);
  }
}
