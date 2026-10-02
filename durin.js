const form = document.querySelector("#password-form");
const input = document.querySelector("#password-input");
const feedback = document.querySelector("#door-feedback");
let errorTimer;

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (input.value.trim().toLocaleLowerCase() === "mellon") {
    window.location.assign("/durin");
    return;
  }
  feedback.textContent = "That word did not open the door.";
  form.classList.remove("is-wrong");
  window.clearTimeout(errorTimer);
  requestAnimationFrame(() => form.classList.add("is-wrong"));
  errorTimer = window.setTimeout(() => form.classList.remove("is-wrong"), 550);
  input.select();
});
