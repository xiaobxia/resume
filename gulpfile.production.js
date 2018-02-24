const gulp = require('gulp');
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cleanCSS = require('gulp-clean-css');
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');
const del = require('del');
const pug = require('gulp-pug');

const config = require('./config');
const path = config.base.path;
const assetsSubDirectory = config.prod.assetsSubDirectory;
const assetsPublicPath = config.prod.assetsPublicPath;
const ifCdn = config.prod.ifCdn;

function createAssetsSubPath(subPath) {
  return ifCdn ? path.dist : path.dist + assetsSubDirectory + subPath;
}

function createReplacePath(subPath) {
  return ifCdn ? assetsPublicPath : assetsSubDirectory + subPath;
}

const libDestPath = createAssetsSubPath('/lib');
const assetDestPath = createAssetsSubPath('/asset');
const cssDestPath = createAssetsSubPath('/css');
const jsDestPath = createAssetsSubPath('/js');

gulp.task('clean', function () {
  return del(path.dist);
});

gulp.task('other', function () {
  return gulp.src(path.other)
    .pipe(gulp.dest(path.dist));
});

gulp.task('lib', function () {
  return gulp.src(path.lib)
    .pipe(rev())
    .pipe(gulp.dest(libDestPath))
    .pipe(rev.manifest())
    //json
    .pipe(gulp.dest('rev/lib'));
});

gulp.task('asset', function () {
  return gulp.src(path.asset)
    .pipe(rev())
    .pipe(gulp.dest(assetDestPath))
    .pipe(rev.manifest())
    //json
    .pipe(gulp.dest('rev/asset'));
});


gulp.task('pug', function buildHTML() {
  return gulp.src(path.pug)
    .pipe(pug({
      doctype: 'html'
    }))
    .pipe(gulp.dest(path.dist));
});

gulp.task('scss', function () {
  return gulp.src(path.scss)
    .pipe(sass())
    .pipe(postcss([autoprefixer(config.base.autoprefixer)]))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(rev())
    .pipe(gulp.dest(cssDestPath))
    .pipe(rev.manifest())
    //json
    .pipe(gulp.dest('rev/css'));
});

gulp.task('js', function () {
  return gulp.src(path.js)
    .pipe(babel())
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest(jsDestPath))
    .pipe(rev.manifest())
    //json
    .pipe(gulp.dest('rev/js'));
});

gulp.task('rev', function () {
  //json文件和接收注入的pug文件
  return gulp.src(['rev/**/*.json', path.dist + '/*.html'])
    .pipe(revCollector({
      replaceReved: true,
      dirReplacements: {
        //替换
        '/_css/': createReplacePath('/css/'),
        '/_js/': createReplacePath('/js/'),
        '/_lib/': createReplacePath('/lib/'),
        '/_asset/': createReplacePath('/asset/')
      }
    }))
    .pipe(gulp.dest(path.dist));
});


gulp.task('revCss', function () {
  return gulp.src(['rev/**/*.json', cssDestPath + '/*.css'])
    .pipe(revCollector({
      replaceReved: true,
      dirReplacements: {
        '/_asset/': createReplacePath('/asset/')
      }
    }))
    .pipe(gulp.dest(cssDestPath));
});


gulp.task('build', gulp.parallel('other', 'lib', 'asset', 'pug', 'scss', 'js'));

gulp.task('default', gulp.series('clean', 'build', 'rev', 'revCss'));
