'use strict';
// generated on 2014-05-14 using generator-gulp-webapp 0.1.0

var gulp = require('gulp');

// load plugins
var $ = require('gulp-load-plugins')();

gulp.task('scripts', function () {
    return gulp.src(['demo/**/*.js', 'src/**/*.js'])
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe($.size());
});

gulp.task('html', ['scripts'], function () {
    var jsFilter = $.filter('**/*.js');

    return gulp.src('demo/*.html')
        .pipe($.useref.assets({searchPath: '{demo}'}))
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

gulp.task('extras', function () {
    return gulp.src(['demo/*.*', '!demo/*.html'], { dot: true })
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
    return gulp.src(['dist'], { read: false }).pipe($.clean());
});

gulp.task('build', ['html', 'extras']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('connect', function () {
    var connect = require('connect');
    var app = connect()
        .use(require('connect-livereload')({ port: 35729 }))
        .use(connect.static('demo'))
        .use(connect.static('src'))
        .use(connect.directory('demo'));

    require('http').createServer(app)
        .listen(9000)
        .on('listening', function () {
            console.log('Started connect web server on http://localhost:9000');
        });
});

gulp.task('serve', ['connect'], function () {
    require('opn')('http://localhost:9000');
});

gulp.task('watch', ['connect', 'serve'], function () {
    var server = $.livereload();

    // watch for changes

    gulp.watch([
        'demo/**/*.html',
        'demo/**/*.css',
        'demo/**/*.js',
        'src/**/*.js'
    ]).on('change', function (file) {
        server.changed(file.path);
    });

    gulp.watch([
        'demo/**/*.js',
        'src/**/*.js'
    ], ['scripts']);

});
