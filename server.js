const https = require('https');
const fs = require('fs');
const path = require("path")
const express = require("express")
const webpack = require("webpack")
const webpackMiddleware = require("webpack-dev-middleware")
const webpackConfig = require("./webpack.config")

const app = express()
const publicPath = path.join(__dirname, "public")
const port = process.env.PORT || 9000
const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

app.use(express.static(publicPath))
app.use(webpackMiddleware(webpack(webpackConfig)))

https.createServer(options, app).listen(port, () => {
  console.log(`Listening on port ${port}`)
});
