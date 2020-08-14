module.exports = {
    lintOnSave: false,
    pluginOptions: {
        electronBuilder: {
            preload: "src/preload.js"
        }
    },
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                publish: ["github"]
            }
        }
    }
};
