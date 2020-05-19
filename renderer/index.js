const {ipcRenderer} = require('electron')

document.getElementById('add-music-btn').addEventListener('click', ()=>{
    ipcRenderer.send('add-music-window')
})