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

## 关于资源文件
1. 当前html中使用的js/css资源放置在个人服务器下, 不保证稳定性, 建议将项目中的```/public/pdfjs-dist```文件夹放置到自己的服务器上
2. 当前的生成模板也放置在个人服务器下, 不保证稳定性, 建议将项目中的```/public/template```文件夹放置到自己的服务器上或电脑本地
3. 完成后可在软件的设置中设置resoure url和template path
   - resource url只支持url
   - template path支持本地文件夹和远程url
4. 资源和模板你都可以进行修改, 自定义最后html的显示样式

![screenshot](./screenshot/setting.png)

## 下载


## 开发
```
npm install
npm run electron:serve
```

## 打包
更多请阅读[electron-builder doc](https://www.electron.build/cli)
- mac & linux & window
  - ```npm run electron:build -- -mwl```
- mac
  - ```npm run electron:build -- --mac```
- linux
  - ```npm run electron:build -- --linux deb tar.xz```
- window
  - ```npm run electron:build -- --win nsis```
