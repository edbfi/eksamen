<p align="center">
  <img src="docs/favicon.svg" alt="eksamen logo" width="160" height="160">
</p>

<h1 align="center">eksamen</h1>

<p align="center"><strong>Browse Danish school examinations in a static web archive.</strong></p>

<p align="center">
  <a href="https://github.com/edbfi/eksamen/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-AGPL--3.0--or--later%20(website%20code)-blue?style=flat" alt="License: AGPL-3.0-or-later (website code)">
  </a>
  <a href="https://github.com/tc39/ecma262" title="ECMAScript language specification source">
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&amp;logo=javascript&amp;logoColor=black" alt="JavaScript">
  </a>
  <a href="https://github.com/whatwg/html" title="HTML Standard source">
    <img src="https://img.shields.io/badge/HTML-E34F26?style=flat&amp;logo=html5&amp;logoColor=white" alt="HTML">
  </a>
  <a href="https://github.com/w3c/csswg-drafts" title="CSS Working Group specifications source">
    <img src="https://img.shields.io/badge/CSS-663399?style=flat&amp;logo=css&amp;logoColor=white" alt="CSS">
  </a>
</p>

A modern web-based archive system for Danish FP9 (9th grade) examination materials. Access, browse, and view past examinations in an organized and user-friendly interface.

## Features

- 📝 Browse FP9 examination materials by subject
- 📱 Responsive design for all devices
- 🇩🇰 Danish language interface
- 🔍 Easy navigation through exam content
- 💾 Organized archive structure

## Subjects

The system is structured to support examination materials for all subjects in FP9 and FP10

## Technology

<img src="https://up.shx.gg/6_fNnXp1C.png" alt="Technology Diagram" width="50%">

## Development

To run the project locally:

1. Clone the repository
2. Navigate to the `docs` directory
3. Serve the files using any static file server

## Links

- [Live Site](https://eksamen.edb.fi)
- [Prøvebanken](https://www.prøvebanken.dk)

## Adding New Exams

Exams should be added to their respective subject folders following these naming conventions:

### Danish (FP9_dansk)

Format: `YYYY-MM-DD_Skriftlig_Fremstilling`
Example: `2023-05-02_Skriftlig_Fremstilling`

### English (FP9_engelsk)

Format: `YYYY-MM-DD_Reading_Test`
Example: `2024-01-15_Reading_Test`

### Mathematics (FP9_matematik)

Format: `YYYY-MM-DD_Med_Hjaelpemidler`
Example: `2023-12-04_Med_Hjaelpemidler`

### Folder Structure

Place exam files in:

- `/docs/proever/FP9_dansk/` for Danish exams
- `/docs/proever/FP9_engelsk/` for English exams
- `/docs/proever/FP9_matematik/` for Mathematics exams

Each exam folder should contain:

1. An `index.html` file as the main entry point
2. Any additional resources (PDFs, images, etc.) referenced by the exam
3. Subject-specific assets in their respective folders

The system uses `exam-start.html` from the shared folder as a standard entry point for all exams, which will redirect to the specific exam content when started.

### File Requirements

- All exam content should be web-compatible (HTML, PDF, images)
- Use relative paths for all resource references
- Ensure all file names use lowercase letters and hyphens for spaces
- Include any necessary subject-specific instructions in the exam folder

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

- Original website code and infrastructure outside `/docs/proever` are free software: you may redistribute and/or modify them under the [GNU Affero General Public License](LICENSE), as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version (`AGPL-3.0-or-later`). Third-party materials retain their respective licenses.

- Exam content © Børne- og Undervisningsministeriet
