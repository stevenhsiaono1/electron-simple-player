const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const DataStore = require('./renderer/MusicDataStore')

// 初始化DataStore
const myStore = new DataStore({'name':'MediaData'})  // 初始化的setting 可參考文件> 此為data存放檔名 

// 封裝原本兩個BrowserWindow
class AppWindow extends BrowserWindow{
    constructor(config, fileLocation){
        const basicConfig = {
            width: 1024,
            height: 768,
            webPreferences:{
                nodeIntegration: true   // 如此在renderer.js可以調用nodejs的API
                // devTools: false
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
    // 因為這裡也需要帶出列表>> 可使用webContent did-finish-load事件
    
    // 開啟公司官網(也可以考慮開新window!)
    ipcMain.on('open-nzxt-page', () => {
        mainWindow.loadURL("https://www.nzxt.com/")
    }) 

    // 未來想拿來作轉圈圈~
    // mainWindow.webContents.on('did-start-loading', () => {
    //     console.log("SSSSPPPPPPINNNNNNN")    
    // })

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.send('getTracks', myStore.getTracks())    // 和添加完音樂欲渲染的事件相同!  差在夾帶不同內容
    })

    // const mainWindow = new BrowserWindow({
    //     width: 800,
    //     height: 600,
    //     webPreferences:{
    //         nodeIntegration: true,   // 如此在renderer.js可以調用nodejs的API
    //     }
    // });

    // mainWindow.loadFile('./renderer/index.html');

    // ipcMain監聽
    let addWindow
    ipcMain.on('add-music-window', () => {
        console.log("receive add")

        // 以下監聽到後創建的window也改用封裝
        addWindow = new AppWindow({
            width: 600,
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

    ipcMain.on('open-music-file', (event) => {
        console.log("get select music");
        dialog.showOpenDialog({                                 // 使用electron 的選擇後的文件
            properties: ["openFile", "multiSelections"],
            filters: [
                {name: 'Music', extensions: ['mp3']},
                { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
            ]
        }).then(filesPath => {
            // console.log(filesPath.filePaths);
            event.sender.send('selected-file', filesPath.filePaths);   // 留意: 取filePaths才是array(可下console.log看) 轉成array較單純~~
        }).catch(err => {
            console.log(err)
        })
    })

    //監聽選好的檔
    ipcMain.on('add-tracks', (event, tracks) => {
        // console.log(tracks)
        // 收到後存到DataStore
        const updatedTracks = myStore.addTracks(tracks).getTracks()    // add後同時也存於檔案
        // console.log(updatedTracks)
        // 接下來將update後的tracks供mainWindow渲染, 另外第一次進mainWindow也需要帶出渲染，更新於建立mainWindow後
        mainWindow.send('getTracks', updatedTracks)
        addWindow.close()               // 關閉add window
        mainWindow.show()               // 重show mainwindow (可能有更好做法?   可再研究)
    }) 

    ipcMain.on('delete-track', (event, id) => {
        const updatedTracks = myStore.deleteTrack(id).getTracks()
        mainWindow.send('getTracks', updatedTracks)
    })

    ipcMain.on('delete-all-tracks', (event) => {
        const updatedTracks = myStore.deleteAllTrack().getTracks()
        mainWindow.send('getTracks', updatedTracks)
    })

});