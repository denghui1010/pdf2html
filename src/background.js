"use strict";

import { app, protocol, BrowserWindow, Menu } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
const isDevelopment = process.env.NODE_ENV !== "production";
var path = require("path");
var fs = require("fs");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: "app", privileges: { secure: true, standard: true } }
]);

const menu = Menu.buildFromTemplate([
    {
        label: app.name,
        submenu: [{ role: "about" }, { role: "quit" }]
    },
    { role: "editMenu" },
    { role: "viewMenu" },
    { role: "windowMenu" },
    { role: "help" }
]);
Menu.setApplicationMenu(menu);

const about = {
    applicationName: app.name,
    applicationVersion: app.getVersion(),
    version: app.getVersion(),
    copyright: "百信银行 智慧财富事业部",
    authors: ["liudenghui"]
};
console.log(about);
app.setAboutPanelOptions(about);

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: "#fff",
        center: true,
        resizable: false,
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            webSecurity: false,
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js")
        }
    });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
        if (!process.env.IS_TEST) win.webContents.openDevTools();
    } else {
        createProtocol("app");
        // Load the index.html when not in development
        win.loadURL("app://./index.html");
    }

    win.on("closed", () => {
        win = null;
    });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        // try {
        //   await installExtension(VUEJS_DEVTOOLS);
        // } catch (e) {
        //   console.error("Vue Devtools failed to install:", e.toString());
        // }
    }
    createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === "win32") {
        process.on("message", data => {
            if (data === "graceful-exit") {
                app.quit();
            }
        });
    } else {
        process.on("SIGTERM", () => {
            app.quit();
        });
    }
}

// read setting
const setting = fs.readFileSync(path.resolve(__static, "setting.json"));
global.setting = JSON.parse(setting);
console.log("setting", global.setting);

const { ipcMain } = require("electron");
const pdf2html = require("./node/pdf2html");

// transfer pdf
ipcMain.on("onTransfer", (event, fileList) => {
    console.log("onTransfer", fileList);
    for (let file of fileList) {
        if (global.setting.mode === "canvas") {
            event.reply("onTransferProcess", file);
            pdf2html(file)
                .then(res => {
                    event.reply("onTransferSuccess", file);
                })
                .catch(error => {
                    event.reply("onTransferError", file, error);
                    console.error(error);
                });
        } else if (global.setting.mode === "image") {
            // pdf2img(file.path);
        }
    }
});

// save setting
ipcMain.on("onSaveSetting", (event, setting) => {
    // console.log(fileList);
    let curr = global.setting;
    const now = Object.assign({}, curr, setting);
    const nowSetting = JSON.stringify(now);
    fs.writeFileSync(path.resolve(__static, "setting.json"), nowSetting);
    global.setting = now;
});

// get setting
global.getSetting = params => {
    const setting = Object.assign({}, global.setting);
    for (let key in setting) {
        if (key.endsWith("_default")) {
            const k = key.replace("_default", "");
            // if setting[k] have no value, set default value to it
            if (!setting[k]) {
                setting[k] = setting[key];
            }
        }
    }
    return setting;
};
