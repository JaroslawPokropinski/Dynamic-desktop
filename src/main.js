// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const path = require('path');
const skinInfo = require('../config.json');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

let windowMap = new Map();

function createWindow() {
  const { SetWindowPos } = require('./addon');
  console.log(SetWindowPos);
  for (let skin of skinInfo.active) {
    console.log(skin);
    let newWindow = new BrowserWindow({
      width: 450,
      height: 450,
      frame: false,
      transparent: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    });
    const hwndBuffer = newWindow.getNativeWindowHandle();
    const hwnd = hwndBuffer.readInt32LE();

    windowMap.set(skin, newWindow);
    const p = path.join(__dirname, '..', 'skins', skin);
    newWindow.loadFile(p);
    newWindow.on('closed', function() {
      newWindow = null;
    });

    newWindow.on('focus', function() {
      SetWindowPos(hwnd, 1, 0, 0, 0, 0, 0x0013);
    });
    SetWindowPos(hwnd, 1, 0, 0, 0, 0, 0x0013);
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
