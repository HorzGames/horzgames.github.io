const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('launch-game', async (event, key) => {
  try {
    const configPath = path.join(__dirname, 'config.json');
    if (!fs.existsSync(configPath)) return { error: 'Missing config.json' };
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const rel = config[key];
    if (!rel) return { error: 'Unknown game key: ' + key };

    const abs = path.isAbsolute(rel) ? rel : path.join(__dirname, rel);
    const win = BrowserWindow.getAllWindows()[0];
    if (!win) return { error: 'Launcher window not available' };

    // If it's an HTML file, embed it inside a centered BrowserView
    if (abs.toLowerCase().endsWith('.html')) {
      const view = new BrowserView({
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          contextIsolation: true,
          sandbox: false
        }
      });

      win.setBrowserView(view);

      // Calculate centered bounds for the view so the canvas appears in the middle
      const [winW, winH] = win.getSize();
      const viewW = Math.min(900, Math.max(400, Math.floor(winW * 0.75)));
      const viewH = Math.min(700, Math.max(300, Math.floor(winH * 0.75)));
      const viewX = Math.floor((winW - viewW) / 2);
      const viewY = Math.floor((winH - viewH) / 2);

      view.setBounds({ x: viewX, y: viewY, width: viewW, height: viewH });
      view.setAutoResize({ width: false, height: false });

      // Load the game's HTML and give it focus
      await view.webContents.loadFile(abs);
      view.webContents.focus();

      // Forward any console messages from the game's page to the main process console
      view.webContents.on('console-message', (event, level, message, line, sourceId) => {
        console.log(`[Game console][${sourceId}:${line}] ${message}`);
      });

      // Inject runtime debug helpers into the game's window for error and promise rejection logging
      try {
        await view.webContents.executeJavaScript(`
          console.log('Horz game loaded inside BrowserView');
          window.addEventListener('error', function(e) {
            console.error('Game runtime error:', e.message, e.filename, e.lineno, e.colno, e.error);
          });
          window.addEventListener('unhandledrejection', function(e) {
            console.error('Unhandled Promise rejection:', e.reason);
          });
        `, true);
      } catch (e) {
        console.warn('Could not inject debug helpers into game view:', e);
      }

      // Intercept Escape key in the game's webContents to confirm quitting
      const onBeforeInput = async (e, input) => {
        if (input.key === 'Escape' && !input.alt && !input.control && !input.meta) {
          const choice = await dialog.showMessageBox(win, {
            type: 'question',
            buttons: ['Yes', 'No'],
            defaultId: 1,
            cancelId: 1,
            message: 'Quit game?',
            detail: 'Return to the main menu?'
          });

          if (choice.response === 0) {
            try {
              win.removeBrowserView(view);
            } catch (err) {}
            try { view.webContents.destroy(); } catch (e) {}
            view.webContents.removeListener('before-input-event', onBeforeInput);
          }
        }
      };

      view.webContents.on('before-input-event', onBeforeInput);

      // Open external links in default browser
      view.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
      });

      return { ok: true };
    }

    // Fallback: open with OS default handler (for .app bundles, executables, etc.)
    const result = await shell.openPath(abs);
    if (result) return { error: result };
    return { ok: true };
  } catch (err) {
    return { error: String(err) };
  }
});
