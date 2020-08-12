<template lang="pug">
    .setting(v-if="show")
        .closeicon(@click="onCloseClick") 关闭
        .savebtn(@click="onSaveClick") 保存
        .setting-item
            span 资源文件地址
            input(v-model="resourceUrl")
        .setting-item
            span 模板文件地址
            input(v-model="artUrl")
</template>

<script>
export default {
    data() {
        return {
            resourceUrl: "",
            artUrl: ""
        };
    },
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    created() {
        const setting = window.remote.getGlobal("setting");
        this.resourceUrl = setting.resourceUrl;
        this.artUrl = setting.artUrl;
    },
    methods: {
        onSaveClick() {
            window.ipcRenderer.send("onSaveSetting", this.$data);
            this.onCloseClick();
        },
        onCloseClick() {
            this.$emit("update:show", false);
        }
    }
};
</script>

<style lang="stylus" scoped>
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
    }

    .savebtn {
        position: absolute;
        right: 60px;
        top: 10px;
    }
}
</style>