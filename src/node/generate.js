const fs = require("fs");
const path = require("path");
const { net } = require("electron");
const template = require("art-template/lib/index");

let remoteArt = "";

function getArt(url) {
    return new Promise((resolve, reject) => {
        console.log("get art", url);
        const request = net.request(url);
        request
            .on("response", response => {
                let c = "";
                response.on("data", chunk => {
                    c += chunk;
                });
                response.on("end", () => {
                    resolve(c.toString());
                });
            })
            .on("error", error => {
                reject(error);
            });
        request.end();
    });
}

function generate(params) {
    return new Promise(async (resolve, reject) => {
        const title = params.title || params.name;
        const artName = params.artName;
        const filePath = params.path;
        const setting = global.getSetting();
        const templatePath = setting.templatePath;
        let html = "";
        const inputObj = {
            title,
            content: params.content,
            setting: setting
        };
        try {
            if (templatePath) {
                if (templatePath.startsWith("http")) {
                    // remote template
                    if (!remoteArt) {
                        try {
                            console.log("generate use remote template");
                            const res = await getArt(
                                templatePath + "/" + artName
                            );
                            remoteArt = res; // cache art template
                        } catch (e) {
                            reject(e);
                            return;
                        }
                    } else {
                        console.log("generate use cache remote template");
                    }
                    html = template.render(remoteArt, inputObj, {});
                } else {
                    // local template
                    console.log("generate use local template");
                    html = template(
                        path.resolve(templatePath, artName),
                        inputObj
                    );
                }
            } else {
                // default template
                console.log("generate use default template");
                html = template(
                    path.resolve(__static, "template", artName),
                    inputObj
                );
            }
        } catch (err) {
            console.error(err);
            reject(err);
            return;
        }
        let outPath = setting.outputPath;
        // if user dont set outPath, use file path instead
        if (!outPath) {
            outPath = path.dirname(filePath);
        }
        const out = path.resolve(outPath, title + ".html");
        console.log("generate", out);
        fs.writeFile(out, html, function(error) {
            if (error) {
                console.error("Error: " + error);
                reject(error);
            } else {
                resolve();
            }
        });
    });
}
module.exports = generate;
