module.exports = function (grunt) {

    grunt.initConfig({
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
        }
    });

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-jshint');

};
