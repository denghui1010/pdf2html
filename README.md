# pdf2html
本软件可以将pdf文件转换为单一的html文件

![screenshot](./screenshot/home.png)

## 依赖
 - [electron](https://github.com/electron/electron)
 - [vue-cli-plugin-electron-builder](https://github.com/nklayman/vue-cli-plugin-electron-builder)
 - [vue](https://github.com/vuejs/vue)
 - [pdfjs](https://github.com/mozilla/pdf.js)
 - [art-template](https://github.com/aui/art-template)

## 特点
- 单一html文件输出
- 资源路径可配置
- 生成模板可配置
- 全平台支持

## 下载


## 开发
npm run electron:serve

## 打包
更多请阅读[electron-builder doc](https://www.electron.build/cli)
- mac & linux & window
  - npm run electron:build -- -mwl
- mac
  - npm run electron:build -- --mac
- linux
  - npm run electron:build -- --linux deb tar.xz
- window
  - npm run electron:build -- --win nsis
