<template lang="pug">
    .home(@drop="onDrop", @dragover="dragover")
        .file-area(v-if="fileList&&fileList.length>0")
            .file-nav 
                .nav1 文件名称
                .nav2 文档标题
            .filelist
                .file-item(v-for="(file, index) in fileList", :key="index") 
                    .file-name {{file.name}}
                    .file-title
                        input(placeholder="不填默认为文件名称")
            .opt
                .btn.clear(@click="onClearClick") 清空
                .btn.selectAll(@click="onSelectAllClick") 全选
                .btn.remove(@click="onRemoveClick") 移除
                .btn.transferbtn(@click="onTransferClick") 转换
        .drag-tip(v-else) 
            div 拖拽文件或文件夹到这里!
        .bottom
            .log {{log}}
            .bottom-groups
                img.icon.settingicon(src="@/assets/icon_file.png", @click="onOpenClick")
                img.icon.openicon(src="@/assets/icon_setting.png", @click="onSettingClick")
        setting(:show.sync="showSetting")
</template>

<script>
import Setting from "./Setting";
const fs = window.require("fs");
const path = window.require("path");
export default {
    components: { Setting },
    data() {
        return {
            fileList: [
                // { name: "123" }, { name: "234" }
            ],
            showSetting: false,
            log: ""
        };
    },
    methods: {
        onDrop(e) {
            e.preventDefault();
            const files = [];
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
                    f.name = file.name;
                    f.path = file.path;
                    this.fileList.push(f);
                }
            };
            [].forEach.call(
                e.dataTransfer.files,
                file => {
                    console.log(file);
                    fs.stat(file.path, (err, stats) => {
                        if (err) {
                            console.error(err);
                            this.log = err;
                            return;
                        }
                        if (stats.isDirectory()) {
                            fs.readdir(file.path, (err, innerFiles) => {
                                if (err) {
                                    console.error(err);
                                    this.log = err;
                                    return;
                                }
                                innerFiles.forEach(innerFile => {
                                    console.log(innerFile);
                                    addFile({
                                        name: innerFile,
                                        path: path.resolve(file.path, innerFile)
                                    });
                                });
                            });
                        } else {
                            addFile(file);
                        }
                    });
                },
                false
            );
            this.log = `add ${totoalCount} files, ${validCount} valid, ${invalidCount} invalid, ${duplicateCount} duplicate`;
            console.log(this.fileList);
        },
        isExist(path) {
            for (let file of this.fileList) {
                if (file.path === path) {
                    return true;
                }
            }
            return false;
        },
        dragover(e) {
            e.preventDefault();
        },
        onClearClick() {
            this.fileList = [];
        },
        onSelectAllClick() {},
        onRemoveClick() {},
        onTransferClick() {
            window.ipcRenderer.send("onTransfer", this.fileList);
        },
        onOpenClick() {},
        onSettingClick() {
            this.showSetting = true;
        }
    }
};
</script>

<style lang="stylus" scoped>
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
            background: #ddd;
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

            .file-item {
                display: flex;
                border-bottom: 1px solid #ddd;

                &:last-child {
                    border-bottom: none;
                }

                .file-name {
                    padding: 10px 8px;
                    width: 0;
                    flex-grow: 1;
                    border-right: 1px solid #ddd;
                    font-size: 14px;
                }

                .file-title {
                    padding: 6px 8px;
                    width: 0;
                    flex-grow: 1;
                    display: flex;
                    font-size: 14px;

                    input {
                        flex-grow: 1;
                    }
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
        background: #ddd;
        align-items: center;
        height: 40px;
        padding: 0 12px;

        .bottom-groups {
            .openicon {
            }

            .settingicon {
            }

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
