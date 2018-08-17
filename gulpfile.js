var gulp = require('gulp')
var rename = require('gulp-rename')
var uglify = require('gulp-uglify')
var concat = require('gulp-concat')
	// <script src="/js/jquery-1.12.0.min.js"></script>
	// <script src="/js/bootstrap/js/bootstrap.min.js"></script>
	// <script src="/js/bootstrap-dialog.min.js"></script>
	// <script src="/js/underscore-min.js"></script>
	// <script src="/js/jquery.validate.js"></script>
	// <script src="/js/bootoast.js"></script>
	// <script src="/js/main.js"></script>

gulp.task('uglifyPC', function () {
	return gulp.src([
		'public/js/jquery.validate.js',
		'public/js/bootoast.js',
		'public/js/main.js'
	], { base: 'public'})
		.pipe(uglify())
		.pipe(concat('main.min.js'))
		.pipe(gulp.dest('public/dist/'))
})

gulp.task('uglifyApp', function () {
	let arr = [
		'public/app/js/lib/fastclick.js',
		'public/app/js/lib/jquery-weui.js',
		'public/app/js/app.js'
	]
	return gulp.src(arr)
		.pipe(uglify())
		.pipe(concat('app.min.js'))
		.pipe(gulp.dest('public/dist/'))
})

gulp.task('build', function () {

})
gulp.task('dev', function () {

})

gulp.task('default', ['uglifyPC'], function () {

})