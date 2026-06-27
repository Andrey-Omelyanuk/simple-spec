import { World } from "../sim/world.js";
import { update } from "../sim/update.js";
import { InputHandler } from "./input.js";
import { Renderer } from "./renderer.js";

export function startLoop(
  world: World,
  inputHandler: InputHandler,
  renderer: Renderer,
): void {
  let state = world;
  let lastTime = performance.now();

  function frame(now: number): void {
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    const input = inputHandler.getInput();
    state = update(state, input, dt);
    renderer.draw(state, now / 1000);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
