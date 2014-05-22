// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      //'bower_components/promise-polyfill/Promise.js',
      'node_modules/es6-promise/dist/promise-1.0.0.js',
      'src/*.js',
      'spec/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    reporters: ['progress'],

    junitReporter: {
        // outputFile: 'results/test-results.xml'
    },

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    //browsers: ['Chrome'],
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,


     plugins: [
        'karma-jasmine',
        'karma-firefox-launcher',
        'karma-phantomjs-launcher',
        'karma-chrome-launcher'
    ]

  });
};
