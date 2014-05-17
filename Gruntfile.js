module.exports = function (grunt) {

    grunt.initConfig({
        karma: {
            default: {
                configFile: 'karma.conf.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-karma');

};
