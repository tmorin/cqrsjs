/*jshint strict:false */
require('es6-shim');

var gulp = require('gulp');
var runSequence = require('run-sequence');
var gp = require('auto-plug')('gulp');

gulp.task('jshint', function () {
    return gulp.src(['lib/**/*.js', 'test/**/*.js', 'gulpfile.js'])
        .pipe(gp.jshint())
        .pipe(gp.jshint.reporter('jshint-stylish'))
        .pipe(gp.jshint.reporter('fail'));
});

gulp.task('min', function () {
    return gulp.src(['lib/**/*.js'])
        .pipe(gp.sourcemaps.init())
        .pipe(gp.uglify({
            preserveComments: 'some'
        }))
        .pipe(gp.sourcemaps.write('./'))
        .pipe(gp.rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy', function () {
    return gulp.src(['lib/**/*.js'])
        .pipe(gp.jsbeautifier({
            config: '.jsbeautifyrc'
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('test', function () {
    return gulp.src(['lib/**/*.js'])
        .pipe(gp.istanbul())
        .pipe(gp.istanbul.hookRequire())
        .on('finish', function () {
            gulp.src(['test/**/*.js']).pipe(gp.mocha()).pipe(gp.istanbul.writeReports());
        });
});

gulp.task('test-shoplist', function () {
    return gulp.src(['example/shoplist/lib/**/*.js'])
        .pipe(gp.istanbul())
        .pipe(gp.istanbul.hookRequire())
        .on('finish', function () {
            gulp.src(['example/shoplist/test/**/*.js']).pipe(gp.mocha()).pipe(gp.istanbul.writeReports());
        });
});

gulp.task('coveralls', function () {
    return gulp.src('coverage/lcov.info')
        .pipe(gp.coveralls());
});

gulp.task('build', function (callback) {
    return runSequence('jshint', 'test', ['copy', 'min'], callback);
});

gulp.task('travis', function (callback) {
    return runSequence('jshint', 'test', 'coveralls', callback);
});
