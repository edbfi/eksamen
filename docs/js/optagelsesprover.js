// @license magnet:?xt=urn:btih:0b31508aeb0634b347b8270c7bee4d411b5d4109&dn=agpl-3.0.txt AGPL-3.0
// SPDX-License-Identifier: AGPL-3.0-or-later
const DANISH_MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAJ",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OKT",
  "NOV",
  "DEC",
];

// Optagelsesprøver kan dele måned/år (fx to i august 2024), så datoen vises
// med dag for at holde hver prøve entydig.
function formatShortDate(iso) {
  const [year, month, day] = iso.split("-");
  const m = DANISH_MONTHS[parseInt(month, 10) - 1] || "";
  return `${parseInt(day, 10)}. ${m} ${year}`;
}

function createExamLink(exam) {
  const item = document.createElement("li");
  item.className = "exam-list__item";

  const link = document.createElement("a");
  link.className = "exam-list__link";
  link.href = `proever/shared/exam-start.html?exam=${exam.path}`;

  const title = document.createElement("span");
  title.className = "exam-list__title";
  title.textContent = exam.name;

  const date = document.createElement("span");
  date.className = "exam-list__date";
  date.textContent = formatShortDate(exam.date);

  link.appendChild(title);
  link.appendChild(date);
  item.appendChild(link);
  return item;
}

function createExamCard(exams) {
  const card = document.createElement("article");
  card.className = "subject-card";

  const header = document.createElement("header");
  header.className = "subject-card__header";

  const name = document.createElement("h2");
  name.className = "subject-card__name";
  name.textContent = "Optagelsesprøver";
  header.appendChild(name);

  const count = document.createElement("span");
  count.className = "subject-card__count";
  count.textContent = `${exams.length} ${exams.length === 1 ? "PRØVE" : "PRØVER"}`;
  header.appendChild(count);

  card.appendChild(header);

  const list = document.createElement("ul");
  list.className = "exam-list";
  for (const exam of exams) {
    list.appendChild(createExamLink(exam));
  }
  card.appendChild(list);
  return card;
}

// --- Kodebeskyttelse (krypteret liste) ---------------------------------------
// Listen er krypteret med AES-GCM og en PBKDF2-nøgle udledt af koden. Hverken
// koden eller prøve-stierne ligger i klartekst i det servede site; forkert kode
// kan ikke dekryptere. Beskytter website-UI'et — ikke det offentlige git-repo.
const ENC_URL = "proever/optagelsesprover.enc.json";
const SESSION_KEY = "optagelse_pw";

let encBlobPromise = null;
function fetchEncBlob() {
  if (!encBlobPromise) {
    encBlobPromise = fetch(ENC_URL).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    });
  }
  return encBlobPromise;
}

function b64ToBytes(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(pw, salt, iter) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pw),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
}

// Returnerer det dekrypterede prøve-array, eller kaster ved forkert kode
// (GCM-auth-tag fejler) eller ugyldigt indhold.
async function decryptIndex(pw, blob) {
  const salt = b64ToBytes(blob.salt);
  const iv = b64ToBytes(blob.iv);
  const ct = b64ToBytes(blob.ct);
  const key = await deriveKey(pw, salt, blob.iter);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ct,
  );
  return JSON.parse(new TextDecoder().decode(plaintext));
}

function renderExams(main, exams) {
  exams.sort((a, b) => (a.date < b.date ? 1 : -1));
  main.replaceChildren(createExamCard(exams));
}

function showError(main, message) {
  const errorMsg = document.createElement("div");
  errorMsg.className = "error-message";
  errorMsg.textContent = message;
  main.replaceChildren(errorMsg);
}

function renderGate(main, prefill) {
  const form = document.createElement("form");
  form.className = "passgate";
  form.noValidate = true;

  const label = document.createElement("label");
  label.className = "passgate__label";
  label.htmlFor = "passgate-input";
  label.textContent = "Indtast kode for at se optagelsesprøverne";

  const input = document.createElement("input");
  input.className = "passgate__input";
  input.id = "passgate-input";
  input.type = "password";
  input.autocomplete = "off";
  input.setAttribute("autocapitalize", "off");
  input.spellcheck = false;

  const button = document.createElement("button");
  button.className = "passgate__submit";
  button.type = "submit";
  button.textContent = "Lås op";

  const error = document.createElement("p");
  error.className = "passgate__error";
  error.hidden = true;

  form.append(label, input, button, error);
  main.replaceChildren(form);
  input.focus();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const pw = input.value;
    if (!pw) return;

    error.hidden = true;
    button.disabled = true;
    try {
      const blob = await fetchEncBlob();
      const exams = await decryptIndex(pw, blob);
      sessionStorage.setItem(SESSION_KEY, pw);
      renderExams(main, exams);
    } catch (err) {
      if (err instanceof SyntaxError || err.name === "OperationError") {
        // Forkert kode: GCM-tag-fejl eller udekrypterbart indhold.
        error.textContent = "Forkert kode. Prøv igen.";
        error.hidden = false;
        button.disabled = false;
        input.select();
      } else {
        console.error("Error loading optagelsesprøver:", err);
        showError(
          main,
          "Der opstod en fejl ved indlæsning af optagelsesprøverne.",
        );
      }
    }
  });

  if (prefill) {
    input.value = prefill;
    form.requestSubmit();
  }
}

async function initialize() {
  const main = document.querySelector(".subject-grid");

  if (!(window.crypto && crypto.subtle)) {
    showError(
      main,
      "Din browser understøtter ikke den nødvendige kryptering. Brug en nyere browser.",
    );
    return;
  }

  // Husk login i fanen: forsøg auto-unlock hvis koden er gemt fra et tidligere
  // besøg i samme session.
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) {
    try {
      const blob = await fetchEncBlob();
      const exams = await decryptIndex(stored, blob);
      renderExams(main, exams);
      return;
    } catch (err) {
      // Gemt kode duede ikke (eller fetch fejlede) → ryd og vis gaten.
      sessionStorage.removeItem(SESSION_KEY);
    }
  }

  renderGate(main);
}

document.addEventListener("DOMContentLoaded", initialize);
// @license-end
