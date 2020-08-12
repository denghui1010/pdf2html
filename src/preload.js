import { ipcRenderer } from "electron";
import { remote } from "electron";
window.ipcRenderer = ipcRenderer;
window.remote = remote;
