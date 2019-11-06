// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const path = require('path');
let skinInfo = require('../config.json');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

let configWindow;

function createConfigWindow() {
  configWindow = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  configWindow.loadFile(path.join(__dirname, '..', 'src', 'index.html'));
  configWindow.once('ready-to-show', () => {
    configWindow.show(true);
  });

  configWindow.on('closed', function() {
    configWindow = null;
  });
}

let windowMap = new Map();

function loadWindows() {
  const {
    SetWindowPos,
    SWP_NOACTIVATE,
    SWP_NOSIZE,
    SWP_NOMOVE,
    HWND_BOTTOM
  } = require('win-setwindowpos');

  for (let skin of skinInfo.skins) {
    let newWindow = new BrowserWindow({
      width: skin.size.w,
      height: skin.size.h,
      x: skin.position.x,
      y: skin.position.y,
      // frame: false,
      // show: false,
      minimizable: false,
      maximizable: false,
      transparent: true,
      webPreferences: {
        nodeIntegration: true
      }
    });
    const hwndBuffer = newWindow.getNativeWindowHandle();
    const hwnd = hwndBuffer.readBigUInt64LE();

    newWindow.setSkipTaskbar(true);
    // newWindow.setIgnoreMouseEvents(true, { forward: true });
    windowMap.set(skin, newWindow);
    const p = path.join(__dirname, '..', 'skins', skin.source);
    newWindow.loadURL('file://' + p);
    newWindow.on('closed', function() {
      newWindow = null;
    });
    newWindow.on('close', function() {
      const id = skinInfo.skins.findIndex(s => s.source === skin.source);
      skinInfo.skins[id].position = {
        x: newWindow.getPosition()[0],
        y: newWindow.getPosition()[1]
      };
    });
    const setBottom = () =>
      SetWindowPos(
        hwnd,
        HWND_BOTTOM,
        0,
        0,
        0,
        0,
        SWP_NOACTIVATE | SWP_NOSIZE | SWP_NOMOVE
      );
    newWindow.once('ready-to-show', () => {
      newWindow.show(true);
      setBottom();
    });

    newWindow.on('focus', function() {
      setBottom();
    });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  createConfigWindow();
  loadWindows();
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

app.on('before-quit', function() {
  const fs = require('fs');
  fs.writeFile('config.json', JSON.stringify(skinInfo, null, 2), function(err) {
    if (err) return console.log(err);
    console.log(JSON.stringify(skinInfo, null, 2));
    console.log('writing to ' + 'config.json');
  });
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
