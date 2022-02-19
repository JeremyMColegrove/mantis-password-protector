const { app, BrowserWindow,ipcMain, ipcRenderer } = require('electron')
const remoteMain  = require('@electron/remote/main')
const isDev = require('electron-is-dev')
require('@electron/remote/main').initialize()

const { autoUpdater } = require("electron-updater")
autoUpdater.autoDownload = false
// autoUpdater.logger = console.log;
// autoUpdater.logger.transports.file.level = "info";
// autoUpdater.logger = console.log;



let login, win, updater

// closes the updater and launches the login
function closeUpdater() {
    setTimeout(()=>{
        createLogin()
        updater.close()
    }, 3000)
}

// triggers for updating
autoUpdater.on("update-available", ()=>{
    autoUpdater.downloadUpdate()
    sendData('update-available', updater, null)
})

autoUpdater.on('checking-for-update', ()=>{
    sendData('checking-for-update', updater, null)

})

autoUpdater.on("update-not-available", ()=>{
    // close the updater and launch the login
    closeUpdater()
})

autoUpdater.on('error', (err)=>{
    closeUpdater()
})

autoUpdater.on('download-progress', progressObj => {
    sendData('download-progress', updater, progressObj)
})

autoUpdater.on('update-downloaded', (info) => {
    autoUpdater.quitAndInstall(false, true)
});

const preferences =  {
    nodeIntegration: true,
    enableRemoteModule: true,
    contextIsolation: false,
}

const createLogin = () => {

    login = new BrowserWindow({
        width:500,
        height:700,
        webPreferences:preferences,
        frame:false,
        resizable:false,
        show:false
    })
    
    remoteMain.enable(login.webContents)

    login.removeMenu()

    if (isDev) {
        login.loadURL('http://localhost:3000')
    } else {
        login.loadFile('./build/index.html')
    }

    login.once('ready-to-show', ()=>{
        login.show()
    })
}

const createApplication = () => {
    win = new BrowserWindow({
        width: 700,
        height: 900,
        webPreferences:preferences,
        show:false,
        frame:false,
    });
    remoteMain.enable(win.webContents);
    win.removeMenu()
    if (isDev) {
        win.loadURL('http://localhost:3000#/application', { hash: '/application' });
    } else {
        win.loadFile('./build/index.html', { hash: '/application' });
    }

    win.once('ready-to-show', ()=>{
        win.show()
    })
}

function instantiateUpdater() {
    updater = new BrowserWindow({
        width: 300,
        height: 300,
        webPreferences:preferences,
        show:false,
        frame:false,
        center:true,
        alwaysOnTop:true
    })

    remoteMain.enable(updater.webContents);
    updater.removeMenu()

    
    if (isDev) {
        updater.loadURL('http://localhost:3000#/updater', { hash: '/updater' });
    } else {
        updater.loadFile('./build/index.html', { hash: '/updater' });
    }
    
    updater.once('ready-to-show', ()=>{
        autoUpdater.checkForUpdates()

        updater.show()
    })
    // updater.webContents.openDevTools({detached:true});
}

function sendData(trigger, window, data) {
    if (window == null) {
        console.error("Something went wrong, please contact an admin.")
    }
    window.send(trigger, data);
}

app.whenReady().then(() => {
    instantiateUpdater()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            // updater = instantiateUpdater()
            instantiateUpdater()
        }
    })
})

ipcMain.on('close', ()=>{
    app.quit()
})

ipcMain.on('lock', ()=>{
    createLogin()
    win.close()
    win = null
})

ipcMain.on('switch', (event, data)=>{
    createApplication()
    win.once('ready-to-show', ()=> {
        sendData('data', win, data)
    })
    login.close()
    login = null
})


app.on('window-all-closed', () => {
if (process.platform !== 'darwin') app.quit()
})