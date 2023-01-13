import { Drawer, Slider } from "./js/drawer.js";
import { draw_gear, draw_driver, draw_fan } from './js/gears.js';
import { draw_car_top, draw_car_back, draw_cone_top, draw_cone_back } from './js/car.js';

const fill0 = "#FCD561";
const fill1 = "#78AD6C";
const fill2 = "#5EAAD4";
const fill3 = "#D45E5E";
const stroke0 = "#555";

const mainElt = document.querySelector('main');

let font_size = 19;

/// Crée un élément div pour un afficheur
function createDrawerContainer(parent) {
  var container = document.createElement("div");
  container.classList.add("drawer_container");
  mainElt.appendChild(container);
  return container;
}
/// Crée un élément div
function createDiv(parent) {
  var container = document.createElement("div");
  mainElt.appendChild(container);
  return container;
}

/********/
/* DEMO */
/********/

// Voiture (non playable)
let carState = {
  pos: 0
}
let demo1 = new Drawer(createDrawerContainer(mainElt), car_demo, carState, {
  'playable': false
});
new Slider(createDiv(mainElt), function (x) {
    carState.pos = x;
    demo1.repaint(); // not playable, force redraw
});

// // Engrenages
new Drawer(createDrawerContainer(mainElt), gears_demo);

// // Ventilateur
let fanState = {
    speed: 0.5,  // Current rotation speed
    angle: 0     // Current fan angle
};
new Drawer(createDrawerContainer(mainElt), fan_demo, fanState);
new Slider(createDiv(mainElt), function (x) {
    fanState.speed = x;
});


/*********** Fonctions de dessin. *************/

var prev_car_pos = 0;

function car_demo(ctx, width, height, t, state) {
  ctx.translate(Math.round(width * 0.5), Math.round(height * 0.25));

  let currentPos = state.pos;

  let s = width / 650;
  let d = currentPos * 340 - 5;

  ctx.strokeStyle = "#444";

  ctx.save();
  ctx.scale(s, s);
  ctx.strokeEllipse(-260, 0, 50);

  let a = Math.atan2(31 + currentPos * 1.5, 75 + d);
  let ca = Math.cos(a);
  let sa = Math.sin(a);

  let dd = d + 130;

  ctx.lineWidth = 1.0/s;

  ctx.save();
  ctx.setLineDash([2, 2]);

  ctx.beginPath();
  ctx.moveTo(-260, 0);
  ctx.lineTo(-260 + dd * ca, dd * sa);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-260, 0);
  ctx.lineTo(-260 + dd * ca, -dd * sa);
  ctx.stroke();
  ctx.restore();

  ctx.lineWidth = 2.5/s;
  ctx.strokeStyle = "#E9A923";
  ctx.beginPath();
  ctx.arc(-260, 0, 50, -a, a);
  ctx.stroke();

  ctx.font = font_size * 0.9/s + "px IBM Plex Sans";

  ctx.fillStyle = "#E9A923";
  ctx.fillText(Math.round(2 * a * 180 / Math.PI) + "°", -210, 60);

  ctx.fillStyle = "#B42626";
  ctx.fillEllipse(-260, 0, 6);


  {
      ctx.save();
      ctx.translate(-110 + d, 0);
      ctx.rotate(Math.PI * 0.5);
      draw_car_top(ctx)
      ctx.restore();

      ctx.translate(-240, 70);

      for (let i = 0; i < 5; i++) {
          ctx.translate(100, -140);
          draw_cone_top(ctx);
          ctx.translate(0, +140);
          draw_cone_top(ctx);
      }
  }

  ctx.restore();

  ctx.translate(0, Math.round(height * 0.25));

  ctx.strokeStyle = "#222";
  ctx.beginPath();
  ctx.moveTo(-width, 0);
  ctx.lineTo(width, 0);
  ctx.stroke();


  ctx.translate(0, Math.round(height * 0.25));

  {
      ctx.save();
      ctx.scale(s, s);

      let frac = 7;

      for (let i = 0; i < 5; i++) {
          let x = 230 + 174 * i;
          let y = 70;
          let cone_a = Math.atan2(y, x);
          let cone_s = cone_a * frac;

          ctx.save();
          ctx.scale(cone_s, cone_s);

          ctx.translate(-y, 0);
          draw_cone_back(ctx);
          ctx.translate(2 * y, 0);
          draw_cone_back(ctx);
          ctx.restore();
      }

      s = a * frac;
      ctx.scale(s, s);
      draw_car_back(ctx, currentPos < prev_car_pos && currentPos > 0);
      ctx.restore();
  }

  prev_car_pos = currentPos;
}

/** Un ventilateur. */
function fan_demo(ctx, width, height, t, state) {
    ctx.translate(width * 0.5, height * 0.42);

    var size = width/100 * 0.2;

    ctx.scale (size, size);
    ctx.lineWidth = 1.5/size;

    draw_fan(ctx, -t, state);
}

/**
 * Demonstration de roues dentées.
 */
function gears_demo(ctx, width, height, t) {
  ctx.translate(width * 0.5, height * 0.48);

  let size = width * 0.54;
  ctx.translate(-size * 0.61, size * 0.11);

  ctx.rotate(-Math.PI * 0.13);

  // nombre de dents

  let n1 = 20;
  let n2 = 12;
  let n3 = 20;
  let n4 = 28;

  // rayons (module 0.26)

  let r1 = size * 0.26;
  let r2 = (r1 * n2) / n1;
  let r3 = (r1 * n3) / n1;
  let r4 = (r1 * n4) / n1;

  let a = t;

  let ang = Math.PI * 0.25;

  let d1 = (r1 + r2) * Math.cos(ang);
  let d2 = r2 + r3;
  let d = Math.sqrt(d2 * d2 - d1 * d1);

  ctx.save();

  ctx.rotate(ang);
  ctx.translate(r1 + r2, 0);
  ctx.rotate((-a * n1) / n2 + Math.PI * 0.5);

  draw_gear(ctx, r2, n2, fill2);

  ctx.restore();

  ctx.save();

  ctx.rotate(-ang);
  ctx.translate(r1 + r2, 0);
  ctx.rotate((-a * n1) / n2 + Math.PI);

  draw_gear(ctx, r2, n2, fill2);

  ctx.restore();

  ctx.save();

  ctx.rotate(a + Math.PI / 2);

  draw_gear(ctx, r1, n1, fill0);
  draw_driver(ctx);

  ctx.restore();

  ctx.translate((r1 + r2) * Math.cos(ang) + d, 0);

  ctx.save();

  ctx.rotate((a * n1) / n3 + Math.PI / 2);

  draw_gear(ctx, r3, n3, fill3);

  ctx.restore();

  ctx.save();

  ctx.rotate(Math.PI / 4);

  ctx.translate(r3 + r4, 0);
  ctx.rotate((-a * n1) / n4 + Math.PI / 2);

  draw_gear(ctx, r4, n4, fill1);

  ctx.restore();
}
