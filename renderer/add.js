const {ipcRenderer} = require('electron')
const {$} = require('./helper')
const path = require('path')

let musicFilesPath = []
$('select-music').addEventListener('click', () => {
    ipcRenderer.send('open-music-file')
})

$('add-music').addEventListener('click', () => {
    ipcRenderer.send('add-tracks', musicFilesPath)                  // 將以選擇的新的path帶入
})

// add.html操作DOM置入檔名
const renderListHTML = (paths) => {
    const musicList = $('musicList')
    const musicItemsHTML = paths.reduce((html, music) => {
        html += `<li class="list-group-item">${path.basename(music)}</li>`   // path.basename:指返回檔名沒有全路徑!!
        return html
    }, '')

    musicList.innerHTML = `<ul class="list-group">${musicItemsHTML}</ul>`
}

let filePaths = []
ipcRenderer.on('selected-file', (event, paths) => {
    // 若filePaths是array才繼續!
    if(Array.isArray(paths))
    {
        renderListHTML(paths)   // 將新增的paths渲染html
        musicFilesPath = paths
    }
})