const {ipcRenderer} = require('electron')
const {$} = require('./helper')

$('add-music-btn').addEventListener('click', ()=>{
    ipcRenderer.send('add-music-window')
})

ipcRenderer.on('getTracks', (event, tracks) => {
    console.log("Receive tracks!", tracks)
})
// document.getElementById('add-music-btn').addEventListener('click', ()=>{
//     ipcRenderer.send('add-music-window')
// })