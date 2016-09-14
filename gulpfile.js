var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['sass']);

gulp.task('sass', function (done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({extname: '.min.css'}))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function () {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function () {
  return bower.commands.install()
    .on('log', function (data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function (done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

gulp.task('install', function () {
  sh.exec('npm install');
  sh.exec('bower install');
  sh.exec('ionic state restore');

  console.log(
    gutil.colors.green('All your packages have been updated, you can start developing')
  )
});

gulp.task('start', function () {
  sh.exec('node server');
});

gulp.task('check-config', function () {
  var config = sh.grep('config-', './server.js');
  var res = config.substring(24, config.indexOf('.', 24));
  if (res === 'config-dev') {
    console.log(
      'Vous utilisez actuellement le fichier de configuration : ' + gutil.colors.green(res) + '.'
    )
  } else {
    console.log(
      'Vous utilisez actuellement le fichier de configuration : ' + gutil.colors.red(res) + '.'
    )
  }
});

gulp.task('change-config', function () {
  var config = sh.grep('config-', './server.js');
  var res = config.substring(24, config.indexOf('.', 24));
  if (res === 'config-dev') {
    sh.sed('-i','config-dev', 'config-prod', './server.js');
  } else {
    sh.sed('-i','config-prod', 'config-dev', './server.js');
  }
});
