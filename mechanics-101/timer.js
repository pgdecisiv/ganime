const timerButton = document.querySelector("#timer-button");
const secondsDisplay = document.querySelector("#seconds");
const decisecondsDisplay = document.querySelector("#deciseconds");
const timerDisplay = document.querySelector("#timer-display");
const nextButton = document.querySelector("#next-button");
const pedroLine = document.querySelector("#pedro-line");

const targetTime = 10100;
const successWindow = 3;
const clockRate = .8;
let state = "idle";
let startedAt = 0;
let elapsed = 0;
let baseElapsed = 0;
let failedAttempts = 0;
let animationFrame = 0;

function showTime(milliseconds) {
  const wholeMilliseconds = Math.max(0, Math.floor(milliseconds));
  const seconds = Math.floor(wholeMilliseconds / 1000);
  const deciseconds = Math.floor((wholeMilliseconds % 1000) / 100);
  secondsDisplay.textContent = String(seconds).padStart(2, "0");
  decisecondsDisplay.textContent = String(deciseconds);
}

function tick() {
  if (state !== "running") return;
  elapsed = baseElapsed + (performance.now() - startedAt) * clockRate;
  showTime(elapsed);
  animationFrame = requestAnimationFrame(tick);
}

function startTimer() {
  baseElapsed = elapsed;
  startedAt = performance.now();
  state = "running";
  timerButton.textContent = "STOP";
  timerButton.classList.add("is-stop");
  pedroLine.textContent = "Ah, time. The one resource this company can waste without approval.";
  animationFrame = requestAnimationFrame(tick);
}

function lockTimer() {
  cancelAnimationFrame(animationFrame);
  showTime(elapsed);
  timerButton.classList.remove("is-stop");
  state = "locked";
  timerButton.textContent = "LOCKED";
  timerButton.classList.add("is-locked");
  timerButton.disabled = true;
  nextButton.hidden = false;
  pedroLine.textContent = "A rare moment of precision. Try not to make it your whole personality.";
}

function isTargetTime() {
  return elapsed >= targetTime && elapsed < targetTime + successWindow;
}

function elapsedNow() {
  return baseElapsed + (performance.now() - startedAt) * clockRate;
}

function stopTimer() {
  elapsed = elapsedNow();
  cancelAnimationFrame(animationFrame);
  showTime(elapsed);
  timerButton.classList.remove("is-stop");
  if (isTargetTime()) {
    lockTimer();
    return;
  }
  state = "stopped";
  timerButton.textContent = "RESET";
  failedAttempts += 1;
  if (failedAttempts >= 10) timerDisplay.classList.add("scroll-enabled");
  if (failedAttempts === 1) {
    pedroLine.textContent = "Close is a feeling. The clock has no feelings.";
  } else if (failedAttempts === 11) {
    pedroLine.textContent = "Eleven attempts. There is more than one way to move the numbers. That little mouse wheel isn't just ornamental, you know.";
  } else if (failedAttempts > 11) {
    pedroLine.textContent = "The mouse wheel, employee. It’s been there the whole time. I assumed you’d noticed.";
  } else {
    const patienceMessages = [
      "Patience, employee. Even clocks reward those who wait. Allegedly.",
      "Persistence is a virtue. HR has confirmed this, so it must be true.",
      "Again. Patience is just stubbornness with better stationery.",
      "Keep trying. The clock has nowhere to be.",
      "A watched clock… well, you know the rest. Probably.",
      "Persistence. It’s patience with more clicking.",
      "Time is a flat circle. Yours is also slightly off.",
      "Keep at it. I’ve seen worse performance reviews. One, specifically.",
      "Ten tries. Patience is a virtue; a rather poorly compensated one here."
    ];
    pedroLine.textContent = patienceMessages[failedAttempts - 2] || patienceMessages.at(-1);
  }
}

function resetTimer() {
  cancelAnimationFrame(animationFrame);
  state = "idle";
  elapsed = 0;
  baseElapsed = 0;
  showTime(0);
  timerButton.textContent = "START";
  timerButton.classList.remove("is-stop", "is-locked");
  timerButton.disabled = false;
  pedroLine.textContent = "Precision. Management’s favorite way to pretend time is money.";
}

timerDisplay.addEventListener("wheel", (event) => {
  if (failedAttempts < 10 || state === "locked" || event.deltaY === 0) return;
  event.preventDefault();
  const now = performance.now();
  if (state === "running") elapsed = elapsedNow();
  const direction = Math.sign(event.deltaY);
  elapsed = Math.max(0, elapsed + direction * 100);
  if (state === "running") {
    baseElapsed = elapsed;
    startedAt = now;
  }
  showTime(elapsed);
  if (state !== "running" && isTargetTime()) lockTimer();
}, { passive: false });

timerButton.addEventListener("click", () => {
  if (state === "idle") startTimer();
  else if (state === "running") stopTimer();
  else if (state === "stopped") resetTimer();
});
