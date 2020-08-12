const fs = require("fs");
const path = require("path");
const generate = require("./generate");

function pdf2html(obj) {
    const pdfPath = obj;
    let data = fs.readFileSync(pdfPath);
    data = new Buffer(data).toString("base64");
    const params = {
        title: "测试文档",
        artName: "html3.art",
        content: data
    };
    generate(params);
}

module.exports = pdf2html;
