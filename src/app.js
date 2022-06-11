const { app, BrowserWindow, ipcMain, BrowserView, shell, autoUpdater } = require('electron')
var view
const createWindow = () => {
  const win = new BrowserWindow({
    width: 930,
    height: 800,
		frame: false,
    fullscreenable: true,
    hasShadow: true,
    minimizable: true,
    minWidth: 700,
    minHeight: 600,
    defaultFontFamily: "monospace",
    webPreferences: {
      spellcheck: true,
			nodeIntegration: true,
      //devTools: false
    }
  })

  win.loadFile('./src/index.html')
	view = new BrowserView({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })
  win.setBrowserView(view)
  view.setBounds({ x: 0, y: 30, width: 930, height: 800 - 30 })
  //if development
  view.webContents.loadURL('http://localhost:3000/app/')
  // view.webContents.loadURL('https://paper-clip.web.app/app/')
	view.setAutoResize({ width: true, height: true })
  view.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
    return false
  })
  view.webContents.on('ipc-message', (event, name, arg) => {
    if (name == 'theme') {
      win.webContents.send('setTheme', arg)
    }
    if (name == 'title') {
      win.setTitle(arg)
      win.webContents.send('title', arg)
    }
  })
}
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
ipcMain.on('maximize', (event, arg) => {
	if (BrowserWindow.getFocusedWindow().isMaximized()) {
		BrowserWindow.getFocusedWindow().unmaximize()
	} else {
		BrowserWindow.getFocusedWindow().maximize()
	}
})
ipcMain.on('minimize', (event, arg) => {
	BrowserWindow.getFocusedWindow().minimize()
})
ipcMain.on('close', (event, arg) => {
	BrowserWindow.getFocusedWindow().close()
})
ipcMain.on('devtools', (event, arg) => {
  if (view.webContents.isDevToolsOpened()) {
    view.webContents.closeDevTools()
  } else {
    view.webContents.openDevTools()
  }
})

const updateServer = "https://paperclip-desktop-update-server.vercel.app/"
const url = `${updateServer}/update/${process.platform}/${app.getVersion()}`

autoUpdater.setFeedURL({ url })

/* app.setAsDefaultProtocolClient('paper-clip');
app.on('open-url', function (event, data) {
  event.preventDefault();
  console.log(data)
}); 
json:

    "protocols": {
      "name": "paperclip-com-protocol",
      "schemes": [
        "paper-clip"
      ]
    }*/