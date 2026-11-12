// @license magnet:?xt=urn:btih:0b31508aeb0634b347b8270c7bee4d411b5d4109&dn=agpl-3.0.txt AGPL-3.0
// SPDX-License-Identifier: AGPL-3.0-or-later
import { subjects, examData, initializeExamData } from "./examList.js";

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

function formatShortDate(iso) {
  const [year, month] = iso.split("-");
  const m = DANISH_MONTHS[parseInt(month, 10) - 1] || "";
  return `${m} ${year}`;
}

function pluralCount(n) {
  return `${n} ${n === 1 ? "PRØVE" : "PRØVER"}`;
}

function groupByYear(exams) {
  const sorted = [...exams].sort((a, b) => (a.date < b.date ? 1 : -1));
  const groups = new Map();
  for (const exam of sorted) {
    const year = exam.date.slice(0, 4);
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(exam);
  }
  return groups;
}

function createYearGroup(year, exams) {
  const section = document.createElement("section");
  section.className = "year-group";

  const header = document.createElement("div");
  header.className = "year-group__header";

  const label = document.createElement("span");
  label.className = "year-group__label";
  label.textContent = year;
  header.appendChild(label);

  const rule = document.createElement("span");
  rule.className = "year-group__rule";
  rule.setAttribute("aria-hidden", "true");
  header.appendChild(rule);

  section.appendChild(header);

  const list = document.createElement("ul");
  list.className = "exam-list";

  for (const exam of exams) {
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
    list.appendChild(item);
  }

  section.appendChild(list);
  return section;
}

function createSubjectCard(subject, exams) {
  const card = document.createElement("article");
  card.className = "subject-card";

  const header = document.createElement("header");
  header.className = "subject-card__header";

  const name = document.createElement("h2");
  name.className = "subject-card__name";
  name.textContent = subject;
  header.appendChild(name);

  const count = document.createElement("span");
  count.className = "subject-card__count";
  count.textContent = pluralCount(exams.length);
  header.appendChild(count);

  card.appendChild(header);

  if (exams.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Ingen prøver endnu";
    card.appendChild(empty);
    return card;
  }

  const grouped = groupByYear(exams);
  const fragment = document.createDocumentFragment();
  for (const [year, yearExams] of grouped) {
    fragment.appendChild(createYearGroup(year, yearExams));
  }
  card.appendChild(fragment);
  return card;
}

async function initializeAndCreateCards() {
  const grid = document.querySelector(".subject-grid");
  try {
    await initializeExamData();
    const fragment = document.createDocumentFragment();
    subjects.forEach((subject, i) => {
      const exams = examData[subject] || [];
      const card = createSubjectCard(subject, exams);
      card.style.setProperty("--i", i);
      fragment.appendChild(card);
    });
    grid.appendChild(fragment);
  } catch (error) {
    console.error("Error initializing and creating cards:", error);
    const errorMsg = document.createElement("div");
    errorMsg.className = "error-message";
    errorMsg.textContent = "Der opstod en fejl ved indlæsning af eksamener.";
    grid.appendChild(errorMsg);
  }
}

document.addEventListener("DOMContentLoaded", initializeAndCreateCards);
// @license-end
