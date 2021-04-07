const { app, ipcMain, BrowserWindow } = require('electron')
const path = require('path')
const Files = require('./Files');

const files = new Files('./data/nuageit-wealth.json')

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: "./assets/icons/icon.png",
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,      
    }
  })

  win.loadFile('./app/index.html')
  //win.webContents.openDevTools();
}

app.whenReady().then(() => {
  app.setAppUserModelId("NuageIT Wealth Tracker");
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on("exitApp",  (event) => {
  app.quit();
});


ipcMain.on('readJSON', async (e ) => {
  var promise = files.readJSON();
  promise.then( function(result) {    
      e.sender.send('sendJSON', result)        
  }, function(error) {
      console.log(error)
  })
})


//Set settings
ipcMain.on('saveDataFile', (e, value) => {  
  files.writeJSON(value) 
})

ipcMain.on('outputToExcel', async (e, data ) => {
  var promise = files.outputToExcel(data);
  promise.then( function(result) {    
    console.log('Result', result)
      e.sender.send('sendOutPutToExcel', result)        
      
  }, function(error) {
      console.log(error)
  })
})