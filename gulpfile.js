const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require("gulp-babel");
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const del = require('del');
const url = require('url');
const pug = require('gulp-pug');
const opn = require('opn');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const browserSync = require('browser-sync');
const proxy = require('proxy-middleware');
const debug = require('gulp-debug');

const config = require('./config');
const path = config.base.path;
const server = config.server;

function createAssetsSubPath(subPath) {
  return path.dist + subPath;
}

gulp.task('clean', function () {
  return del(path.dist);
});

gulp.task('lib', function () {
  return gulp.src(path.lib)
    .pipe(gulp.dest(createAssetsSubPath('/_lib')));
});

gulp.task('asset', function () {
  return gulp.src(path.asset)
    .pipe(gulp.dest(createAssetsSubPath('/_asset')));
});

gulp.task('pug', function () {
  return gulp.src(path.pug)
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(debug({title: 'unicorn:'}))
    .pipe(pug({
      doctype: 'html'
    }).on('error', function (error) {
      console.log(error)
    })).pipe(gulp.dest(path.dist));
});

gulp.task('scss', function () {
  return gulp.src(path.scss)
    .pipe(debug({title: 'unicorn:'}))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(config.base.autoprefixer)]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(createAssetsSubPath('/_css')))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('js', function () {
  return gulp.src(path.js)
    .pipe(debug({title: 'unicorn:'}))
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(createAssetsSubPath('/_js')));
});

gulp.task('open', function () {
  return opn(`http://localhost:${config.server.port}`);
});

function createProxy(proxyConfig) {
  let list = [];
  for(let key in proxyConfig) {
    let proxyOptions = url.parse(proxyConfig[key].target);
    proxyOptions.route = key;
    list.push(proxy(proxyOptions));
  }
  return list;
}

gulp.task('server', function (cb) {
  browserSync({
    server: {
      baseDir: path.dist,
      middleware: createProxy(server.proxyTable)
    },
    port: server.port,
    notify: false,
    ghostMode: false,
    open: true
  }, cb);
});

gulp.task('build', gulp.parallel('lib', 'asset', 'pug', 'scss', 'js'));

gulp.task('watch', function () {
  function serverReload(cb) {
    browserSync.reload();
    cb();
  }
  gulp.watch(path.assetWatch, gulp.series('asset', serverReload));
  gulp.watch(path.libWatch, gulp.series('lib', serverReload));
  gulp.watch(path.pugWatch, gulp.series('pug', serverReload));
  gulp.watch('./README.md', gulp.series('pug', serverReload));
  gulp.watch(path.scssWatch, gulp.series('scss'));
  gulp.watch(path.jsWatch, gulp.series('js', serverReload));
});

gulp.task('default', gulp.series('clean', 'build', 'server', 'open', 'watch'));
