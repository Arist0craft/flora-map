const path = require('path');

/** @type {import('webpack').Configuration} */
module.exports = {
  "entry": path.resolve(__dirname, "src"),
  "output": {
    "filename": "map.js",
    "path": path.resolve(__dirname, "dist/js"),
  },
};