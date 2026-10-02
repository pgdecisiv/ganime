const matrix = document.querySelector("#matrix-grid");
const columns = Math.max(12, Math.ceil(window.innerWidth / 27));
const rows = Math.max(12, Math.ceil((window.innerHeight - 56) / 27));
const count = columns * rows;
const glyphs = Array.from({ length: count }, () => Math.random() < .5 ? "0" : "1");
while (glyphs.filter((glyph) => glyph === "0").length < 20) {
  const onePosition = glyphs.indexOf("1");
  glyphs[onePosition] = "0";
}
const zeroPositions = glyphs.flatMap((glyph, index) => glyph === "0" ? [index] : []);
for (let index = zeroPositions.length - 1; index > 0; index -= 1) {
  const swapIndex = Math.floor(Math.random() * (index + 1));
  [zeroPositions[index], zeroPositions[swapIndex]] = [zeroPositions[swapIndex], zeroPositions[index]];
}
const targetIndexes = new Set(zeroPositions.slice(0, 20));
matrix.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
matrix.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;

for (let index = 0; index < count; index += 1) {
  if (targetIndexes.has(index)) {
    const target = document.createElement("button");
    target.type = "button";
    target.className = "matrix-glyph matrix-target";
    target.textContent = "O";
    target.setAttribute("aria-label", "Matrix character");
    target.style.setProperty("--glyph-opacity", String(.38 + Math.random() * .38));
    target.addEventListener("click", () => window.location.assign("/dragthemousethroughthelabyrinth"));
    matrix.append(target);
    continue;
  }
  const glyph = document.createElement("span");
  glyph.className = "matrix-glyph";
  glyph.textContent = glyphs[index];
  glyph.style.setProperty("--glyph-opacity", String(.2 + Math.random() * .45));
  matrix.append(glyph);
}
