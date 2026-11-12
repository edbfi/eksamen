// @license magnet:?xt=urn:btih:0b31508aeb0634b347b8270c7bee4d411b5d4109&dn=agpl-3.0.txt AGPL-3.0
// SPDX-License-Identifier: AGPL-3.0-or-later
// Function to scan exams using the JSON index file
export async function scanExams() {
  try {
    const response = await fetch("proever/exam-index.json");
    if (!response.ok) throw new Error("Failed to fetch exam index");

    const examData = await response.json();
    return examData;
  } catch (error) {
    console.error("Error scanning exams:", error);
    return {};
  }
}
// @license-end
