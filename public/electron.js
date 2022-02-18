const { app, BrowserWindow,ipcMain } = require('electron')
const remoteMain  = require('@electron/remote/main')

require('@electron/remote/main').initialize()


let splash, win
const createWindow = () => {
    const preferences =  {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
    }
    
    splash = new BrowserWindow({
        width:500,
        height:700,
        webPreferences:preferences,
        frame:false,
        resizable:false,
    })
    
    win = new BrowserWindow({
        width: 700,
        height: 900,
        webPreferences:preferences,
        show:false,
        frame:false,
    });

    remoteMain.enable(win.webContents);
    remoteMain.enable(splash.webContents)

    win.removeMenu()
    splash.removeMenu()

    win.loadFile('./build/index.html', { hash: '/application' });
    splash.loadFile('./build/index.html')

    // splash.openDevTools({detached:true})
}

    app.whenReady().then(() => {
        createWindow()
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow()
        })
    })

ipcMain.on('close', ()=>{
    app.quit()
})

ipcMain.on('data', (e, data)=>{
    // sends the data from splash screen to main window
    win.webContents.send('data', data)
})

ipcMain.on('lock', ()=>{
    splash.show()
    win.hide()
})

ipcMain.on('switch', ()=>{
    splash.hide()
    win.show()
})


  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })