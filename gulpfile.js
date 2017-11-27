var gulp = require('gulp'),
    strip = require('gulp-strip-comments'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    minifyCSS = require('gulp-minify-css'),
    image = require('gulp-image'),
    sass = require('gulp-sass');

var gulpPaths = {
    "bc": "./bower_components/",
    "js": "./src/js/",
    "img":"./src/img/",
    "sass": "./src/scss/",
    "dist": "./dist/",
    "views": "./src/views/"
};

function app() {
    return gulp.src([
        gulpPaths.js + '**/*.js'
    ])
    .pipe(strip())
    .pipe(concat('app.js'))
    .pipe(gulp.dest(gulpPaths.dist + 'js'));
}

function vendor() {
    return gulp.src([
        gulpPaths.bc + 'jquery/dist/jquery.min.js',
        gulpPaths.bc + 'popper.js/dist/umd/popper.min.js',
        gulpPaths.bc + 'moment/min/moment.min.js',
        gulpPaths.bc + 'bootstrap/dist/js/bootstrap.min.js',
        gulpPaths.bc + 'angular/angular.min.js',
        gulpPaths.bc + 'angular-ui-router/release/angular-ui-router.min.js',
    ])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(gulpPaths.dist + 'js'));
}

function msass() {
    return gulp.src([
        gulpPaths.sass + 'main.scss'
    ])
    .pipe(sass().on('error', sass.logError))
    .pipe(plumber())
    .pipe(rename('app.css'))
    .pipe(gulp.dest(gulpPaths.dist+'css'));
}

function style() {
    return gulp.src([
        gulpPaths.bc + 'bootstrap/dist/css/bootstrap.min.css',
    ])
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest(gulpPaths.dist+'css'))
}

function views() {
    return gulp.src([
        gulpPaths.views + '*.html'
    ])
    .pipe(strip())
    .pipe(gulp.dest(gulpPaths.dist+'views'));
}
function img(){
    return gulp.src([
        gulpPaths.img + '*'
    ])
    .pipe(image())
    .pipe(gulp.dest(gulpPaths.dist+'images'));
}


gulp.task('app', app);
gulp.task('vendor', vendor);
gulp.task('sass', msass);
gulp.task('style', style);
gulp.task('views', views);
gulp.task('images', img);

gulp.task('default', [ 'style', 'sass', 'views', 'vendor', 'app', 'images','watch', 'serve']);

gulp.task('watch', function () {
    gulp.watch(gulpPaths.sass + '*.scss', ['sass']);
    gulp.watch(gulpPaths.js + '**/*.js', ['app']);
    gulp.watch(gulpPaths.views + '*.html', ['views']);
    gulp.watch(gulpPaths.img + '*', ['images']);
})

gulp.task('serve', function () {
    var http = require('http');
    var statics = require('node-static');
    var fs = require('fs');

    var st = new statics.Server('./', {cache: -1});

    console.log('Development server started a http://localhost:3333');

    http.createServer(function (req, res) {
        st.serve(req, res);
    }).listen(3333);
});