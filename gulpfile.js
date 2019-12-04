const { src, dest, parallel, series, watch } = require('gulp');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
// const replace = require('gulp-replace');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const inlineCss = require('gulp-inline-css');
const browsersync = require('browser-sync').create();

const files = {
    scssPath: 'src/*.scss',
    jsPath: 'src/*.js',
    htmlPath: 'src/*.html',
    inlineStylingPath: 'dist/*.html',
    imagePath: 'src/assets/*.*'
};

function css() {
    return src(files.scssPath)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', gutil.log))
        .pipe(postcss([autoprefixer(), cssnano()]).on('error', gutil.log))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/css/'))
        .pipe(browsersync.stream());
}

function js() {
    return src(files.jsPath)
        .pipe(babel({ presets: ['@babel/env'] }).on('error', gutil.log))
        .pipe(uglify())
        .pipe(concat('script.js'))
        .pipe(dest('dist/js'))
        .pipe(browsersync.stream());
}

function jsLinting() {
    return src(files.jsPath)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
}

function html() {
    return src(files.htmlPath)
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(dest('dist/'))
        .pipe(browsersync.stream());
}

function makeStylesInlineHTML() {
    return src(files.inlineStylingPath)
        .pipe(inlineCss())
        .pipe(dest('dist/'))
        .pipe(browsersync.stream());
}

function images() {
    return src(files.imagePath)
        .pipe(imagemin())
        .pipe(dest('dist/assets'))
        .pipe(browsersync.stream());
}

/* task for cache bursting */

// function cacheBursting() {
//     let versionNumber = new Date().getTime();
//     return src(files.htmlPath)
//         .pipe(replace(/vs=\d+/g, `vs=${versionNumber}`))
//         .pipe(dest('dist/'));
// }

function browserSync() {
    browsersync.init({
        server: {
            baseDir: './dist'
        }
    });
}

function watchFiles() {
    browserSync();
    watch(
        [
            files.scssPath,
            files.jsPath,
            files.htmlPath
        ],
        series(jsLinting, parallel(css, js, images, html))
    ).on('change', function() { browsersync.reload(); });
}

exports.default = series(watchFiles);
exports.css = css;
exports.inlineStyle = makeStylesInlineHTML;
exports.html = html;
exports.javascript = parallel(jsLinting, js);
exports.images = images;
exports.forProd = parallel(css, html, this.javascript, images);
exports.forEmail = parallel(css, html, this.javascript, images, makeStylesInlineHTML);
