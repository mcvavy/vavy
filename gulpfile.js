const {watch, series, src, dest} = require('gulp');
const stylus = require('gulp-stylus');


// gulp plugins and utils
const autoprefixer = require("gulp-autoprefixer");
const livereload = require('gulp-livereload');
const sourcemaps = require('gulp-sourcemaps');
const zip = require('gulp-zip');

// postcss plugins
//const cssnano = require('cssnano');

const nodemonServerInit = function () {
    livereload.listen();
};

function build(){
    return nodemonServerInit();
}

function transpileStylus() {
    return src('assets/src/vavy.styl')
    .pipe(sourcemaps.init())
    .pipe(stylus({
        linenos: true,
        compress: true             
    }))
    .pipe(autoprefixer({
        browsers: ['last 2 versions']
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('assets/built/'))
    .pipe(livereload());
}

function zipUp(cb){
    const targetDir = 'dist/';
    const themeName = require('./package.json').name;
    const filename = themeName + '.zip';

    return src([
        '**',
        '!node_modules', '!node_modules/**',
        '!dist', '!dist/**'
    ])
    .pipe(zip(filename))
    .pipe(dest(targetDir));

    cb();
}

exports.default = function() {
    watch('assets/src/**', series(
        transpileStylus,
        zipUp
        ));
}
