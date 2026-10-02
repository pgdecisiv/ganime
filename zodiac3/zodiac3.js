(() => {
  const board = document.querySelector("#connection-board");
  const svg = document.querySelector("#connection-lines");
  const savedLines = document.querySelector("#saved-lines");
  const draftLine = document.querySelector("#draft-line");
  const people = [...document.querySelectorAll("[data-person]")];
  const signs = [...document.querySelectorAll("[data-sign]")];
  const status = document.querySelector("#match-status");
  const nextButton = document.querySelector("#zodiac-next");
  const pedroLine = document.querySelector("#pedro-line");
  const panel = document.querySelector(".zodiac3-panel");
  const matches = new Map();
  let activePerson = null;

  function pointFor(element, side) {
    const boardRect = board.getBoundingClientRect();
    const portRect = element.querySelector(".port").getBoundingClientRect();
    return {
      x: ((side === "source" ? portRect.right : portRect.left) - boardRect.left) / boardRect.width * 1000,
      y: (portRect.top + portRect.height / 2 - boardRect.top) / boardRect.height * 700,
    };
  }

  function makePath(start, end, className = "") {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const bend = Math.max(25, (end.x - start.x) * .42);
    path.setAttribute("d", `M ${start.x} ${start.y} C ${start.x + bend} ${start.y}, ${end.x - bend} ${end.y}, ${end.x} ${end.y}`);
    if (className) path.setAttribute("class", className);
    return path;
  }

  function redraw() {
    savedLines.replaceChildren();
    for (const [personName, signName] of matches) {
      const person = people.find((element) => element.dataset.person === personName);
      const sign = signs.find((element) => element.dataset.sign === signName);
      if (!person || !sign) continue;
      const path = makePath(pointFor(person, "source"), pointFor(sign, "target"), signName === "Sagittarius" ? "is-correct" : "");
      path.dataset.person = personName;
      savedLines.append(path);
    }
    for (const person of people) {
      const connected = matches.has(person.dataset.person);
      const correct = matches.get(person.dataset.person) === "Sagittarius";
      person.classList.toggle("is-connected", connected);
      person.classList.toggle("is-correct", correct);
    }
    for (const sign of signs) {
      const connected = [...matches.values()].includes(sign.dataset.sign);
      const correct = sign.dataset.sign === "Sagittarius" && [...matches.values()].filter((value) => value === "Sagittarius").length > 0;
      sign.classList.toggle("is-connected", connected);
      sign.classList.toggle("is-correct", correct);
    }
    const complete = people.every((person) => matches.get(person.dataset.person) === "Sagittarius");
    status.textContent = complete ? "ASSIGNMENT ACCEPTED // 7 / 7" : `${matches.size} / 7 CONNECTIONS`;
    nextButton.hidden = !complete;
    panel.classList.toggle("is-solved", complete);
    pedroLine.textContent = complete
      ? "Well, the stars have made their position clear. I assume Legal has signed off on this."
      : matches.size === 0
        ? "Draw a line from each name to its sign. I'm sure the stars have nothing to do with this."
        : [...matches.values()].every((sign) => sign === "Sagittarius")
          ? "Promising. Finish connecting the remaining names and try not to look smug."
          : "Some of those alignments are suspicious. I am choosing not to ask questions.";
  }

  function updateDraft(event) {
    if (!activePerson) return;
    const start = pointFor(activePerson, "source");
    const boardRect = board.getBoundingClientRect();
    const end = { x: (event.clientX - boardRect.left) / boardRect.width * 1000, y: (event.clientY - boardRect.top) / boardRect.height * 700 };
    const path = makePath(start, end);
    draftLine.setAttribute("d", path.getAttribute("d"));
    draftLine.hidden = false;
  }

  function stopConnection(event) {
    if (!activePerson) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-sign]");
    activePerson.classList.remove("is-selected");
    if (target && board.contains(target)) {
      matches.set(activePerson.dataset.person, target.dataset.sign);
      redraw();
    }
    activePerson = null;
    draftLine.hidden = true;
    svg.releasePointerCapture?.(event.pointerId);
  }

  for (const person of people) {
    person.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      activePerson = person;
      person.classList.add("is-selected");
      svg.setPointerCapture?.(event.pointerId);
      updateDraft(event);
      event.preventDefault();
    });
  }

  svg.addEventListener("pointermove", updateDraft);
  svg.addEventListener("pointerup", stopConnection);
  svg.addEventListener("pointercancel", (event) => {
    if (!activePerson) return;
    activePerson.classList.remove("is-selected");
    activePerson = null;
    draftLine.hidden = true;
  });
  window.addEventListener("resize", redraw);
  redraw();
})();
