const Store = require('electron-store')
const {v4: uuidv4} = require('uuid')
const path = require('path')

class DataStore extends Store {
    constructor(settings){
        super(settings)
        this.tracks = this.get('tracks') || []
    }

    // return 'this'  所以就可以用鏈式調用~~  因為有this指標
    saveTracks(){
        this.set('tracks', this.tracks)
        return this
    }

    getTracks(){
        return this.get('tracks') || []
    }

    // tracks 是選好的path array
    addTracks(tracks){
        // 若目前的this.tracks已有就不添加該track
        // 每一筆處理
        const tracksWithProps = tracks.map(track => {
            return {
                // id可用第三方的uuid
                id: uuidv4(),
                path: track,
                fileName: path.basename(track)
            }
        }).filter(track => { // 僅取目前data沒有的
            // 目前的path有哪些:
            const currentTracksPath = this.getTracks().map(track => track.path)
            return currentTracksPath.indexOf(track.path) < 0    
        })

        this.tracks = [...this.tracks, ...tracksWithProps]
        return this.saveTracks()
    }
}

module.exports = DataStore