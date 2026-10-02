const form = document.querySelector("#password-form");
const input = document.querySelector("#password-input");
const feedback = document.querySelector("#door-feedback");
let errorTimer;

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (input.value.trim().toLocaleLowerCase() === "hammer") {
    window.location.assign("/hammer");
    return;
  }
  feedback.textContent = "That answer did not get past personnel.";
  form.classList.remove("is-wrong");
  window.clearTimeout(errorTimer);
  requestAnimationFrame(() => form.classList.add("is-wrong"));
  errorTimer = window.setTimeout(() => form.classList.remove("is-wrong"), 550);
  input.select();
});
