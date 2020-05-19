// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.


// 可使用node API 和DOM API
// alert(process.versions.node)  // node API

// 測試向main.js 發送訊息 (透過IPC)
const {ipcRenderer} = require('electron')

window.addEventListener('DOMContentLoaded',() =>{       // DOM API 也可以實現~!
    // alert('Greeting from DOM side'); 

    ipcRenderer.send('message', 'hello from renderer!');   // 測試從renderer發送給

    // 測試接收從renderer的訊息
    ipcRenderer.on('reply', (event, arg)=>{
        // 可以操作dom!!!
        document.getElementById("message").innerHTML = arg;
    });
})