const {ipcRenderer} = require('electron')
const {$} = require('./helper')

let musicAudio = new Audio()
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
                <i class="fas fa-play mr-2" data-id="${track.id}"></i> 
                <i class="fa fa-trash-alt" data-id="${track.id}"></i>
            </div>
        </li>`   

        // data--id是要客製化用來取得典籍哪個檔案的屬性 (event 再用dataset.id去取!)
        return html
    }, '')

    const emptyTrackHTML = `<div class="alert alert-primary">No Music on List!</div>`

    trackList.innerHTML = tracks.length ? `<ul class="list-group">${tracksListHTML}</ul>` : emptyTrackHTML
}


// 將選完圖檔渲染
const renderPlayerShowHTML = (path) => {
    const playerShowList = $('player-show')
    // const playerShowListHTML = files.reduce((html, file) => {
    //     // d-flex: 彈性配置容器   justify-content-* 排列方式  align-content-* 垂直堆疊元
    //     html += 
    //     return html
    // }, '')

    // const emptyTrackHTML = `<div class="alert alert-primary">No Music on List!</div>`

    playerShowList.innerHTML = `<img src=${path} alt="Trulli" width="320" height="180" class="center"></img>`
}


const renderClosePlayerShowHTML = () => {
    const playerShowList = $('player-show')
    playerShowList.innerHTML = ``
}



// 拿到目前拿到的選單列表，包含初始mainWindow load完資料 & 選完檔案皆會呼叫此event
ipcRenderer.on('getTracks', (event, tracks) => {
    // console.log("Receive tracks!", tracks)
    allTracks = tracks
    renderListHTML(tracks)
})


const getFileCategory = (fileType) => {
    if(['jpg', 'png', 'gif'].includes(fileType))
        return "image"
    else if(['mp3'].includes(fileType)){
        return "audio"
    }
}


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
                renderPlayerShowHTML(currentTrack.path)
            }
            else{   // 可再改寫
                renderClosePlayerShowHTML()   
                musicAudio.play()
            }
            
        }else{ 
            // 先還原其他圖標 & 再撥放新歌曲
            const resetIconElement = document.querySelector('.fa-pause')
            if(resetIconElement){
                resetIconElement.classList.replace('fa-pause', 'fa-play')
            }

            currentTrack = allTracks.find(track => track.id === id)

            // 才開始播放音樂
            if(getFileCategory(currentTrack.fileType) === "image"){    
                musicAudio.pause()
                renderPlayerShowHTML(currentTrack.path)
            }
            else{   // 可再改寫
                renderClosePlayerShowHTML()
                musicAudio.src = currentTrack.path
                musicAudio.play()
            }
        }
 
        // 播放後改為暫停圖示
        classList.replace('fa-play', 'fa-pause')
    }else if(id && classList.contains('fa-pause')){
        // 圖片撥放取消
        renderClosePlayerShowHTML()   
        // 處理暫停邏輯
        musicAudio.pause()
        classList.replace('fa-pause', 'fa-play')
    }else if(id && classList.contains('fa-trash-alt')){
        // 發送事件並處理刪除邏輯
        ipcRenderer.send('delete-track', id)
    }
})
