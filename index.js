/**
 * Created by xiaobxia on 2017/12/20.
 */
const markdownpdf = require("markdown-pdf");
const fs = require("fs");

fs.createReadStream("src/text.md")
    .pipe(markdownpdf({
        remarkable: {
            html: true,
        }
    }))
    .pipe(fs.createWriteStream("dist/text.pdf"));