(() => {
  const form = document.querySelector("#logic-form");
  const selects = [...document.querySelectorAll(".logic-grid select")];
  const feedback = document.querySelector("#logic-feedback");
  const hintButton = document.querySelector("#logic-hint");
  const hintCount = document.querySelector("#hint-count");
  const next = document.querySelector("#logic-next");
  const pedro = document.querySelector("#pedro-line");
  const panel = document.querySelector(".logic-panel");
  const expected = {
    Ada: { time: "09:00", item: "Ledger" },
    Basil: { time: "10:00", item: "Compass" },
    Cora: { time: "08:00", item: "Mirror" },
    Dante: { time: "11:00", item: "Key" },
  };
  const hints = [
    "Start with the order clues: Cora is before Ada, and Basil is after Ada. What does that tell you about Ada’s earliest possible time?",
    "Ada cannot have the key or compass. She also cannot be at 08:00, because Cora is earlier. The 08:00 courier has the mirror.",
    "Ada must have the ledger. The compass has to be immediately before Dante; combine that with Cora < Ada < Basil to place all four couriers.",
  ];
  let hintIndex = 0;
  let solved = false;

  function refreshChoices(kind) {
    const group = selects.filter((select) => select.dataset.kind === kind);
    const used = new Set(group.map((select) => select.value).filter(Boolean));
    for (const select of group) {
      for (const option of select.options) {
        option.disabled = Boolean(option.value && used.has(option.value) && option.value !== select.value);
      }
    }
  }

  for (const select of selects) {
    select.addEventListener("change", () => {
      refreshChoices(select.dataset.kind);
      feedback.textContent = "";
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (solved) return;
    if (selects.some((select) => !select.value)) {
      feedback.textContent = "GRID INCOMPLETE // ASSIGN EVERY COURIER A TIME AND AN ITEM";
      pedro.textContent = "Every blank is a loophole. Fill the grid before asking the archive to judge it.";
      return;
    }

    const correct = selects.every((select) => expected[select.dataset.person][select.dataset.kind] === select.value);
    if (!correct) {
      feedback.textContent = "NO MATCH // AT LEAST ONE ASSIGNMENT CONFLICTS WITH THE STATEMENTS";
      pedro.textContent = "One or more pairings contradict the witness statements. Check the order, then check the items.";
      return;
    }

    solved = true;
    feedback.textContent = "DISPATCH RECONSTRUCTED // ALL STATEMENTS CONSISTENT";
    pedro.textContent = "You reconstructed the dispatch. I will inform Records that their six witnesses were marginally more useful than usual.";
    panel.classList.add("is-solved");
    next.hidden = false;
    hintButton.disabled = true;
    selects.forEach((select) => { select.disabled = true; });
    form.querySelector("button[type='submit']").disabled = true;
  });

  hintButton.addEventListener("click", () => {
    if (hintIndex >= hints.length || solved) return;
    feedback.textContent = `HINT ${hintIndex + 1} / 3 // ${hints[hintIndex]}`;
    hintIndex += 1;
    hintCount.textContent = `HINTS USED ${String(hintIndex).padStart(2, "0")} / 03`;
    if (hintIndex === hints.length) pedro.textContent = "That is the whole chain of deduction. The only remaining mystery is why HR made this my problem.";
  });
})();
