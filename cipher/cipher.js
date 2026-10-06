/*
 * Symbol Cipher embed
 * Usage: <div data-symbol-cipher></div><script src="/cipher/cipher.js"></script>
 * Or call SymbolCipher.mount(element, options). This file includes its own styles.
 */
(() => {
  "use strict";

  const answer = ["DARKENING NIGHTTIME", "AN ENGLISH, FUN HAIKU GUESS", "AT THE PERFECT KNIFE"];
  const glyphs = {
    A: "Ж", B: "ᚦ", C: "△", D: "★", E: "Φ", F: "ᚱ", G: "◇", H: "Я", I: "✶", J: "ᛉ",
    K: "Ц", L: "▽", M: "ᚷ", N: "☼", O: "Ю", P: "✧", Q: "ᛟ", R: "ᚺ", S: "⬡", T: "ᚾ",
    U: "♜", V: "☆", W: "Д", X: "ᛞ", Y: "⟐", Z: "Ч"
  };
  const css = `
    .symbol-cipher{--sc-ink:#e9e1ec;--sc-dim:#8e8296;--sc-acid:#b7ff4a;--sc-pink:#ff58b5;color:var(--sc-ink);font:14px/1.4 "Space Mono",ui-monospace,monospace;max-width:920px;margin:0 auto;padding:clamp(16px,4vw,32px);background:radial-gradient(ellipse at 50% 0,#251530 0,#0b0910 72%);border:1px solid #ff58b544;box-shadow:0 0 35px #ff58b510,inset 0 0 30px #b7ff4a08}
    .symbol-cipher *{box-sizing:border-box}.symbol-cipher__heading{margin:0 0 8px;color:var(--sc-acid);font-size:10px;letter-spacing:.16em;text-transform:uppercase}.symbol-cipher__hint{margin:0 0 22px;color:#bcb0c4;font-size:12px}.symbol-cipher__lines{display:grid;gap:18px}.symbol-cipher__line{display:flex;flex-wrap:wrap;align-items:flex-end;gap:8px 5px}.symbol-cipher__token{display:flex;flex-direction:column;align-items:center;gap:5px;min-width:30px}.symbol-cipher__glyph{width:30px;height:30px;display:grid;place-items:center;color:var(--sc-acid);font:700 22px/1 "Space Mono",monospace;user-select:none}.symbol-cipher__input{width:29px;height:30px;padding:0;border:0;border-bottom:1px solid #ff58b5aa;border-radius:0;background:#ffffff08;color:var(--sc-ink);text-align:center;text-transform:uppercase;font:700 14px "Space Mono",monospace;outline:none}.symbol-cipher__input:focus{border-color:var(--sc-acid);box-shadow:0 3px 9px -5px var(--sc-acid)}.symbol-cipher__punct{align-self:flex-end;padding:0 1px 5px;color:#c9becd}.symbol-cipher__message{min-height:18px;margin:18px 0 0;color:var(--sc-dim);font-size:10px;letter-spacing:.08em}.symbol-cipher__token.is-correct .symbol-cipher__input{border-color:#b7ff4a88}.symbol-cipher__token.symbol-cipher__word--haiku{transition:filter .35s,transform .35s}.symbol-cipher.is-solved .symbol-cipher__token.symbol-cipher__word--haiku .symbol-cipher__glyph{filter:drop-shadow(0 0 7px #b7ff4a)}.symbol-cipher.is-solved .symbol-cipher__token.symbol-cipher__word--haiku .symbol-cipher__input{color:var(--sc-acid);text-shadow:0 0 10px #b7ff4a88}.symbol-cipher.is-solved .symbol-cipher__message{color:var(--sc-acid);text-shadow:0 0 10px #b7ff4a66}
    @media(max-width:540px){.symbol-cipher{padding:16px 12px}.symbol-cipher__lines{gap:15px}.symbol-cipher__line{gap:7px 3px}.symbol-cipher__token{min-width:25px}.symbol-cipher__glyph{width:25px;height:27px}.symbol-cipher__input{width:25px;height:27px;font-size:12px}}
  `;

  function mount(root, options = {}) {
    if (!root) throw new Error("SymbolCipher.mount requires a container element.");
    if (!document.querySelector("#symbol-cipher-styles")) {
      const style = document.createElement("style"); style.id = "symbol-cipher-styles"; style.textContent = css; document.head.append(style);
    }
    const solution = options.lines || answer;
    const shell = document.createElement("section"); shell.className = "symbol-cipher"; shell.setAttribute("aria-label", "Interactive symbol cipher");
    shell.innerHTML = `<h2 class="symbol-cipher__heading">Intercepted message // 01</h2><p class="symbol-cipher__hint">Enter one letter beneath each symbol. A decoded opening word has been provided.</p><div class="symbol-cipher__lines"></div><p class="symbol-cipher__message" role="status" aria-live="polite">Opening word decoded: DARKENING</p>`;
    const linesEl = shell.querySelector(".symbol-cipher__lines");
    const allTokens = [];
    for (const [lineIndex, text] of solution.entries()) {
      const line = document.createElement("div"); line.className = "symbol-cipher__line";
      let letterPosition = 0;
      for (const item of text) {
        if (!/[A-Z]/i.test(item)) {
          if (item !== " ") letterPosition++;
          if (item === " ") { const gap = document.createElement("span"); gap.setAttribute("aria-hidden", "true"); gap.style.width = "8px"; line.append(gap); continue; }
          const punct = document.createElement("span"); punct.className = "symbol-cipher__punct"; punct.textContent = item; line.append(punct); continue;
        }
        const letter = item.toUpperCase();
        const token = document.createElement("label"); token.className = "symbol-cipher__token";
        const glyph = document.createElement("span"); glyph.className = "symbol-cipher__glyph"; glyph.setAttribute("aria-hidden", "true"); glyph.textContent = glyphs[letter];
        const input = document.createElement("input"); input.className = "symbol-cipher__input"; input.type = "text"; input.maxLength = 1; input.autocomplete = "off"; input.spellcheck = false; input.setAttribute("aria-label", `Symbol ${letter}, line ${lineIndex + 1}`); input.dataset.symbol = letter;
        if (lineIndex === 0 && letterPosition < 9) input.value = "DARKENING"[letterPosition];
        token.append(glyph, input); line.append(token); allTokens.push({letter, input, token}); letterPosition++;
      }
      linesEl.append(line);
    }
    // Label the target word so only HAIKU receives the solved glow.
    const haiku = [...linesEl.querySelectorAll(".symbol-cipher__line")][1];
    if (haiku) {
      const words = [...haiku.querySelectorAll(".symbol-cipher__token")];
      // second line has AN ENGLISH, FUN HAIKU GUESS; offset is 2 + 7 + 3 letters.
      const start = 12; const wordTokens = words.slice(start, start + 5);
      wordTokens.forEach((el) => el.classList.add("symbol-cipher__word--haiku"));
    }
    function update() {
      for (const entry of allTokens) {
        const value = entry.input.value.toUpperCase();
        const correct = value === entry.letter;
        entry.token.classList.toggle("is-correct", correct);
      }
      const solved = allTokens.every(({letter,input}) => input.value.toUpperCase() === letter);
      shell.classList.toggle("is-solved", solved);
      shell.querySelector(".symbol-cipher__message").textContent = solved ? "MESSAGE DECODED // HAIKU IDENTIFIED" : "Opening word decoded: DARKENING";
    }
    for (const {input} of allTokens) {
      input.addEventListener("input", () => {
        const value = input.value.replace(/[^a-z]/ig, "").slice(-1).toUpperCase();
        input.value = value;
        update();
      });
    }
    root.replaceChildren(shell); update();
    return { destroy() { shell.remove(); }, get solved() { return shell.classList.contains("is-solved"); } };
  }
  window.SymbolCipher = { mount };
  if (document.currentScript?.hasAttribute("data-auto-mount")) {
    const root = document.querySelector("[data-symbol-cipher]"); if (root) mount(root);
  }
})();
