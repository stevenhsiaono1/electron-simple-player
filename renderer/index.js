const {ipcRenderer} = require('electron')
const {$, convertDuration, getSupportVideoTypes, getSupportImageTypes, getSupportAudioTypes} = require('./helper')

let musicAudio = new Audio()
let allTracks
let currentTrack

$('nzxt-page').addEventListener('click', () => {
    ipcRenderer.send('open-nzxt-page')
})

$('add-media-btn').addEventListener('click', ()=>{
    ipcRenderer.send('add-media-window')
})


const getFileCategory = (fileType) => {
    if(getSupportImageTypes().includes(fileType))
        return "image"
    else if(getSupportAudioTypes().includes(fileType)){
        return "audio"
    }
    else if(getSupportVideoTypes().includes(fileType)){
        return "video"
    }
}
// document.getElementById('add-media-btn').addEventListener('click', ()=>{
//     ipcRenderer.send('add-media-window')
// })


// 將選取完檔案渲染mainWindow
const renderListHTML = (tracks) => {
    const trackList = $('tracksList')
    // 每個track的logo assign
    tracks.forEach((track) => {
        if(getFileCategory(track.fileType) === "image"){
            track.typeLogoClass = "fas fa-image"
        }
        else if(getFileCategory(track.fileType) === "audio"){       // audio
            track.typeLogoClass = "fas fa-headphones-alt"
        }
        else if(getFileCategory(track.fileType) === "video"){       // video
            track.typeLogoClass = "fas fa-video"
        }
    })
    
    const tracksListHTML = tracks.reduce((html, track) => {
        // d-flex: 彈性配置容器   justify-content-* 排列方式  align-content-* 垂直堆疊元
        html += `<li class="row music-track list-group-item d-flex justify-content-between align-content-center>
                    <div class="col-10">
                        <i class="${track.typeLogoClass} mr-3 text-secondary">
                            &nbsp;
                            <b>${track.fileName}</b>
                        </i>
                    </div>

                    <div class="col-2">
                        <i class="fas fa-play mr-2" data-id="${track.id}"></i> 
                        <i class="fa fa-trash-alt" data-id="${track.id}"></i>
                    </div>
                    </li>`
        // data--id是要客製化用來取得點擊哪個檔案的屬性 (event 再用dataset.id去取!)
        return html
    }, '')

    const emptyTrackHTML = `<div class="alert alert-primary">No Media on List!</div>`

    trackList.innerHTML = tracks.length ? `<ul class="list-group" style="height: 300px; overflow-y: auto; overflow-x: hidden;">${tracksListHTML}</ul>` : emptyTrackHTML
}


// 將選完圖檔渲染
const renderImagePlayerShowHTML = (path) => {
    const playerShowList = $('player-show')
    console.log("IMAGE>>>")
    console.log(path)
    // const playerShowListHTML = files.reduce((html, file) => {
    //     // d-flex: 彈性配置容器   justify-content-* 排列方式  align-content-* 垂直堆疊元
    //     html += 
    //     return html
    // }, '')

    // const emptyTrackHTML = `<div class="alert alert-primary">No Music on List!</div>`
    playerShowList.innerHTML = `<img id="play-images" src="${path}" alt="Trulli" width="320" height="180" class="center"></img>`
}


// 將選完影片檔渲染
const renderVideoPlayerShowHTML = (path) => {
    const playerShowList = $('player-show')
    playerShowList.innerHTML = `<video id="play-video" width="320" height="240" controls src="${path}" autoplay class="center"></video>`
}


// 將選完Audio檔渲染
const renderAudioPlayerShowHTML = (name, duration) => {
    const playerShowList = $('player-show')
    const playerStatus = $('player-bar')
    const htmlShow = `<div class="col font-weight-bold">
                    Now Playing: ${name}
                  </div>
                  <div class="col">
                    <span id="current-seeker">00:00</span> / ${convertDuration(duration)}
                  </div>`
    const htmlStatus = `<div class="progress"><div class="progress-bar bg-success" 
            id="audio-progress" role="progressbar" style="width: 0%;">
            0%
            </div></div>`

    playerShowList.innerHTML = htmlShow
    playerStatus.innerHTML = htmlStatus
}

const renderClosePlayerShowHTML = () => {
    const playerShowList = $('player-show')
    const bar = $('player-bar')
    playerShowList.innerHTML = ``
    bar.innerHTML = ``
}

// 拿到目前拿到的選單列表，包含初始mainWindow load完資料 & 選完檔案皆會呼叫此event
ipcRenderer.on('getTracks', (event, tracks) => {
    // console.log("Receive tracks!", tracks)
    allTracks = tracks
    renderListHTML(tracks)
})

const updateProgressHTML = (currentTime, duration) => {
    // 避免因duration上為load成功出現NAN    
    if(duration > 0){
        // console.log(currentTime)
        const seeker = $('current-seeker')
        seeker.innerHTML = convertDuration(currentTime)

        const progressPercent = Math.floor(currentTime / duration * 100)
        const bar = $('audio-progress')
        bar.innerHTML = progressPercent + "%"
        bar.style.width = progressPercent + "%"
    }
}

musicAudio.addEventListener('loadedmetadata', () => {
    // 渲染撥放器狀態
    renderAudioPlayerShowHTML(currentTrack.fileName, musicAudio.duration)
})

musicAudio.addEventListener('timeupdate', () => {
    // 更新撥放器狀態(預設以秒為單位)
    updateProgressHTML(musicAudio.currentTime, musicAudio.duration)
})


// 監聽欲播放的事件
$('tracksList').addEventListener('click', (event) => {
    // console.log(event)    // 可以
    event.preventDefault
    const {dataset, classList} = event.target    // 將event中的target(誰觸發此event)的dataset和classList值取出!
    // console.log(dataset)
    // console.log(dataset.id)
    const id = dataset && dataset.id             // id 並非布林值，Ex, var a5 = "Cat" && "Dog";    // 回傳 Dog
    // console.log(id)
    if(id && classList.contains('fa-play')){     // 欲進行播放
        // 一開始要判斷是否已經正在播放之歌曲
        // 但要判斷是當前還是新歌
        if(currentTrack && currentTrack.id === id){    
            // 表示點了先前暫停的歌曲繼續撥放
            if(getFileCategory(currentTrack.fileType) === "image"){    
                renderImagePlayerShowHTML(currentTrack.path)
            }
            else if(getFileCategory(currentTrack.fileType) === "audio"){   // 可再改寫
                renderClosePlayerShowHTML()   
                musicAudio.play()
                renderAudioPlayerShowHTML(currentTrack.fileName, musicAudio.duration)
            }
            else if(getFileCategory(currentTrack.fileType) === "video"){   // 可再改寫
                renderVideoPlayerShowHTML(currentTrack.path)  
                // const video = $('play-video')
                // video.play()
                 
            }

        }else{ 
            // 先還原其他圖標 & 再撥放新歌曲
            renderClosePlayerShowHTML()   // 撥放器清空
            const resetIconElement = document.querySelector('.fa-pause')
            if(resetIconElement){
                resetIconElement.classList.replace('fa-pause', 'fa-play')
            }
            
            currentTrack = allTracks.find(track => track.id === id)
            // 才開始播放音樂
            if(getFileCategory(currentTrack.fileType) === "image"){    
                musicAudio.pause()
                renderImagePlayerShowHTML(currentTrack.path)
            }
            else if(getFileCategory(currentTrack.fileType) === "audio"){   // 可再改寫
                renderClosePlayerShowHTML()
                musicAudio.src = currentTrack.path
                musicAudio.play()
            }
            else if(getFileCategory(currentTrack.fileType) === "video"){ 
                musicAudio.pause()                
                renderVideoPlayerShowHTML(currentTrack.path)
            }
        }
 
        // 播放後改為暫停圖示
        classList.replace('fa-play', 'fa-pause')
    }else if(id && classList.contains('fa-pause')){        
        // 處理暫停邏輯
        musicAudio.pause()
        // 撥放取消
        renderClosePlayerShowHTML()   
        classList.replace('fa-pause', 'fa-play')
    }else if(id && classList.contains('fa-trash-alt')){
        // 發送事件並處理刪除邏輯
        ipcRenderer.send('delete-track', id)    // 先刪避免下方載入時因沒有currentTrack導致出錯!
        if(id === currentTrack.id){
            musicAudio.pause()
            renderClosePlayerShowHTML() 
        }
    }
})


$('delete-all-btn').addEventListener('click', ()=>{
    musicAudio.pause()
    renderClosePlayerShowHTML()
    ipcRenderer.send('delete-all-tracks')
})
