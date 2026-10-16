// Needs config.js (WEB3FORMS_KEY). Menu and booking form, which emails the request to the owner.
const SERVICES = ["Lawn mowing", "Pruning", "Hedge trimming", "Weeding", "Spraying", "Weedwacking"];
const SLOTS = ["8:00 to 10:00 am", "10:00 am to 12:00 pm", "1:00 to 3:00 pm", "3:00 to 5:00 pm"];

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const day = (iso) => new Date(iso + "T00:00").toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long" });
const isoDate = (d) => new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const form = $("booking"), dateEl = $("date"), slotsEl = $("slots"), chipsEl = $("serviceChips"),
      errorEl = $("error"), doneEl = $("done"), summaryEl = $("summary");

$("year").textContent = new Date().getFullYear();

// Mobile menu
const nav = $("nav"), menuBtn = document.querySelector(".menu-btn");
function setMenu(open) {
  nav.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", open);
  menuBtn.textContent = open ? "Close" : "Menu";
}
menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });

// Service chips, and the "Book this" buttons that tick a service and jump to the form
chipsEl.innerHTML = SERVICES.map((s) =>
  `<label><input type="checkbox" name="service" value="${s}"><span>${s}</span></label>`).join("");
document.querySelectorAll("[data-service]").forEach((btn) => {
  btn.addEventListener("click", () => {
    chipsEl.querySelector(`input[value="${btn.dataset.service}"]`).checked = true;
    updateSummary();
    $("book").scrollIntoView();
  });
});

// Fade-in on scroll (skipped for reduced motion)
if ("IntersectionObserver" in window && matchMedia("(prefers-reduced-motion:no-preference)").matches) {
  document.documentElement.classList.add("js");
  const io = new IntersectionObserver((list) => list.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll(".service,.steps li,.gallery figure,.snippet,.owner>*,.google").forEach((el) => {
    el.classList.add("reveal");
    io.observe(el);
  });
}

// Dates: today up to 90 days ahead
const today = new Date(), limit = new Date(today);
limit.setDate(limit.getDate() + 90);
dateEl.min = isoDate(today);
dateEl.max = isoDate(limit);

// Times: fixed windows, the owner confirms the final time
function renderSlots() {
  if (!dateEl.value) { slotsEl.innerHTML = '<span class="hint">Choose a date to see times.</span>'; return; }
  if (new Date(dateEl.value + "T00:00").getDay() === 0) {
    slotsEl.innerHTML = '<span class="hint">We do not work on Sundays. Please pick another day.</span>';
    return;
  }
  slotsEl.innerHTML = SLOTS.map((s) =>
    `<label><input type="radio" name="slot" value="${s}"><span>${s}</span></label>`).join("");
}
dateEl.addEventListener("change", () => { renderSlots(); updateSummary(); });

// Live summary beside the form (desktop)
function updateSummary() {
  const services = [...form.querySelectorAll("[name=service]:checked")].map((c) => c.value);
  const slot = form.querySelector("[name=slot]:checked");
  const row = (k, v) => `<div><dt>${k}</dt><dd>${v || '<span class="empty">Not chosen yet</span>'}</dd></div>`;
  summaryEl.innerHTML = row("Services", services.join(", ")) + row("Date", dateEl.value && day(dateEl.value)) + row("Time", slot && slot.value);
}
form.addEventListener("change", updateSummary);
updateSummary();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const services = [...form.querySelectorAll("[name=service]:checked")].map((c) => c.value);
  const slot = form.querySelector("[name=slot]:checked");
  const booking = {
    services, date: dateEl.value, time: slot && slot.value,
    name: $("name").value.trim(), phone: $("phone").value.trim(),
    address: $("address").value.trim(), notes: $("notes").value.trim(),
  };

  const fields = ["name", "phone", "address"];
  const bad = fields.filter((id) => !booking[id] || (id === "phone" && !/\d{7,}/.test(booking.phone)));
  fields.forEach((id) => $(id).setAttribute("aria-invalid", bad.includes(id)));

  let problem = "";
  if (!services.length) problem = "Choose at least one service.";
  else if (!booking.date) problem = "Choose a date.";
  else if (new Date(booking.date + "T00:00").getDay() === 0) problem = "We do not work on Sundays. Please pick another day.";
  else if (!booking.time) problem = "Choose a time for that date.";
  else if (bad.length) {
    problem = bad[0] === "phone" && booking.phone ? "Enter a phone number we can call." : "Add your name, phone number and address.";
    $(bad[0]).focus();
  }
  errorEl.textContent = problem;
  if (problem) return;

  const btn = form.querySelector("button[type=submit]");
  const reset = () => { btn.disabled = false; btn.textContent = "Request booking"; };
  btn.disabled = true;
  btn.textContent = "Sending...";

  try {
    const res = await (await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `New booking request from ${booking.name}`,
        from_name: "Garden of Eden website",
        ...($("botcheck").checked && { botcheck: true }),
        Services: services.join(", "),
        Date: day(booking.date),
        Time: booking.time,
        Name: booking.name,
        Phone: booking.phone,
        Address: booking.address,
        Notes: booking.notes || "None",
      }),
    })).json();
    if (!res.success) {
      console.error("Web3Forms error:", res);
      errorEl.textContent = "Something went wrong. Please try again or call us.";
      reset();
      return;
    }
  } catch (err) {
    errorEl.textContent = "Could not send your request. Please call us instead.";
    reset();
    return;
  }

  doneEl.innerHTML = `<h3>Request sent</h3><p>${esc(services.join(", "))} on ${day(booking.date)}, ${esc(booking.time)}.</p>
    <p>We will contact ${esc(booking.name)} on ${esc(booking.phone)} to confirm.</p>`;
  form.hidden = true;
  doneEl.hidden = false;
  doneEl.focus();
});
