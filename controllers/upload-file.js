require("dotenv").config();
const express = require("express");
let router = express.Router();
let path = require("path")
let fs = require("fs")
const multer = require("multer");
const upload = multer({
    dest: __dirname + "/../uploads"
  });
router.post("/upload", upload.single("file"), async (req, res) => {
    const tempPath = req.file.path;
    const ext = path.extname(req.file.originalname)

    const targetPath = ext === ".html" ? path.join(__dirname, "/../templates/" + req.file.originalname) : path.join(__dirname, "/../uploads/" + req.file.originalname);
       fs.rename(tempPath, targetPath, err => {
        if (err) res.status(500).send(err)
        const url = ext.split(".")[1] === "html" ? `templates/${req.file.originalname}`:`uploads/${req.file.originalname}`
        res
          .status(200)
          .contentType("text/plain")
          .end(`${process.env.APP_URL}/${url}`);
      });
  }
);

module.exports = router;