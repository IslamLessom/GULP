"use strict"

const { src, dest } = require("gulp")  //src считывает , dest записывает
const gulp = require("gulp")
const autoprefixer = require("gulp-autoprefixer")
const cssbeautify = require("gulp-cssbeautify");
const removeComments = require('gulp-strip-css-comments');
const rename = require("gulp-rename");
const rigger = require("gulp-rigger")
const sass = require("gulp-sass")(require('sass'));
const cssnano = require("gulp-cssnano");
const uglify = require("gulp-uglify");
const plumber = require("gulp-plumber"); //функция которая предотврашает ошибки
const panini = require("panini");
const imagemin = require("gulp-imagemin");
const del = require("del");
const notify = require("gulp-notify")
const imagewebp = require("gulp-webp")
const browserSync = require("browser-sync").create();


//Path

const srcPath = "src/"
/*
 dist/расшифровывается как дистрибутив и представляет собой минимизированную/
 объединенную версию, фактически используемую на производственных сайтах.
*/
const distPath = "dist/"

const path = {
    build: {
        html: distPath,
        css: distPath + "assets/css",
        js: distPath + "assets/js/",
        images: distPath + "assets/images/",
        fonts: distPath + "assets/fonts/"
    },
    //src прописываются пути
    src: {
        html: srcPath + "*.html",
        css: srcPath + "assets/scss/*.scss",
        js: srcPath + "assets/js/*.js",
        images: srcPath + "assets/img/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    //watch что бы gulp знал за какими файлами следить и обновлял их следит за ним в реальном времени
    watch: {
        html: srcPath + "**/*.html",
        js: srcPath + "assets/js/**/*.js",
        css: srcPath + "assets/scss/**/*.scss",
        images: srcPath + "assets/img/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    clean: "./" + distPath
    
}

function html() {
    return src(path.src.html, { base: srcPath }) //base используется что у нас не поломался проект
        .pipe(plumber())//предотврашает ошибки
        .pipe(dest(path.build.html)) //pipe - выполняет какую то задачу - перетаскивает из исходников в дистанционную папку dist
}

function css() {
    return src(path.src.css, { base: srcPath + 'assets/scss' }) //base используется что у нас не поломался проек
        .pipe(plumber()) //предотврашает ошибки
        .pipe(sass()) //компилирует scss файлы в css
        .pipe(autoprefixer()) //для управления браузерными префиксами в проекте. Задача у него - не просто устанавливать префиксы для тех CSS3-свойств, которые нуждаюся в этом на данный момент
        .pipe(cssbeautify()) // CSS Beautify автоматически форматирует ваш стиль, чтобы он был последовательным и легко читаемым.
        .pipe(dest(path.build.css)) //pipe - выполняет какую то задачу - перетаскивает из исходников в дистанционную папку dist
        .pipe(cssnano(
            {
                zindex: false,
                discardComments: {
                    removeAll: true
                }
            }
        ))//уменьшает код
        .pipe(removeComments())//убирает коментарии
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))//переименовывает файл , что бы легче было отличать моди-ный файл от оригинала
        .pipe(dest(path.build.css))
}

function js() {
    return src(path.src.js, { base: srcPath + 'assets/js/' })
        .pipe(plumber())
        .pipe(rigger()) //собирает все js файлы в воедино
        .pipe(dest(path.build.js))
        .pipe(uglify()) //модефицирует js файлы
        .pipe(rename({
            suffix: ".min",
            extname: '.js'
        }))
        .pipe(dest(path.build.js))
}

function images() {
    return src(path.src.images, { base: srcPath + "assets/images/" })
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest(path.build.images))
}

function fonts() {
    return src(path.src.fonts, { base: srcPath + "assets/fonts/" })
        .pipe(dest(path.build.fonts))
        .pipe(browserSync.reload({ stream: true }));
}

//удаляет те файлы которые были удалены в исходнике
function clean() {
    return del(path.clean)
}

//слудит за изменениями
function watchFiles() {
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.css], css)
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.images], images)
    gulp.watch([path.watch.fonts], fonts)
}

//build удаляет все файлы , что бы просмотреть все изменения, тоесть может какие то файлы были удалены , после чего загружает актуальную версию
const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts))
const watch = gulp.parallel(build, watchFiles)

exports.html = html
exports.css = css
exports.js = js
exports.images = images
exports.fonts = fonts
exports.clean = clean
exports.build = build
exports.watch = watch