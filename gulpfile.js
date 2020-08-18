const {series, watch, src, dest, parallel} = require('gulp');
const pump = require('pump');
const stylus = require('gulp-stylus');

// gulp plugins and utils
const livereload = require('gulp-livereload');
const postcss = require('gulp-postcss');
const zip = require('gulp-zip');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const beeper = require('beeper');

// postcss plugins
const autoprefixer = require('autoprefixer');
const colorFunction = require('postcss-color-mod-function');
const cssnano = require('cssnano');
const easyimport = require('postcss-easy-import');

function serve(done) {
    livereload.listen();
    done();
}

const handleError = (done) => {
    return function (err) {
        if (err) {
            beeper();
        }
        return done(err);
    };
};

function hbs(done) {
    pump([
        src(['*.hbs', 'partials/**/*.hbs']),
        livereload()
    ], handleError(done));
}

function transpileStylus(done) {
    pump([
        src('assets/src/vavy.styl'),
        stylus(),
        dest('assets/src/transpiledcss/')
    ], handleError(done));

    // return src('assets/src/vavy.styl')
    // .pipe(stylus())
    // .pipe(dest('assets/src/transpiledcss/'))
}

function concatCSSandMove(done) {
    pump([
        src([
            'assets/src/global/global.css',
            'assets/src/transpiledcss/vavy.css'
        ]),
        concat('vavy.css'),
        dest('assets/css/')
    ], handleError(done));
}

function css(done) {
    pump([
        src('assets/css/*.css', {sourcemaps: true}),
        postcss([
            easyimport,
            colorFunction(),
            autoprefixer(),
            cssnano()
        ]),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function js(done) {
    pump([
        src([
            // pull in lib files first so our own code can depend on it
            'assets/js/lib/*.js',
            'assets/js/*.js'
        ], {sourcemaps: true}),
        concat('vavy.js'),
        uglify(),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function zipper(done) {
    const filename = require('./package.json').name + '.zip';

    pump([
        src([
            '**',
            '!node_modules', '!node_modules/**',
            '!dist', '!dist/**',
            '!yarn-error.log'
        ]),
        zip(filename),
        dest('dist/')
    ], handleError(done));
}

const stylusWatcher = () => watch('assets/src/vavy.styl', transpileStylus);
const cssConcat = () => watch('assets/src/transpiledcss/**', concatCSSandMove);
const cssWatcher = () => watch('assets/css/**', css);
const hbsWatcher = () => watch(['*.hbs', 'partials/**/*.hbs'], hbs);
const zips = () => watch(['assets/built/**'], zipper);
const watcher = parallel(stylusWatcher, cssConcat, cssWatcher, hbsWatcher,zips);
const build = series(transpileStylus, concatCSSandMove, css, js, zipper);

exports.build = build;
exports.zip = series(build, zipper);
exports.default = series(build, serve, watcher);