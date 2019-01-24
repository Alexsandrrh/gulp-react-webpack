const gulp = require('gulp');
const del = require('del');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const If = require('gulp-if');
const webpack = require('webpack-stream');
const uglify = require('gulp-uglify');
const named = require('vinyl-named');
const rename = require('gulp-rename');
const prettify = require('gulp-prettify');
const argv = require('yargs').argv;
const nodemon = require('gulp-nodemon');

gulp.task('clean', function () {
    return del('public');
});

gulp.task('html', function () {
    return gulp.src('src/templates/**/*.html')
        .pipe(prettify({indent_size: 4}))
        .pipe(gulp.dest('public'));
});

gulp.task('svg', function () {
    return gulp.src('src/svg/**/*.svg')
        .pipe(gulp.dest('public/svg'));
});

gulp.task('scss', function () {
    return gulp.src('src/scss/main.scss')
        .pipe(sass())
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: ['last 5 versions'],
            cascade: true
        }))
        .pipe(If(!argv.development, cssnano()))
        .pipe(sourcemaps.write('/maps'))
        .pipe(gulp.dest('public/css'));
});

gulp.task('react', function () {
    return gulp.src('src/react/index.js')
        .pipe(named(function() {
          return 'bundle'
        }))
        .pipe(sourcemaps.init())
        .pipe(webpack({
            mode : argv.development ? 'development' : 'production',
            module: {
                rules: [
                    {
                        test: /\.(js|jsx)$/,
                        exclude: /node_modules/,
                        use: {
                            loader: "babel-loader",
                            options: {
                                "presets": ["@babel/preset-env", "@babel/preset-react"]
                            }
                        }
                    }
                ]
            }
        }))

        .pipe(If(!argv.development, uglify()))
        .pipe(gulp.dest('public/js'));
});

gulp.task('server', function() {
  nodemon({ script : 'server.js'})
});

gulp.task('watch', function () {
    gulp.watch('src/templates/**/*.html', gulp.series('html'));
    gulp.watch('src/scss/**/*.{scss, sass}', gulp.series('scss'));
    gulp.watch('src/react/**/**/**/*.js', gulp.series('react'));
    gulp.watch('src/svg/**/*.svg', gulp.series('svg'));
});

gulp.task('build', gulp.series('clean', 'scss', 'react', 'svg', 'html'));

gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'server')));
