/*jshint strict:false */
require('es6-shim');

var gulp = require('gulp');
var runSequence = require('run-sequence');
var gp = require('auto-plug')('gulp');

gulp.task('jshint', function () {
    return gulp.src(['lib/**/*.js', 'test/**/*.js', 'example/**/*.js', 'gulpfile.js'])
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

gulp.task('test-kanban', function () {
    return gulp.src(['example/kanban/lib/**/*.js'])
        .pipe(gp.istanbul())
        .pipe(gp.istanbul.hookRequire())
        .on('finish', function () {
            gulp.src(['example/kanban/test/**/*.js']).pipe(gp.mocha()).pipe(gp.istanbul.writeReports());
        });
});

gulp.task('test-kanban-domain', function () {
    return gulp.src(['example/kanban/lib/**/*.js'])
        .pipe(gp.istanbul())
        .pipe(gp.istanbul.hookRequire())
        .on('finish', function () {
            gulp.src(['example/kanban/test/domain/**/*.js']).pipe(gp.mocha()).pipe(gp.istanbul.writeReports());
        });
});

gulp.task('test-kanban-api', function () {
    return gulp.src(['example/kanban/lib/api/**/*.js'])
        .pipe(gp.istanbul())
        .pipe(gp.istanbul.hookRequire())
        .on('finish', function () {
            gulp.src(['example/kanban/lib/**/*.js', 'example/kanban/test/api/**/*.js']).pipe(gp.mocha()).pipe(gp.istanbul.writeReports());
        });
});

gulp.task('test-kanban-io', function () {
    return gulp.src(['example/kanban/lib/io/**/*.js'])
        .pipe(gp.istanbul())
        .pipe(gp.istanbul.hookRequire())
        .on('finish', function () {
            gulp.src(['example/kanban/lib/**/*.js', 'example/kanban/test/io/**/*.js']).pipe(gp.mocha()).pipe(gp.istanbul.writeReports());
        });
});

gulp.task('serve-kanban', function (done) {
    var http = require('./example/kanban/lib/server').http;
    var storage = require('./example/kanban/lib/storage').local;
    storage.clear();
    storage.setItem('rights', JSON.stringify({
        admin: {
            roles: ['admin']
        }
    }));
    storage.setItem('persons', JSON.stringify({
        admin: {
            personId: 'admin',
            name: 'administrator'
        }
    }));
    require('./example/kanban/lib/domain/boards.handlers');
    require('./example/kanban/lib/domain/boards.repo.local');
    require('./example/kanban/lib/domain/cards.handlers');
    require('./example/kanban/lib/domain/cards.repo.local');
    require('./example/kanban/lib/domain/columns.handlers');
    require('./example/kanban/lib/domain/columns.repo.local');
    require('./example/kanban/lib/domain/members.handlers');
    require('./example/kanban/lib/domain/members.repo.local');
    require('./example/kanban/lib/domain/persons.handlers');
    require('./example/kanban/lib/domain/persons.repo.local');
    require('./example/kanban/lib/domain/rights.handlers');
    require('./example/kanban/lib/domain/rights.repo.local');
    require('./example/kanban/lib/domain/rooms.handlers');
    require('./example/kanban/lib/domain/rooms.repo.local');
    require('./example/kanban/lib/domain/teams.handlers');
    require('./example/kanban/lib/domain/teams.repo.local');
    require('./example/kanban/lib/api/persons');
    http.listen(8080, function() {
        console.log('%s listening at %s', http.name, http.url);
        done();
    });
});

gulp.task('coveralls', function () {
    return gulp.src('coverage/lcov.info')
        .pipe(gp.coveralls());
});

gulp.task('build', function (callback) {
    return runSequence('jshint', 'test', ['copy', 'min'], callback);
});

gulp.task('ci', function (callback) {
    return runSequence('jshint', 'test', 'coveralls', callback);
});
