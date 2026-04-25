# Horz Games Launcher

Simple Electron-based launcher for your Horz games.

What it is
- A small desktop app showing a clear menu with buttons for different games.
- By default it opens two sample HTML pages so you can test the launcher immediately.

Run locally
1. Install dependencies:

```bash
cd "$(dirname "$0")"
npm install
```

2. Start the launcher:

```bash
npm start
```

How to configure your real games
- Edit `config.json` and set each game key to an absolute path or a path relative to the project root.
  Example on macOS:
  - `"horz-harvest": "/Applications/Horz Harvest.app"`
  - or `"horz-harvest": "games/horz-harvest.html"` (sample)

Notes
- The launcher uses Electron's `shell.openPath()` to open the configured file or executable with the OS default handler.
- For native macOS apps you can point to a `.app` bundle. For packaged executables point to the binary.

Next steps I can help with
- Add a settings UI to edit `config.json` from the app.
- Add icons, game metadata, and keyboard shortcuts.
- Package the launcher for distribution.

