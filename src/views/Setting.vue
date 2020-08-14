<template lang="pug">
    .setting(v-if="show")
        .closeicon(@click="onCloseClick") 关闭(close)
        .savebtn(@click="onSaveClick") 保存(save)
        .setting-item
            span resource url
            input(v-model="resourceUrl", :placeholder="resourceUrl_default")
        .setting-item
            span template path
            input(v-model="templatePath", :placeholder="templatePath_default")
            img.openicon(src="@/assets/icon_file.png", @click="onTemplateOpenClick")
        .setting-item
            span output path
            input(v-model="outputPath", placeholder="当前文件目录下(current file directory)")
            img.openicon(src="@/assets/icon_file.png", @click="onOutputOpenClick")
        //- .setting-item
        //-     span work mode
        //-     .radio(@click="mode='canvas'")
        //-         .radioicon(:class="{radiochecked:mode==='canvas'}")
        //-         span canvas
        //-     .radio(@click="mode='image'")
        //-         .radioicon(:class="{radiochecked:mode==='image'}")
        //-         span image
        //- div(v-if="mode==='image'")
        //-     .setting-item.sub
        //-         span viewport scale
        //-         input(v-model="viewportScale", :placeholder="viewportScale_default")
        //-     .setting-item.sub
        //-         span image quality (0~1)
        //-         input(v-model="imageQuality", :placeholder="imageQuality_default")

</template>

<script>
const { remote } = window.require("electron");
const { dialog } = window.require("electron").remote;
const { ipcRenderer } = window.require("electron");

export default {
    data() {
        return {
            resourceUrl: "",
            resourceUrl_default: "",
            templatePath: "",
            templatePath_default: "",
            mode: "",
            outputPath: ""
        };
    },
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    created() {
        const setting = remote.getGlobal("setting");
        this.setting = Object.assign(this.$data, setting);
    },
    methods: {
        onSaveClick() {
            ipcRenderer.send("onSaveSetting", this.$data);
            this.onCloseClick();
        },
        onCloseClick() {
            this.$emit("update:show", false);
        },
        onOutputOpenClick() {
            dialog
                .showOpenDialog({
                    properties: ["openDirectory", "createDirectory"]
                })
                .then(result => {
                    const filePaths = result.filePaths || [];
                    if (filePaths.length > 0) {
                        this.outputPath = filePaths[0];
                    }
                });
        },
        onTemplateOpenClick() {
            dialog
                .showOpenDialog({
                    properties: ["openDirectory"]
                })
                .then(result => {
                    const filePaths = result.filePaths || [];
                    if (filePaths.length > 0) {
                        this.templatePath = filePaths[0];
                    }
                });
        }
    }
};
</script>

<style lang="stylus" scoped>
@import '~@/styles/mixin.styl';

.setting {
    position: fixed;
    width: 70%;
    height: 70%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #eee;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    padding: 30px 20px;
    text-align: left;
    font-size: 14px;

    .closeicon {
        position: absolute;
        right: 10px;
        top: 10px;
    }

    .setting-item {
        margin-top: 20px;
        display: flex;

        input {
            margin-left: 10px;
            flex-grow: 1;
        }

        .radio {
            margin-left: 20px;
            display: flex;
            align-items: center;

            .radioicon {
                icon('~@/assets/radio_u.png', 15px, 15px);
            }

            .radiochecked {
                icon('~@/assets/radio_c.png', 15px, 15px);
            }

            span {
                margin-left: 5px;
            }
        }

        .openicon {
            width: 20px;
            height: 20px;
            margin-left: 10px;
        }
    }

    .sub {
        margin-left: 90px;
    }

    .savebtn {
        position: absolute;
        right: 100px;
        top: 10px;
    }
}
</style>