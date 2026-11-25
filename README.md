# ProjectTrackerFrontend

A lightweight single-page UI for [ProjectTracker](https://github.com/syrrkhrnsa/ProjectTracker): create, edit and delete projects and their weighted tasks, with progress bars and status badges.

## Features

- Split view: project list and task list
- Slide-in form for creating / editing projects and tasks
- Progress bars and status badges (`Draft`, `In Progress`, `Done`)

## Tech stack

Vanilla HTML, CSS and JavaScript (`fetch`) · Bootstrap 5 and Font Awesome via CDN · no build step

## Run locally

1. Start the API: see [ProjectTracker](https://github.com/syrrkhrnsa/ProjectTracker) (runs on `http://localhost:8000`).
2. Serve this folder with any static server, for example:

```bash
python -m http.server 3000
```

3. Open `http://localhost:3000`.

The API address is set at the top of `js/app.js` (`API_BASE_URL`).

## Author

Syira Khoerunisa
