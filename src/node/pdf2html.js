const fs = require("fs");
const path = require("path");
const generate = require("./generate");

function pdf2html(obj) {
    return new Promise((resolve, reject) => {
        let data = fs.readFileSync(obj.path);
        data = Buffer.from(data).toString("base64");
        const params = {
            title: obj.title,
            name: obj.name,
            path: obj.path,
            artName: "template-canvas.art",
            content: data
        };
        console.log("pdf2html", obj.path);
        generate(params)
            .then(res => {
                resolve();
            })
            .catch(error => {
                reject(error);
            });
    });
}

module.exports = pdf2html;
