/* global require */

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

// See the uglify documentation for more details
var uglifySettings = {
    compress: {
        comparisons: true,
        conditionals: true,
        /* jscs: disable */
        dead_code: true,
        drop_console: true,
        /* jscs: enable */
        unsafe: true,
        unused: true,
    },
};

// Assets for the project
var Assets = {
    main: 'jquery-ajax-localstorage-cache.js',
    minified: 'jquery-ajax-localstorage-cache.min.js',
};

// Check the code meets the following standards outlined in .jshintrc
gulp.task('jshint', function() {
    return gulp.src('./' + Assets.main)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

// Uglify aka minify the main file
gulp.task('uglify', function() {
    return gulp.src('./' + Assets.main)
        .pipe(uglify(uglifySettings))
        .pipe(rename(Assets.minified))
        .pipe(gulp.dest('./'));
});

// Watch for changes to the main file
gulp.task('watch', function() {
    gulp.watch('./' + Assets.main, ['jshint', 'uglify']);
});

// Register the default task
gulp.task('default', ['jshint', 'uglify']);

// 'gulp jshint' to check the syntax
// 'gulp uglify' to uglify the main file
