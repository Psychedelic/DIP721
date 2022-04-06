import fs from "fs";

import FileHound from "filehound";

const args = process.argv;
if (args.length < 3) throw new Error("Missing path arguments");

const files = FileHound.create().paths(args[2]).discard("node_modules").ext("js").find();

files
  .then(filePaths =>
    filePaths.forEach(filepath => {
      fs.readFile(filepath, "utf8", (err, data) => {
        if (!data.match(/(import.*['"]\..+)(['"])/g)) {
          return;
        }
        const newData = data.replace(/(import.*['"]\..+)(['"])/g, "$1.js$2");
        if (err) throw err;
        fs.writeFile(filepath, newData, err => {
          if (err) {
            throw err;
          }
        });
      });
    })
  )
  .catch(err => {
    throw err;
  });
