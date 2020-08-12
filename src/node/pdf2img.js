/* Copyright 2017 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Canvas = require("canvas");
var assert = require("assert").strict;
var fs = require("fs");
var generate = require("./generate");

// HACK few hacks to let PDF.js be loaded not as a module in global space.
require("./domstubs.js").setStubs(global);

function NodeCanvasFactory() {}
NodeCanvasFactory.prototype = {
    create: function NodeCanvasFactory_create(width, height) {
        assert(width > 0 && height > 0, "Invalid canvas size");
        var canvas = Canvas.createCanvas(width, height);
        var context = canvas.getContext("2d");
        return {
            canvas: canvas,
            context: context
        };
    },

    reset: function NodeCanvasFactory_reset(canvasAndContext, width, height) {
        assert(canvasAndContext.canvas, "Canvas is not specified");
        assert(width > 0 && height > 0, "Invalid canvas size");
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
    },

    destroy: function NodeCanvasFactory_destroy(canvasAndContext) {
        assert(canvasAndContext.canvas, "Canvas is not specified");

        // Zeroing the width and height cause Firefox to release graphics
        // resources immediately, which can greatly reduce memory consumption.
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
        canvasAndContext.canvas = null;
        canvasAndContext.context = null;
    }
};

var pdfjsLib = require("./pdfjs-dist/build/pdf.js");
pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdf.worker.js";

// Some PDFs need external cmaps.
var CMAP_URL = "./pdfjs-dist/cmaps/";
var CMAP_PACKED = true;

function pdf2img(pdfPath) {
    // var pdfPath = "11.pdf";
    var data = new Uint8Array(fs.readFileSync(pdfPath));
    // Load the PDF file.
    var loadingTask = pdfjsLib.getDocument({
        data: data,
        cMapUrl: CMAP_URL,
        cMapPacked: CMAP_PACKED
    });
    loadingTask.promise
        .then(function(pdfDocument) {
            var numPages = pdfDocument.numPages;
            console.log("# Document Loaded");
            console.log("Number of Pages: " + numPages);
            console.log();
            const content = [];
            var lastPromise = Promise.resolve(); // will be used to chain promises
            var loadPage = function(pageNum) {
                return pdfDocument.getPage(pageNum).then(function(page) {
                    // Render the page on a Node canvas with 100% scale.
                    var viewport = page.getViewport({ scale: 1.5 });
                    var canvasFactory = new NodeCanvasFactory();
                    var canvasAndContext = canvasFactory.create(
                        viewport.width,
                        viewport.height
                    );
                    var renderContext = {
                        canvasContext: canvasAndContext.context,
                        viewport: viewport,
                        canvasFactory: canvasFactory
                    };

                    var renderTask = page.render(renderContext);
                    return renderTask.promise.then(function() {
                        // Convert the canvas to an image buffer.
                        // var image = canvasAndContext.canvas.toBuffer();
                        const image = canvasAndContext.canvas.toDataURL(
                            "image/jpeg", 0.4
                        );
                        content.push(image);
                        if (pageNum == numPages) {
                            const params = {
                                title: "测试文档",
                                artName: "html2.art",
                                content: content
                            };
                            generate(params);
                        }
                    });
                });
            };
            for (let i = 1; i <= numPages; i++) {
                lastPromise = lastPromise.then(loadPage.bind(null, i));
            }

            return lastPromise;
        })
        .then(
            function() {
                console.log("# End of Document");
            },
            function(err) {
                console.error("Error: " + err);
            }
        );
}

// Loading file from file system into typed array.
// var pdfPath =
//     process.argv[2] || "11.pdf";

module.exports = pdf2img;
