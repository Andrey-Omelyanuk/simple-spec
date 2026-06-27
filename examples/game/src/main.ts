import { createWorld } from "./sim/world.js";
import { InputHandler } from "./engine/input.js";
import { Renderer } from "./engine/renderer.js";
import { startLoop } from "./engine/loop.js";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const world = createWorld();
world.walls = [
  { x: 300, y: 100, w: 20, h: 200 },
  { x: 500, y: 300, w: 200, h: 20 },
  { x: 150, y: 400, w: 20, h: 150 },
];
world.cacti = [
  { x: 200, y: 200, w: 20, h: 20 },
  { x: 400, y: 150, w: 20, h: 20 },
  { x: 600, y: 400, w: 20, h: 20 },
  { x: 250, y: 500, w: 20, h: 20 },
];

const inputHandler = new InputHandler();
const renderer = new Renderer(ctx);

startLoop(world, inputHandler, renderer);
