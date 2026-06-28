import { Input } from "../sim/world.js";

const keyMap: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  KeyW: [0, -1],
  KeyS: [0, 1],
  KeyA: [-1, 0],
  KeyD: [1, 0],
};

export class InputHandler {
  private pressed = new Set<string>();

  constructor() {
    window.addEventListener("keydown", (e) => this.pressed.add(e.code));
    window.addEventListener("keyup", (e) => this.pressed.delete(e.code));
    window.addEventListener("blur", () => this.pressed.clear());
  }

  getInput(): Input {
    let dx = 0;
    let dy = 0;
    for (const [code, [mx, my]] of Object.entries(keyMap)) {
      if (this.pressed.has(code)) {
        dx += mx;
        dy += my;
      }
    }
    const attack = this.pressed.has("Space");
    return { dx: Math.sign(dx), dy: Math.sign(dy), attack };
  }
}
