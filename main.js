const {app, BrowserWindow, ipcMain} = require('electron')

app.on('ready', () =>{
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences:{
            nodeIntegration: true,   // 如此在renderer.js可以調用nodejs的API
        }
    });

    mainWindow.loadFile('./renderer/index.html');

    // ipcMain監聽
    ipcMain.on('add-music-window', () => {
        console.log("receive add")
        const addWindow = new BrowserWindow({
            width: 500,
            height: 400,
            webPreferences:{
                nodeIntegration: true,  
            }
        });
    
        addWindow.loadFile('./renderer/add.html');
    })
});