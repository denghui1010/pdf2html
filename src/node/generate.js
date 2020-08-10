//此处使用模板引擎
const fs = require("fs");
const template = require("art-template");
const path = require("path");

function generate(params) {
    const title = params.title || "output";
    const artName = params.artName || "html.art";
    const html = template(path.resolve(__dirname, artName), {
        title,
        content: params.content
    });
    fs.writeFile(title + ".html", html, function(error) {
        if (error) {
            console.error("Error: " + error);
        } else {
            console.log(
                "Finished converting first page of PDF file to a PNG image."
            );
        }
    });
}
module.exports = generate;