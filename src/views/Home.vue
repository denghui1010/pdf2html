<template lang="pug">
    .home(@drop="onDrop", @dragover="dragover")
        .file-area(v-if="fileList&&fileList.length>0")
            .file-nav 
                .nav1 文件名称(file name)
                .nav2 文档标题(html title)
            .filelist
                .file-item(:class="{success:file.status==='success', error:file.status==='error'}", v-for="(file, index) in fileList", :key="index")
                    .item-content
                        .file-index {{index+1}}
                        .file-name 
                            span {{file.name}}
                            span.status(v-if="file.status") {{file.status}}
                        .file-title
                            textarea(v-model="file.title", placeholder="不填默认为文件名(default file name)")
                        .file-remove(@click="onRemoveClick(index)")
                    .item-error(v-if="file.error") {{file.error}}
            .opt
                .btn.clear(@click="onClearClick") 清空(remove all)
                .btn.transferbtn(@click="onTransferClick") 转换(transfer)
        .drag-tip(v-else) 
            div 拖拽文件或文件夹到这里!<br>drag and drop file/folder here!
        .bottom
            .log {{log}}
            .bottom-groups
                img.icon(src="@/assets/icon_file.png", @click="onOpenClick")
                img.icon(src="@/assets/icon_setting.png", @click="onSettingClick")
        setting(:show.sync="showSetting")
</template>

<script>
import Setting from "./Setting";
const fs = window.require("fs");
const path = window.require("path");
const { ipcRenderer } = window.require("electron");
const { dialog } = window.require("electron").remote;
export default {
    components: { Setting },
    data() {
        return {
            fileList: [],
            showSetting: false,
            log:
                "Developed by liudenghui. https://github.com/denghui1010/pdf2html"
        };
    },
    created() {
        ipcRenderer.on("onTransferProcess", (event, file) => {
            console.log("onTransferProcess", file);
            for (let one of this.fileList) {
                if (one.path === file.path) {
                    one.status = "handling...";
                    one.error = "";
                    break;
                }
            }
            this.fileList = this.fileList.slice();
        });
        ipcRenderer.on("onTransferSuccess", (event, file) => {
            console.log("onTransferSuccess", file);
            for (let one of this.fileList) {
                if (one.path === file.path) {
                    one.status = "success";
                    one.error = "";
                    break;
                }
            }
            this.fileList = this.fileList.slice();
        });
        ipcRenderer.on("onTransferError", (event, file, error) => {
            console.log("onTransferError", file);
            for (let one of this.fileList) {
                if (one.path === file.path) {
                    one.status = "error";
                    one.error = error;
                    break;
                }
            }
            this.fileList = this.fileList.slice();
        });
    },
    beforeDestroy() {
        ipcRenderer.removeAllListeners("onTransferSuccess");
        ipcRenderer.removeAllListeners("onTransferProcess");
    },
    methods: {
        parseFileTile(name) {
            if (name.indexOf("产品说明书") > -1) {
                return "产品说明书";
            } else if (name.indexOf("风险揭示书") > -1) {
                return "风险揭示书";
            } else if (name.indexOf("投资者权益须知") > -1) {
                return "投资者权益须知";
            } else if (name.indexOf("销售文件目录") > -1) {
                return "销售文件目录";
            } else if (name.indexOf("销售协议书") > -1) {
                return "销售协议书";
            } else if (name.indexOf("预约申购申请书") > -1) {
                return "预约申购申请书";
            } else if (name.indexOf("预约赎回申请书") > -1) {
                return "预约赎回申请书";
            } else if (name.indexOf("产品销售文件") > -1) {
                return "产品销售文件";
            } else if (name.indexOf("产品协议书") > -1) {
                return "产品协议书";
            } else if (name.indexOf("代理销售理财子") > -1) {
                return "代销总协议";
            }
            return name;
        },
        isExist(path) {
            for (let file of this.fileList) {
                if (file.path === path) {
                    return true;
                }
            }
            return false;
        },
        addFile(file) {},
        listFiles(files) {
            let totoalCount = 0;
            let validCount = 0;
            let invalidCount = 0;
            let duplicateCount = 0;
            const addFile = file => {
                totoalCount++;
                if (!file.path.endsWith(".pdf")) {
                    invalidCount++;
                } else if (this.isExist(file.path)) {
                    duplicateCount++;
                } else {
                    validCount++;
                    const f = {};
                    f.name = file.name.replace(path.extname(file.name), "");
                    f.title = this.parseFileTile(f.name);
                    f.path = file.path;
                    this.fileList.push(f);
                }
            };
            try {
                for (let file of files) {
                    console.log(file);
                    const stats = fs.statSync(file.path);
                    if (stats.isDirectory()) {
                        const innerFiles = fs.readdirSync(file.path);
                        innerFiles.forEach(innerFile => {
                            addFile({
                                name: innerFile,
                                path: path.resolve(file.path, innerFile)
                            });
                        });
                    } else {
                        addFile(file);
                    }
                }
            } catch (err) {
                console.error(err);
                this.log = err;
            }
            this.log = `add ${totoalCount} files, ${validCount} valid, ${invalidCount} invalid, ${duplicateCount} duplicate`;
            console.log(this.fileList);
        },
        onDrop(e) {
            e.preventDefault();
            const files = [];
            [].forEach.call(
                e.dataTransfer.files,
                file => {
                    files.push(file);
                },
                false
            );
            this.listFiles(files);
        },
        dragover(e) {
            e.preventDefault();
        },
        onRemoveClick(index) {
            this.fileList.splice(index, 1);
        },
        onClearClick() {
            this.fileList = [];
            this.log = "";
        },
        onTransferClick() {
            ipcRenderer.send("onTransfer", this.fileList);
        },
        onOpenClick() {
            dialog
                .showOpenDialog({
                    properties: [
                        "openFile",
                        "openDirectory",
                        "multiSelections"
                    ],
                    filters: [{ name: "PDF", extensions: ["pdf"] }],
                    securityScopedBookmarks: true
                })
                .then(result => {
                    const files = [];
                    for (let filePath of result.filePaths) {
                        files.push({
                            path: filePath,
                            name: path.basename(filePath)
                        });
                    }
                    if (files.length > 0) {
                        this.listFiles(files);
                    }
                });
        },
        onSettingClick() {
            this.showSetting = true;
        }
    }
};
</script>

<style lang="stylus" scoped>
@import '~@/styles/mixin.styl';

.home {
    height: 100vh;
    display: flex;
    flex-direction: column;

    .drag-tip {
        height: 0;
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
    }

    .file-area {
        height: 0;
        flex-grow: 1;
        display: flex;
        flex-direction: column;

        .file-nav {
            display: flex;
            padding: 4px;
            background: #eee;
            text-align: center;

            .nav1 {
                width: 0;
                flex-grow: 1;
            }

            .nav2 {
                width: 0;
                flex-grow: 1;
            }
        }

        .filelist {
            overflow: auto;
            border: 1px solid #ddd;
            text-align: left;

            .success {
                background: rgba(0, 255, 0, 0.05);
            }

            .error {
                background: rgba(255, 0, 0, 0.05);
            }

            .file-item {
                border-bottom: 1px solid #ddd;

                &:last-child {
                    border-bottom: none;
                }

                .item-content {
                    display: flex;

                    .file-index {
                        align-self: center;
                        padding: 0 10px;
                        font-size: 14px;
                        width: 18px;
                    }

                    .file-name {
                        padding: 15px 8px;
                        width: 0;
                        flex-grow: 1;
                        border-left: 1px solid #ddd;
                        border-right: 1px solid #ddd;
                        font-size: 14px;

                        .status {
                            margin-left: 4px;
                            font-size: 12px;
                            border-radius: 2px;
                            background: #eee;
                            padding: 0 4px;
                        }
                    }

                    .file-title {
                        padding: 6px 8px;
                        width: 0;
                        flex-grow: 1;
                        display: flex;
                        font-size: 14px;
                        border-right: 1px solid #ddd;

                        input {
                            flex-grow: 1;
                        }

                        textarea {
                            flex-grow: 1;
                        }
                    }

                    .file-remove {
                        align-self: center;
                        icon('~@/assets/icon_close.png', 20px, 20px);
                        margin: 0 6px;
                    }
                }

                .item-error {
                    padding: 0 10px 10px 10px;
                    border-top: 1px solid #ddd;
                    font-size: 14px;
                    color: rgba(200, 0, 0, 0.8);
                }
            }
        }

        .opt {
            display: flex;
            justify-content: center;

            .btn {
                border-radius: 4px;
                padding: 4px 8px;
                background: #ddd;
                margin: 10px;

                &:first-child {
                    margin-left: 0;
                }

                &:last-child {
                    margin-right: 0;
                }
            }
        }
    }

    .bottom {
        display: flex;
        background: #eee;
        align-items: center;
        height: 40px;
        padding: 0 12px;

        .bottom-groups {
            .icon {
                width: 25px;
                height: 25px;
                margin-left: 25px;
            }
        }

        .log {
            flex-grow: 1;
            font-size: 14px;
            text-align: left;
        }
    }
}
</style>
