const {app, BrowserWindow, ipcMain} = require('electron')

// 封裝原本兩個BrowserWindow
class AppWindow extends BrowserWindow{
    constructor(config, fileLocation){
        const basicConfig = {
            width: 800,
            height: 600,
            webPreferences:{
                nodeIntegration: true,   // 如此在renderer.js可以調用nodejs的API
            }
        }

        // 再將config 覆蓋 basicConfig相異部分
        // const finalConfig = Object.assign(basicConfig, config)  // 可以這麼寫但用更新的ES6好了~
        // 採用ES6:(https://ithelp.ithome.com.tw/articles/10195477)  香同時採用後者
        const finalConfig = {...basicConfig, ...config}
        super(finalConfig)   // 將finalConfig 輸入進父類constructor
        // 還需要loadfile: 所以constructor還要多帶一個file path
        this.loadFile(fileLocation)
        // 避免看到未完成的頁面，採用ready-to-show
        this.once('ready-to-show', () => {
            this.show()
        })

    }
}



app.on('ready', () =>{
    // 下方mainWindow改為以下
    const mainWindow = new AppWindow({},'./renderer/index.html')

    // const mainWindow = new BrowserWindow({
    //     width: 800,
    //     height: 600,
    //     webPreferences:{
    //         nodeIntegration: true,   // 如此在renderer.js可以調用nodejs的API
    //     }
    // });

    // mainWindow.loadFile('./renderer/index.html');

    // ipcMain監聽
    ipcMain.on('add-music-window', () => {
        console.log("receive add")

        // 以下監聽到後創建的window也改用封裝
        const addWindow = new AppWindow({
                width: 500,
                height: 400,
                parent:mainWindow
            }, './renderer/add.html')


        // const addWindow = new BrowserWindow({
        //     width: 500,
        //     height: 400,
        //     webPreferences:{
        //         nodeIntegration: true,  
        //     }
        //     parent: mainWindow
        // });
        // addWindow.loadFile('./renderer/add.html');
    })
});