'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var del = require('del');

gulp.task('clean', function(done) {
  del(['dist/chip8.min.js'], done);
});

gulp.task('dist', function() {
  browserify('./src/index.js')
    .bundle()
    .pipe(source('chip8.min.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./dist'))
});

gulp.task('default', ['clean', 'dist']);
