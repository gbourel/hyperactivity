import { Drawer, Slider } from "./drawer.js";
import { draw_plane, draw_movingPlane } from './plane.js';

// new Drawer(document.getElementById("plane_drawer"), draw_plane);
new Drawer(document.getElementById("plane_drawer"), draw_movingPlane);

