const Application = require('spectron').Application
// const assert = require('assert')
// const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')
var chai = require('chai')
const assert = chai.assert;
const { expect } = require('chai');


describe('Application launch', function () {
  this.timeout(10000)


  beforeEach(function () {
    this.app = new Application({

      // Your electron path can be any binary
      // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
      // But for the sake of the example we fetch it from our node_modules.
      
    //   path: electronPath,
        path: "./build/win-unpacked/electron-simple-player.exe",

      // Assuming you have the following directory structure

      //  |__ my project
      //     |__ ...
      //     |__ main.js
      //     |__ package.json
      //     |__ index.html
      //     |__ ...
      //     |__ test
      //        |__ spec.js  <- You are here! ~ Well you should be.

      // The following line tells spectron to look and use the main.js file
      // and the package.json located 1 level above.
      args: [path.join(__dirname, '..')]
    })
    return this.app.start()
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  // OK
  it('shows an initial window', function () {
    return this.app.client.getWindowCount().then(function (count) {
      assert.equal(count, 1)
      // Please note that getWindowCount() will return 2 if `dev tools` are opened.
      // assert.equal(count, 2)
    })
  })
  
})


const app = new Application({
  // path: "./build/win-unpacked/electron-simple-player.exe",
  path: "./build/win-unpacked/electron-simple-player.exe",
  args: [path.join(__dirname, '..')],
});


describe('Application launch', function () {
  this.timeout(10000);

  beforeEach(() => {
    return app.start();
  });

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  // OK
  it('shows an initial window', async () => {
    const count = await app.client.getWindowCount();
    return assert.equal(count, 1);
  });  
});


describe('Basic Flow', function () {
  // 時間較長避免timeout
  this.timeout(50000);                              

  beforeEach(() => {
    return app.start();
  });

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  // OK 256ms
  it('Check application name', async () => {
    const title = await app.client.waitUntilWindowLoaded().getTitle();
    return assert.equal(title, 'Player');
  });

  // OK 12604ms
  it('Main Logo to Official Website & Check Intro Text', async() => {
    await app.client.waitUntilWindowLoaded();
    await app.client.click('#nzxt-page');
    const mainIntro = await app.client.getText('//*[@id="overflow-hidden"]/section[1]/div[3]/div/div[2]/h1')
    return assert.equal(mainIntro, '為電腦玩家與組裝者打造的機殼、散熱器材與配件。');  
  });

  // OK
  it('Add Media to List', async() => {
    await app.client.waitUntilWindowLoaded();
    const addListBtn = await app.client.getText('#add-media-btn')
    return assert.equal(addListBtn, 'Add Media to List');
  });

  // OK
  it('Add Media to List Window Text', async() => {
    await app.client.waitUntilWindowLoaded();
    await app.client.click('#add-media-btn');
    // switch to select window (could check by getCurrentTabId())
    await app.client.switchWindow('add.html')    
    const selectMusic = await app.client.getText('#select-media')
    assert.equal(selectMusic, 'Select Media');
    const addMusic = await app.client.getText('#add-media')
    assert.equal(addMusic, 'Confirm & Add');
  });
});



describe('Music Control', function () {
  // 時間較長避免timeout
  this.timeout(50000);                              

  beforeEach(() => {
    return app.start();
  });

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  // OK
  it('Upload Music to Selected List ', async() => {
    await app.client.waitUntilWindowLoaded();
    await app.client.click('#add-media-btn');
    // switch to select window (could check by getCurrentTabId())
    await app.client.switchWindow('add.html')    
    await app.client.waitForExist('#select-media')
    await app.client.click('#select-media');
    app.client.chooseFile('#select-media', '../resources//audio//1.mp3')
    await app.client.click('#add-media');
  });
});
