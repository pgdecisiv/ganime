const stoneIntro = document.querySelector("#stone-intro");
const stonePickup = document.querySelector("#stone-pickup");
const stonePrompt = document.querySelector("#stone-prompt");
const patternPhase = document.querySelector("#pattern-phase");
const exerciseIndex = document.querySelector("#exercise-index");
const questionText = document.querySelector("#pattern-question");
const sequence = document.querySelector("#pattern-sequence");
const choices = document.querySelector("#pattern-choices");
const feedback = document.querySelector("#pattern-feedback");
const assessmentDone = document.querySelector("#assessment-done");
const pedroLine = document.querySelector("#smile-pedro-line");

const exercises = [
  {
    question: "Which tile completes the matrix?",
    rule: "count-fill",
    cells: [
      { count: 1, filled: true }, { count: 2, filled: false }, { count: 3, filled: true },
      { count: 2, filled: false }, { count: 3, filled: true }, { count: 4, filled: false },
      { count: 3, filled: true }, { count: 4, filled: false }, null,
    ],
    options: [
      { count: 5, filled: false }, { count: 6, filled: true },
      { count: 5, filled: true }, { count: 4, filled: true },
    ],
    answer: 2,
  },
  {
    question: "Which tile completes the matrix?",
    rule: "arrow-matrix",
    cells: [
      { count: 1, rotation: 0 }, { count: 2, rotation: 90 }, { count: 3, rotation: 180 },
      { count: 2, rotation: 90 }, { count: 3, rotation: 180 }, { count: 1, rotation: 270 },
      { count: 3, rotation: 180 }, { count: 1, rotation: 270 }, null,
    ],
    options: [
      { count: 2, rotation: 180 }, { count: 1, rotation: 0 },
      { count: 2, rotation: 0 }, { count: 3, rotation: 0 },
    ],
    answer: 2,
  },
  {
    question: "Which tile completes the matrix? Look for every relationship, not just one.",
    rule: "shape-matrix",
    cells: [
      { shape: "circle", rotation: 0, filled: true }, { shape: "triangle", rotation: 90, filled: false }, { shape: "square", rotation: 180, filled: true },
      { shape: "triangle", rotation: 90, filled: false }, { shape: "square", rotation: 180, filled: true }, { shape: "circle", rotation: 270, filled: false },
      { shape: "square", rotation: 180, filled: true }, { shape: "circle", rotation: 270, filled: false }, null,
    ],
    options: [
      { shape: "triangle", rotation: 0, filled: false },
      { shape: "triangle", rotation: 0, filled: true },
      { shape: "square", rotation: 0, filled: true },
      { shape: "triangle", rotation: 90, filled: true },
    ],
    answer: 1,
  },
];

let currentExercise = 0;
let answerLocked = false;

function showExercise() {
  if (currentExercise >= exercises.length) {
    finishAssessment();
    return;
  }
  const exercise = exercises[currentExercise];
  answerLocked = false;
  exerciseIndex.textContent = `EXERCISE ${String(currentExercise + 1).padStart(2, "0")} / 03`;
  questionText.textContent = exercise.question;
  sequence.className = "pattern-sequence is-matrix";
  sequence.replaceChildren();
  for (const [index, token] of exercise.cells.entries()) {
    const item = document.createElement("div");
    item.className = `matrix-cell${token === null ? " is-missing" : ""}`;
    if (token === null) {
      item.textContent = "?";
      item.setAttribute("aria-label", `Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}, missing tile`);
    } else {
      item.append(makeTile(exercise.rule, token));
      item.setAttribute("aria-label", `Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}`);
    }
    sequence.append(item);
  }
  choices.replaceChildren();
  for (const [index, answer] of exercise.options.entries()) {
    const button = document.createElement("button");
    button.className = "pattern-choice";
    button.type = "button";
    button.setAttribute("aria-label", `Answer option ${index + 1}`);
    button.append(makeTile(exercise.rule, answer));
    button.addEventListener("click", () => chooseAnswer(button, index, exercise.answer));
    choices.append(button);
  }
  feedback.textContent = "";
  pedroLine.textContent = "Three matrices. Try not to let the shapes intimidate you; they have no authority here.";
}

function makeTile(rule, value) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 64 64");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("matrix-art");
  const add = (tag, attrs) => {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [key, val] of Object.entries(attrs)) el.setAttribute(key, val);
    svg.append(el);
  };
  if (rule === "count-fill") {
    const positions = [[32, 17], [20, 28], [44, 28], [20, 42], [44, 42], [32, 51]];
    for (const [cx, cy] of positions.slice(0, value.count)) {
      add("circle", { cx, cy, r: 4.5, class: value.filled ? "matrix-mark" : "matrix-outline" });
    }
  } else if (rule === "arrow-matrix") {
    const positions = value.count === 1 ? [32] : value.count === 2 ? [22, 42] : [16, 32, 48];
    for (const x of positions) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("transform", `translate(${x} 32) rotate(${value.rotation}) scale(.32)`);
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M0 -27 L20 8 H8 V27 H-8 V8 H-20 Z");
      path.setAttribute("class", "matrix-mark matrix-arrow");
      g.append(path);
      svg.append(g);
    }
  } else {
    const shapes = {
      circle: ["circle", { cx: 32, cy: 32, r: 17 }],
      triangle: ["path", { d: "M32 13 L51 49 H13 Z" }],
      square: ["rect", { x: 16, y: 16, width: 32, height: 32 }],
      diamond: ["path", { d: "M32 11 L52 32 L32 53 L12 32 Z" }],
    };
    const { shape, rotation, filled } = value;
    const [tag, attrs] = shapes[shape];
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", `rotate(${rotation} 32 32)`);
    const mark = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [key, val] of Object.entries(attrs)) mark.setAttribute(key, val);
    mark.setAttribute("class", filled ? "matrix-mark matrix-shape" : "matrix-outline matrix-shape");
    g.append(mark);
    const orientation = document.createElementNS("http://www.w3.org/2000/svg", "line");
    orientation.setAttribute("x1", "32");
    orientation.setAttribute("y1", "32");
    orientation.setAttribute("x2", "32");
    orientation.setAttribute("y2", "8");
    orientation.setAttribute("class", "matrix-orientation");
    g.append(orientation);
    svg.append(g);
  }
  return svg;
}

function chooseAnswer(button, selected, correct) {
  if (answerLocked) return;
  if (selected !== correct) {
    button.classList.remove("is-wrong");
    void button.offsetWidth;
    button.classList.add("is-wrong");
    feedback.textContent = "NOT QUITE // TRY AGAIN";
    pedroLine.textContent = "No. The shapes are still keeping their little secret. Look again.";
    return;
  }

  answerLocked = true;
  button.classList.add("is-right");
  for (const option of choices.querySelectorAll("button")) option.disabled = true;
  feedback.textContent = "PATTERN ACCEPTED";
  feedback.style.color = "var(--acid)";
  pedroLine.textContent = "Correct. A modest triumph. Try to stay grounded.";
  window.setTimeout(() => {
    currentExercise += 1;
    feedback.style.color = "";
    showExercise();
  }, 520);
}

function finishAssessment() {
  questionText.hidden = true;
  sequence.hidden = true;
  choices.hidden = true;
  feedback.hidden = true;
  assessmentDone.hidden = false;
  pedroLine.textContent = "All three. I’ll inform the aptitude department, though I may need to sit down first.";
}

function beginAssessment(fadePickup) {
  stonePickup.disabled = true;
  stonePickup.classList.add("is-collected");
  stonePrompt.textContent = "ADDED TO INVENTORY";
  if (fadePickup) {
    stoneIntro.classList.add("is-fading");
    window.setTimeout(() => {
      stoneIntro.hidden = true;
      patternPhase.hidden = false;
      patternPhase.classList.add("is-entering");
      showExercise();
    }, 600);
  } else {
    stoneIntro.hidden = true;
    patternPhase.hidden = false;
    showExercise();
  }
}

stonePickup.addEventListener("click", () => {
  if (window.GanimesInventory.add("stone")) beginAssessment(true);
  else pedroLine.textContent = "Your inventory is full. I’d offer to help, but I’ve learned not to touch your filing system.";
});
