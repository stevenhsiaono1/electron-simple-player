const {ipcRenderer} = require('electron')
const {$} = require('./helper')

let musicAudio = new Audio
let allTracks
let currentTrack


$('nzxt-page').addEventListener('click', () => {
    ipcRenderer.send('open-nzxt-page')
})

$('add-music-btn').addEventListener('click', ()=>{
    ipcRenderer.send('add-music-window')
})

// document.getElementById('add-music-btn').addEventListener('click', ()=>{
//     ipcRenderer.send('add-music-window')
// })


// 將選取完檔案渲染mainWindow
const renderListHTML = (tracks) => {
    const trackList = $('tracksList')
    const tracksListHTML = tracks.reduce((html, track) => {
        // d-flex: 彈性配置容器   justify-content-* 排列方式  align-content-* 垂直堆疊元
        html += `<li class="row music-track list-group-item d-flex justify-content-between align-content-center>
            <div class="col-10">
                <i class="fas fa-headphones-alt mr-3 text-secondary">
                    <b>${track.fileName}</b>
                </i>
            </div>

            <div class="col-2">
                <i class="fas fa-play mr-2 data-id="${track.id}"></i>
                <i class="fa fa-trash-alt data-id="${track.id}"></i>
            </div>
        </li>`   

        return html
    }, '')

    const emptyTrackHTML = `<div class="alert alert-primary">No Music on List!</div>`

    trackList.innerHTML = tracks.length ? `<ul class="list-group">${tracksListHTML}</ul>` : emptyTrackHTML
}


// 拿到目前拿到的選單列表，包含初始mainWindow load完資料 & 選完檔案皆會呼叫此event
ipcRenderer.on('getTracks', (event, tracks) => {
    // console.log("Receive tracks!", tracks)
    allTracks = tracks
    renderListHTML(tracks)
})

$('tracksList').addEventListener('click', (event) => {
    event.preventDefault
})
