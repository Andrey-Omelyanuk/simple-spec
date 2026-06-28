import { World } from "../sim/world.js";

export interface HudItem {
  text: string;
  corner: "top-left" | "top-right";
}

// Чистое решение «что и где показать» в HUD. Сами пиксели рисует renderer.
export function hud(world: World): HudItem[] {
  return [
    { text: `HP: ${world.player.hp}`, corner: "top-left" },
    { text: `Score: ${world.score}`, corner: "top-right" },
  ];
}
