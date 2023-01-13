import { saturate } from "./matrix.js";

const SCALE = Math.min(2, window.devicePixelRatio || 1);

const action_angle = 20;
const fill0 = "#FCD561";
const fill1 = "#78AD6C";
const fill2 = "#5EAAD4";
const fill3 = "#D45E5E";
const stroke0 = "#555";

/**
 * Affiche un canvas dont la fonction de dessin est passée en paramètre.
 * @constructor
 * @param {DOMElement} container - L'élément DOM (eg. div) où créer le canvas.
 * @param {function} paint - La fonction d'affichage qui prends en paramètre context2D, largeur, hauteur et timestamps (em ms).
 * @param {Object} state - JSON object qui décrit l'état du modèle affiché.
 * @param {Object} options - JSON object qui décrit les paramètres de l'afficheur.
 */
export function Drawer(container, paint, state, options = { playable: true }) {
  var self = this;
  self.paint = paint;

  // let progress = 0.5; // TODO doc ?
  // this.set_progress = (val) => {
  //   progress = val;
  // }

  var wrapper = document.createElement("div");
  wrapper.classList.add("canvas_container");
  wrapper.classList.add("non_selectable");

  var canvas = document.createElement("canvas");
  canvas.classList.add("non_selectable");
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";

  wrapper.appendChild(canvas);

  let paused = true;

  if (options.playable) {
    let play = document.createElement("div");
    play.classList.add("play_pause_button");
    play.classList.add("playing");
    wrapper.appendChild(play);
    paused = false;

    this.set_paused = function (p) {
      paused = p;

      if (paused) {
        play.classList.remove("playing");
      } else {
        play.classList.add("playing");
        window.requestAnimationFrame(tick);
      }
    };
    play.onclick = function () {
      self.set_paused(!paused);
    };
  }

  container.appendChild(wrapper);

  let width, height;

  let font_size = 19;

  let t = 0;
  let prev_timestamp;

  let a = 0;
  let a2 = 0;
  let omega_max = 1 * Math.PI * 2;

  omega_max = 0.6;

  function tick(timestamp) {
    let rect = canvas.getBoundingClientRect();

    let wh = window.innerHeight || document.documentElement.clientHeight;
    let ww = window.innerWidth || document.documentElement.clientWidth;
    if (
      !(rect.top > wh || rect.bottom < 0 || rect.left > ww || rect.right < 0)
    ) {
      let dt = 0;
      if (prev_timestamp) dt = (timestamp - prev_timestamp) / 1000;
      t += dt;

      self.repaint();
    }
    prev_timestamp = timestamp;

    if (paused) prev_timestamp = undefined;
    else window.requestAnimationFrame(tick);
  }

  window.requestAnimationFrame(tick);

  this.repaint = function () {
    var ctx = canvas.getContext("2d");

    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(SCALE, SCALE);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = stroke0;

    font_size = 19;

    if (window.innerWidth < 500) font_size = 18;

    if (window.innerWidth < 400) font_size = 16;

    ctx.font = font_size + "px IBM Plex Sans";
    ctx.textAlign = "center";

    self.paint(ctx, width, height, t, state);
  };

  this.on_resize = function () {
    width = wrapper.clientWidth;
    height = wrapper.clientHeight;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = width * SCALE;
    canvas.height = height * SCALE;

    self.repaint();
  };

  document.fonts.load("10px IBM Plex Sans").then(function () {
    self.repaint();
  });

  this.on_resize();

  window.addEventListener("resize", this.on_resize, true);
  window.addEventListener("load", this.on_resize, true);
}

/**
 * Affiche un slider permettant l'interaction avec l'affichage.
 */
export function Slider(
  container_div,
  callback,
  style_prefix,
  default_value,
  disable_click,
) {
  let container = document.createElement("div");
  container.style.width = "100%";
  container.style.height = "0";
  container.style.position = "relative";
  container.classList.add("slider_container");
  if (style_prefix) container.classList.add(style_prefix + "slider_container");

  let left_gutter = document.createElement("div");
  left_gutter.classList.add("slider_left_gutter");
  if (style_prefix)
    left_gutter.classList.add(style_prefix + "slider_left_gutter");

  let right_gutter = document.createElement("div");
  right_gutter.classList.add("slider_right_gutter");
  if (style_prefix)
    right_gutter.classList.add(style_prefix + "slider_right_gutter");

  if (!disable_click) {
    left_gutter.onclick = mouse_click;
    right_gutter.onclick = mouse_click;
  }

  let knob_container = document.createElement("div");
  knob_container.style.width = "0";
  knob_container.style.height = "0";
  knob_container.style.top = "0";
  knob_container.style.position = "absolute";

  let knob = document.createElement("div");
  knob.classList.add("slider_knob");
  if (style_prefix) knob.classList.add(style_prefix + "slider_knob");

  container_div.appendChild(container);
  container.appendChild(left_gutter);
  container.appendChild(right_gutter);
  container.appendChild(knob_container);
  knob_container.appendChild(knob);

  window.addEventListener("resize", layout, true);
  window.addEventListener("load", layout, true);

  this.dragged = false;
  let self = this;

  let percentage = default_value === undefined ? 0.5 : default_value;

  layout();
  callback(percentage);

  this.set_value = function (p) {
    percentage = p;
    layout();
  };

  this.knob_div = function () {
    return knob;
  };

  function layout() {
    let width = container.getBoundingClientRect().width;

    left_gutter.style.width = width * percentage + "px";
    left_gutter.style.left = "0";

    right_gutter.style.width = width * (1.0 - percentage) + "px";
    right_gutter.style.left = width * percentage + "px";

    knob_container.style.left = width * percentage + "px";
  }

  let selection_offset;

  new TouchHandler(
    knob,
    function (e) {
      if (window.bc_touch_down_state) return false;

      e == e || window.event;
      let knob_rect = knob_container.getBoundingClientRect();
      selection_offset = e.clientX - knob_rect.left - knob_rect.width / 2;

      self.dragged = true;

      return true;
    },
    function (e) {
      let container_rect = container.getBoundingClientRect();
      let x = e.clientX - selection_offset - container_rect.left;

      let p = saturate(x / container_rect.width);

      if (percentage != p) {
        percentage = p;
        layout();
        callback(p);
      }

      return true;
    },
    function (e) {
      self.dragged = false;
    },
  );

  function mouse_click(e) {
    let container_rect = container.getBoundingClientRect();
    let x = e.clientX - container_rect.left;

    let p = Math.max(0, Math.min(1.0, x / container_rect.width));

    if (percentage != p) {
      percentage = p;
      layout();
      callback(p);
    }

    return true;
  }
}

function TouchHandler(target, begin, move, end) {
  target.addEventListener("mousedown", mouse_down, false);

  function mouse_down(e) {
    window.addEventListener("mousemove", mouse_move, false);
    window.addEventListener("mouseup", mouse_up, false);

    let res = begin ? begin(e) : true;

    if (res && e.preventDefault) e.preventDefault();
    return res;
  }

  function mouse_move(e) {
    return move ? move(e) : true;
  }

  function mouse_up(e) {
    window.removeEventListener("mousemove", mouse_move, false);
    window.removeEventListener("mouseup", mouse_up, false);

    return end ? end(e) : true;
  }

  target.addEventListener("touchstart", touch_down, false);

  let identifier;

  function touch_down(e) {
    if (!identifier) {
      window.addEventListener("touchmove", touch_move, false);
      window.addEventListener("touchend", touch_end, false);
      window.addEventListener("touchcancel", touch_end, false);
      let touch = e.changedTouches[0];

      identifier = touch.identifier;
      touch.timeStamp = e.timeStamp;

      let res = begin ? begin(touch) : true;

      if (res && e.preventDefault) e.preventDefault();
      return res;
    }
    return false;
  }

  function touch_move(e) {
    if (!move) return true;

    for (let i = 0; i < e.changedTouches.length; i++) {
      let touch = e.changedTouches[i];

      if (touch.identifier == identifier) {
        touch.timeStamp = e.timeStamp;

        return move(touch);
      }
    }
  }

  function touch_end(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      let touch = e.changedTouches[i];

      if (touch.identifier == identifier) {
        touch.timeStamp = e.timeStamp;

        identifier = undefined;

        window.removeEventListener("touchmove", touch_move, false);
        window.removeEventListener("touchend", touch_end, false);
        window.removeEventListener("touchcancel", touch_end, false);
        return end ? end(touch) : true;
      }
    }

    return true;
  }
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
};
CanvasRenderingContext2D.prototype.fillEllipse = function (x, y, r) {
  this.beginPath();
  this.ellipse(x, y, r, r, 0, 0, Math.PI * 2);
  this.fill();
};

CanvasRenderingContext2D.prototype.strokeEllipse = function (x, y, r) {
  this.beginPath();
  this.ellipse(x, y, r, r, 0, 0, Math.PI * 2);
  this.stroke();
};

CanvasRenderingContext2D.prototype.strokeLine = function (x0, y0, x1, y1) {
  this.beginPath();
  this.lineTo(x0, y0);
  this.lineTo(x1, y1);
  this.stroke();
};

CanvasRenderingContext2D.prototype.arrow = function (
  x0,
  y0,
  x1,
  y1,
  w,
  arrw,
  arrh,
) {
  let dx = x1 - x0;
  let dy = y1 - y0;

  let l = 1.0 / Math.sqrt(dx * dx + dy * dy);
  dx *= l;
  dy *= l;

  this.beginPath();
  this.moveTo(x0 - (dy * w) / 2, y0 + (dx * w) / 2);
  this.lineTo(x1 - (dy * w) / 2 - dx * arrh, y1 + (dx * w) / 2 - dy * arrh);
  this.lineTo(
    x1 - (dy * arrw) / 2 - dx * arrh,
    y1 + (dx * arrw) / 2 - dy * arrh,
  );
  this.lineTo(x1, y1);
  this.lineTo(
    x1 + (dy * arrw) / 2 - dx * arrh,
    y1 - (dx * arrw) / 2 - dy * arrh,
  );
  this.lineTo(x1 + (dy * w) / 2 - dx * arrh, y1 - (dx * w) / 2 - dy * arrh);
  this.lineTo(x0 + (dy * w) / 2, y0 - (dx * w) / 2);

  this.closePath();
  return this;
};

CanvasRenderingContext2D.prototype.feather = function (
  w,
  h,
  l,
  r,
  t,
  b,
  tx,
  ty,
) {
  this.save();
  this.resetTransform();
  this.globalAlpha = 1;

  if (tx !== undefined && ty !== undefined) this.translate(tx, ty);

  this.globalCompositeOperation = "destination-out";

  let grd;
  let n = 10;

  if (t) {
    grd = this.createLinearGradient(0, 0, 0, t);
    for (let i = 0; i <= n; i++) {
      let t = i / n;
      grd.addColorStop(
        1 - t,
        "rgba(0,0,0," + (t * t * t + 3 * (1 - t) * t * t * t) + ")",
      );
    }

    this.fillStyle = grd;
    this.fillRect(0, 0, w, t);
  }

  if (b) {
    grd = this.createLinearGradient(0, h - b, 0, h);
    for (let i = 0; i <= n; i++) {
      let t = i / n;
      grd.addColorStop(
        t,
        "rgba(0,0,0," + (t * t * t + 3 * (1 - t) * t * t * t) + ")",
      );
    }

    this.fillStyle = grd;
    this.fillRect(0, h - b, w, h);
  }

  if (l) {
    grd = this.createLinearGradient(0, 0, l, 0);
    for (let i = 0; i <= n; i++) {
      let t = i / n;
      grd.addColorStop(
        1 - t,
        "rgba(0,0,0," + (t * t * t + 3 * (1 - t) * t * t * t) + ")",
      );
    }

    this.fillStyle = grd;
    this.fillRect(0, 0, l, h);
  }

  if (r) {
    grd = this.createLinearGradient(w - r, 0, w, 0);
    for (let i = 0; i <= n; i++) {
      let t = i / n;
      grd.addColorStop(
        t,
        "rgba(0,0,0," + (t * t * t + 3 * (1 - t) * t * t * t) + ")",
      );
    }

    this.fillStyle = grd;
    this.fillRect(w - r, 0, r, h);
  }

  this.restore();
};

