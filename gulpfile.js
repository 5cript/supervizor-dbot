const gulp = require('gulp')
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps');

gulp.task('babel', function () {
	return gulp
		.src('src/**/*.js')
		.pipe(babel({presets: ['env']}))
		.pipe(gulp.dest('bin'))
	;
})

gulp.task('default', ['babel'])