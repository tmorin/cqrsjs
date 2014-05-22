module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            default: {
                options:{
                    port: 3001,
                    base: '',
                    keepalive: true
                }
            }
        },
        karma: {
            default: {
                configFile: 'karma.conf.js'
            }
        },
        jshint: {
            default: {
                files: {
                    src: ['src/**/*.js', 'spec/**/*.js']
                }
            }
        },
        uglify: {
            default: {
                options: {
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */',
                    sourceMap: true,
                    sourceMapIncludeSources: true,
                    sourceMapName: 'dist/cqrs.map'
                },
                files: {
                    'dist/cqrs.min.js': ['src/cqrs.js']
                }
            }
        },
        bumpup: ['bower.json', 'package.json'],
        tagrelease: {
            file: 'package.json',
            prefix: '',
            commit: true
        },
        exec: {
            'update_master':{
                cmd: 'git push origin master --tags'
            }
        }
    });

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-tagrelease');
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('build', ['jshint', 'karma', 'uglify']);
    grunt.registerTask('bump:patch', ['bumpup:patch', 'tagrelease']);

    grunt.registerTask('push', ['exec:update_master']);
    grunt.registerTask('bump-push', ['bump:patch','push']);

};
