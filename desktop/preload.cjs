const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('coachGadoDesktop', {
  connect: (server) => ipcRenderer.invoke('server:connect', server)
})
