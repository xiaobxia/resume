/**
 * Created by xiaobxia on 2017/9/17.
 */
const path = require('path');

const root = path.resolve(__dirname, '../');
function resolveRoot(dir) {
  return path.resolve(root, dir);
}

module.exports = {
  root: root,
  base: {
    path: {
      dist: './dist',
      scss: './src/scss/*.scss',
      scssWatch: './src/scss',
      js: './src/js/*.js',
      jsWatch: './src/js',
      lib: './src/lib/*',
      libWatch: './src/lib/*',
      asset: './src/asset/*',
      assetWatch: './src/asset/*',
      pug: './src/pug/*.pug',
      pugWatch: './src/pug',
      other: './src/other/*'
    },
    autoprefixer: {
      "browsers": [
        "> 1%",
        "last 2 versions"
      ]
    }
  },
  server: {
    port: 4000,
    baseDir: resolveRoot('dist'),
    proxyTable: {
      "/user": {
        "target": "http://localhost:8080/",
        logs: true
      }
    }
  },
  prod: {
    assetsSubDirectory: '/static',
    assetsPublicPath: 'http://p4n8qaybt.bkt.clouddn.com/',
    ifCdn: true
  }
};
