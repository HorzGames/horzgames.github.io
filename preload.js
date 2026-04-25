const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('launcher', {
  launch: (key) => ipcRenderer.invoke('launch-game', key)
});
