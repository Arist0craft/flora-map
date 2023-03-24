const path = require('path');

/** @type {import('webpack').Configuration} */
module.exports = {
  "entry": path.resolve(__dirname, "src"),
  "output": {
    "filename": "map.js",
    "path": path.resolve(__dirname, "dist/js"),
  },
  "devServer": {
    "port": 5000,
    "allowedHosts": "all",
    "static": path.resolve(__dirname, "dist")
  }
};