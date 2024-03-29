import * as object from './object.js'
import { Vector } from './util/Vector.js'
import Player from './Player.js'
import { boxIntersect, Ray } from './util/raycasts.js'
import { camera } from './render.js'
import { ctx, W, H } from './canvas.js';
import { mousePos, getKeyCode } from './input.js'
import { gameOptions } from './state.js'
import { options } from './ui/ui.js'

/**
 * 
 * @param {Player} player Player
 * @param {*} prevPos 
 */
export const doPlayerPhysics = (player, dt) => { // FIXME: perfect edge intersections allow players to glitch through
  // const ray = new Ray(locPlayer.pos, mousePos.subtract(new Vector(W / 2, H / 2)));
  const vel = new Vector(player.velocity.x, player.velocity.y);
  // let vel = mousePos.subtract(new Vector(W / 2, H / 2));
  // vel.multiplyBy(1 * dt);
  vel.multiplyBy(gameOptions.player_speed);

  const ray = new Ray(player.pos, vel.multiply(dt));

  ctx.setTransform(camera.zoom, 0, 0, camera.zoom, -camera.pos.x * camera.zoom, -camera.pos.y * camera.zoom);
  if (options.drawCollInfo) {
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 0.05;
    ctx.beginPath();
    ctx.moveTo(ray.origin.x, ray.origin.y);
    ctx.lineTo(ray.origin.x + ray.dir.x, ray.origin.y + ray.dir.y)
    ctx.stroke();
    ctx.fillStyle = "purple";
  }

  for (let obj of object.gameObjects) {

    const hit = boxIntersect(ray, obj.pos, obj.bounds);
    if (hit) {
      /*
        Vn = (V . N) * N
        Vt = V - Vn
        
        V -= (1.0f + restitution) * Vn + (drag * Vt);
      */
      const a = vel;
      const b = hit.tangent;
      const dp = -hit.normal.dotProduct(vel).toPrecision(4);
      vel.x = b.x * dp;
      vel.y = b.y * dp;
      if (options.drawCollInfo) {
        ctx.fillRect(hit.point.x, hit.point.y, 0.1, 0.1)

        ctx.strokeStyle = "pink";
        ctx.beginPath()
        ctx.moveTo(hit.point.x, hit.point.y)
        ctx.lineTo(hit.point.x + hit.normal.x, hit.point.y + hit.normal.y);
        ctx.stroke();
        ctx.strokeStyle = "orange";
        ctx.beginPath()
        ctx.moveTo(hit.point.x, hit.point.y)
        ctx.lineTo(hit.point.x + hit.tangent.x, hit.point.y + hit.tangent.y);
        ctx.stroke();

        ctx.fillStyle = "black";
        ctx.font = "0.5px 'Roboto Mono'";
        ctx.fillText(dp.toFixed(2), player.pos.x, player.pos.y);
        ctx.strokeStyle = "rgba(0,255,0,0.5)";
        ctx.beginPath()
        ctx.moveTo(player.pos.x, player.pos.y)
        ctx.lineTo(hit.point.x + vel.x, hit.point.y + vel.y);
        ctx.stroke();
      }
    }
  }

  player.pos.addTo(vel.multiply(dt))
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}