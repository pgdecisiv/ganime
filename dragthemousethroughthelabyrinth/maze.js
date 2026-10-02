const svg = document.querySelector("#maze");
const wallLayer = document.querySelector("#maze-walls");
const draggable = document.querySelector("#mouse-drag");
const nextLevel = document.querySelector("#next-level");
const columns = 14;
const rows = 8;
const cellSize = 50;
const startCell = { x: 0, y: 4 };
const exitCell = { x: 13, y: 3 };
const mice = {
  arrows: { element: document.querySelector("#mouse-arrows"), x: 18, y: 225 },
  wasd: { element: document.querySelector("#mouse-wasd"), x: 25, y: 225 },
  drag: { element: draggable, x: 32, y: 225 },
};
const walls = [];
const grid = Array.from({ length: rows }, () => Array.from({ length: columns }, () => ({
  visited: false,
  N: true,
  E: true,
  S: true,
  W: true,
})));

// A seeded depth-first carve makes a branching maze with repeatable dead ends.
let randomState = 0x6d2b79f5;
function random() {
  randomState += 0x6d2b79f5;
  let value = randomState;
  value = Math.imul(value ^ value >>> 15, value | 1);
  value ^= value + Math.imul(value ^ value >>> 7, value | 61);
  return ((value ^ value >>> 14) >>> 0) / 4294967296;
}

function carve(x, y) {
  const cell = grid[y][x];
  cell.visited = true;
  const options = [
    { dx: 0, dy: -1, here: "N", there: "S" },
    { dx: 1, dy: 0, here: "E", there: "W" },
    { dx: 0, dy: 1, here: "S", there: "N" },
    { dx: -1, dy: 0, here: "W", there: "E" },
  ].sort(() => random() - .5);
  for (const direction of options) {
    const nx = x + direction.dx;
    const ny = y + direction.dy;
    if (nx < 0 || nx >= columns || ny < 0 || ny >= rows || grid[ny][nx].visited) continue;
    cell[direction.here] = false;
    grid[ny][nx][direction.there] = false;
    carve(nx, ny);
  }
}
carve(startCell.x, startCell.y);

function addWall(x1, y1, x2, y2) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("class", "maze-wall");
  wallLayer.append(line);
  walls.push({ x1, y1, x2, y2 });
}

for (let y = 0; y < rows; y += 1) {
  for (let x = 0; x < columns; x += 1) {
    const cell = grid[y][x];
    const left = x * cellSize;
    const top = y * cellSize;
    if (cell.N && y === 0) addWall(left, top, left + cellSize, top);
    if (cell.W && x === 0 && !(x === startCell.x && y === startCell.y)) addWall(left, top, left, top + cellSize);
    if (cell.E && x < columns - 1) addWall(left + cellSize, top, left + cellSize, top + cellSize);
    if (cell.S && y < rows - 1) addWall(left, top + cellSize, left + cellSize, top + cellSize);
    if (cell.S && y === rows - 1) addWall(left, top + cellSize, left + cellSize, top + cellSize);
    if (cell.E && x === columns - 1 && !(x === exitCell.x && y === exitCell.y)) addWall(left + cellSize, top, left + cellSize, top + cellSize);
  }
}

const wallRadius = 14.5;
const bounds = { minX: 12, maxX: 688, minY: 12, maxY: 388 };
const exit = { x: 688, y: (exitCell.y + .5) * cellSize };
let dragging = false;

function paint(mouse) {
  mouse.element.setAttribute("transform", `translate(${mouse.x} ${mouse.y})`);
}

function distanceToWall(x, y, wall) {
  const dx = wall.x2 - wall.x1;
  const dy = wall.y2 - wall.y1;
  const lengthSquared = dx * dx + dy * dy;
  const projection = Math.max(0, Math.min(1, ((x - wall.x1) * dx + (y - wall.y1) * dy) / lengthSquared));
  return Math.hypot(x - (wall.x1 + projection * dx), y - (wall.y1 + projection * dy));
}

function isOpen(x, y) {
  if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) return false;
  return walls.every((wall) => distanceToWall(x, y, wall) >= wallRadius);
}

function move(mouse, targetX, targetY) {
  const startX = mouse.x;
  const startY = mouse.y;
  const distance = Math.hypot(targetX - startX, targetY - startY);
  const steps = Math.max(1, Math.ceil(distance / 2));
  for (let step = 1; step <= steps; step += 1) {
    const x = startX + (targetX - startX) * step / steps;
    const y = startY + (targetY - startY) * step / steps;
    if (!isOpen(x, y)) break;
    mouse.x = x;
    mouse.y = y;
  }
  paint(mouse);
  if (mouse === mice.drag && mouse.x > 674 && Math.abs(mouse.y - exit.y) < 16) {
    nextLevel.hidden = false;
    draggable.setAttribute("aria-label", "Mouse three is at the exit. Next level unlocked.");
  }
}

function svgPoint(event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
}

const keys = new Set();
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
    keys.add(key);
  }
});
window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
window.addEventListener("blur", () => keys.clear());

function animate() {
  const arrow = mice.arrows;
  const wasd = mice.wasd;
  const step = 2.2;
  if (keys.has("arrowup")) move(arrow, arrow.x, arrow.y - step);
  if (keys.has("arrowdown")) move(arrow, arrow.x, arrow.y + step);
  if (keys.has("arrowleft")) move(arrow, arrow.x - step, arrow.y);
  if (keys.has("arrowright")) move(arrow, arrow.x + step, arrow.y);
  if (keys.has("w")) move(wasd, wasd.x, wasd.y - step);
  if (keys.has("s")) move(wasd, wasd.x, wasd.y + step);
  if (keys.has("a")) move(wasd, wasd.x - step, wasd.y);
  if (keys.has("d")) move(wasd, wasd.x + step, wasd.y);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

draggable.addEventListener("pointerdown", (event) => {
  dragging = true;
  draggable.setPointerCapture(event.pointerId);
  event.preventDefault();
});
draggable.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  const point = svgPoint(event);
  move(mice.drag, point.x, point.y);
});
draggable.addEventListener("pointerup", () => { dragging = false; });
draggable.addEventListener("pointercancel", () => { dragging = false; });
