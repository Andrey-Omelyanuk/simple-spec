import { Rect } from "./world.js";

export function clampToMap(
  x: number,
  y: number,
  w: number,
  h: number,
  mapWidth: number,
  mapHeight: number,
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(x, mapWidth - w)),
    y: Math.max(0, Math.min(y, mapHeight - h)),
  };
}

export function resolveX(
  px: number,
  py: number,
  pw: number,
  ph: number,
  newX: number,
  walls: Rect[],
): number {
  if (newX > px) {
    let best = newX;
    for (const wall of walls) {
      if (
        wall.x >= px + pw &&
        wall.x <= newX + pw &&
        py < wall.y + wall.h &&
        py + ph > wall.y
      ) {
        best = Math.min(best, wall.x - pw);
      }
    }
    return best;
  }
  if (newX < px) {
    let best = newX;
    for (const wall of walls) {
      if (
        wall.x + wall.w <= px &&
        wall.x + wall.w > newX &&
        py < wall.y + wall.h &&
        py + ph > wall.y
      ) {
        best = Math.max(best, wall.x + wall.w);
      }
    }
    return best;
  }
  return px;
}

export function resolveY(
  px: number,
  py: number,
  pw: number,
  ph: number,
  newY: number,
  walls: Rect[],
): number {
  if (newY > py) {
    let best = newY;
    for (const wall of walls) {
      if (
        wall.y >= py + ph &&
        wall.y <= newY + ph &&
        px < wall.x + wall.w &&
        px + pw > wall.x
      ) {
        best = Math.min(best, wall.y - ph);
      }
    }
    return best;
  }
  if (newY < py) {
    let best = newY;
    for (const wall of walls) {
      if (
        wall.y + wall.h <= py &&
        wall.y + wall.h > newY &&
        px < wall.x + wall.w &&
        px + pw > wall.x
      ) {
        best = Math.max(best, wall.y + wall.h);
      }
    }
    return best;
  }
  return py;
}
