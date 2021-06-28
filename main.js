const { app, ipcMain, BrowserWindow, dialog } = require("electron");
const path = require("path");
const Files = require("./Files");

process.env.NODE_ENV = "prod";

const isDev = process.env.NODE_ENV === "prod" ? true : false;
const isMac = process.platform === "darwin" ? true : false;

const files = new Files("nuageit-wealth.json");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: "./assets/icons/icon.png",
    show: true,
    autoHideMenuBar: isDev,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("./app/index.html");
  //win.webContents.openDevTools();
}

app.whenReady().then(() => {
  app.setAppUserModelId("NuageIT Wealth Tracker");
  createWindow();
  files.checkDefaultFile();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("exitApp", (event) => {
  app.quit();
});

ipcMain.on("readJSON", async (e) => {
  var promise = files.readJSON();
  promise.then(
    function (result) {
      e.sender.send("sendJSON", result);
    },
    function (error) {
      console.log(error);
    }
  );
});

//Set settings

ipcMain.on("openExportDialog", (e, value) => {
  const options = {
    filters: [{ name: "Link Files", extensions: ["xlsx"] }],
    properties: ["openDirectory"],
    title: "Select Export Folder",
    buttonLabel: "Select Folder",
  };
  dialog.showOpenDialog(mainWindow, options).then((result) => {
    exportFolder = result.filePaths.toString();
    e.sender.send("folderName", result.filePaths);
  });
});

ipcMain.on("saveDataFile", (e, value) => {
  files.writeJSON(value);
});

ipcMain.on("outputToExcel", async (e, folderName, data) => {
  try {
    var fileOutput = await files.outputToExcel(folderName, data);
    e.sender.send("sendOutPutToExcel", true, fileOutput);
  } catch (err) {
    console.log(err);
    e.sender.send("sendOutPutToExcel", false, err);
  }
});
