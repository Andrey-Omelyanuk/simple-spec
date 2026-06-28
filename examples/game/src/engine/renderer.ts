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
    this.drawRivers(world.rivers, world.riverFlowOffset);
    this.drawBridges(world.bridges);
    this.drawPortals(world.portals, totalTime);
    this.drawDoor(world.door, totalTime);
    this.drawCacti(cacti, totalTime);
    this.drawPatrols(patrols, totalTime);
    this.drawHearts(world.hearts, totalTime);
    this.drawCoins(world.coins, totalTime);
    this.drawSword(world);
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

  private drawRivers(rivers: { x: number; y: number; w: number; h: number }[], flowOffset: number): void {
    const { ctx } = this;

    for (const river of rivers) {
      ctx.fillStyle = "#26c";
      ctx.fillRect(river.x, river.y, river.w, river.h);

      ctx.strokeStyle = "#48f";
      ctx.lineWidth = 2;
      const isVertical = river.h > river.w;
      if (isVertical) {
        for (let col = 0; col < river.w; col += 12) {
          ctx.beginPath();
          for (let row = 0; row < river.h; row += 4) {
            const wave = Math.sin((row + flowOffset + col * 3) * 0.1) * 3;
            const x = river.x + col + wave;
            const y = river.y + row;
            if (row === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else {
        for (let row = 0; row < river.h; row += 12) {
          ctx.beginPath();
          for (let col = 0; col < river.w; col += 4) {
            const wave = Math.sin((col + flowOffset + row * 3) * 0.1) * 3;
            const x = river.x + col;
            const y = river.y + row + wave;
            if (col === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
    }
  }

  private drawBridges(bridges: { x: number; y: number; w: number; h: number }[]): void {
    const { ctx } = this;

    for (const bridge of bridges) {
      ctx.fillStyle = "#864";
      ctx.fillRect(bridge.x, bridge.y, bridge.w, bridge.h);

      ctx.fillStyle = "#a86";
      ctx.fillRect(bridge.x, bridge.y, bridge.w, 3);
      ctx.fillRect(bridge.x, bridge.y, 3, bridge.h);

      ctx.fillStyle = "#642";
      ctx.fillRect(bridge.x, bridge.y + bridge.h - 3, bridge.w, 3);
      ctx.fillRect(bridge.x + bridge.w - 3, bridge.y, 3, bridge.h);

      ctx.strokeStyle = "#753";
      ctx.lineWidth = 1;
      const isHorizontal = bridge.w > bridge.h;
      if (isHorizontal) {
        for (let col = 0; col < bridge.w; col += 10) {
          ctx.beginPath();
          ctx.moveTo(bridge.x + col, bridge.y);
          ctx.lineTo(bridge.x + col, bridge.y + bridge.h);
          ctx.stroke();
        }
      } else {
        for (let row = 0; row < bridge.h; row += 10) {
          ctx.beginPath();
          ctx.moveTo(bridge.x, bridge.y + row);
          ctx.lineTo(bridge.x + bridge.w, bridge.y + row);
          ctx.stroke();
        }
      }
    }
  }

  private drawPortals(portals: { x: number; y: number; w: number; h: number }[], totalTime: number): void {
    const { ctx } = this;

    for (const portal of portals) {
      const cx = portal.x + portal.w / 2;
      const cy = portal.y + portal.h / 2;
      const pulse = 1 + Math.sin(totalTime * 4) * 0.15;

      ctx.fillStyle = "#a3f";
      ctx.beginPath();
      ctx.arc(cx, cy, (portal.w / 2) * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#c6f";
      ctx.beginPath();
      ctx.arc(cx, cy, (portal.w / 3) * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#e9f";
      ctx.beginPath();
      ctx.arc(cx, cy, (portal.w / 6) * pulse, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawDoor(door: { x: number; y: number; w: number; h: number; visible: boolean }, totalTime: number): void {
    if (!door.visible) return;

    const { ctx } = this;
    const pulse = 1 + Math.sin(totalTime * 2) * 0.05;

    ctx.fillStyle = "#63f";
    ctx.fillRect(door.x, door.y, door.w, door.h);

    ctx.fillStyle = "#85f";
    ctx.fillRect(door.x + 3, door.y + 3, door.w - 6, door.h - 6);

    ctx.fillStyle = "#a7f";
    const knobSize = 4 * pulse;
    ctx.beginPath();
    ctx.arc(door.x + door.w * 0.7, door.y + door.h * 0.5, knobSize, 0, Math.PI * 2);
    ctx.fill();
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

  private drawSword(world: World): void {
    if (world.swordTimer <= 0) return;

    const { ctx } = this;
    const { player, swordDirection } = world;
    const swordLength = 30;
    const { dx, dy } = swordDirection;

    ctx.fillStyle = "#ccc";

    if (dx > 0) {
      ctx.fillRect(player.x + player.w, player.y + 2, swordLength, player.h - 4);
    } else if (dx < 0) {
      ctx.fillRect(player.x - swordLength, player.y + 2, swordLength, player.h - 4);
    }

    if (dy > 0) {
      ctx.fillRect(player.x + 2, player.y + player.h, player.w - 4, swordLength);
    } else if (dy < 0) {
      ctx.fillRect(player.x + 2, player.y - swordLength, player.w - 4, swordLength);
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
