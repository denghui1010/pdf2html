<template lang="pug">
  .home
    .file-area(v-if="fileList&&fileList.length>0")
        .filelist
            .file(v-for="(file, index) in fileList", :key="index") {{file.name}}
        .opt
            .clear(@click="onClearClick") 清空
            .selectAll(@click="onSelectAllClick") 全选
            .remove(@click="onRemoveClick") 移除
    .drag-area(v-else, @drop="onDrop", @dragover="dragover") 拖拽文件或文件夹到此处
    .transferbtn(@click="onTransferClick") 转换

</template>

<script>
export default {
    data() {
        return {
            fileList: [
                // { name: "123" }, { name: "234" }
            ]
        };
    },
    methods: {
        onDrop(e) {
            e.preventDefault();
            const files = [];
            [].forEach.call(
                e.dataTransfer.files,
                file => {
                    const f = {};
                    f.name = file.name;
                    f.path = file.path;
                    this.fileList.push(f);
                },
                false
            );
            console.log(this.fileList);
        },
        dragover(e) {
            e.preventDefault();
        },
        onClearClick() {},
        onSelectAllClick() {},
        onRemoveClick() {},
        onTransferClick() {
            window.ipcRenderer.send("onTransfer", this.fileList);
        }
    }
};
</script>

<style lang="stylus" scoped>
.home {
    .file-area {
        .filelist {
            width: 200px;
            height: 80vh;
            overflow: auto;
            border: 1px solid #ddd;
        }
    }

    .drag-area {
        display: inline-block;
        width: 100px;
        height: 100px;
        background: #ddd;
    }
}
</style>
