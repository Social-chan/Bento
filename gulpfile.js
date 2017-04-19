var 
	fs 				= require('fs'),
	gulp			= require('gulp'),
	bump 			= require('gulp-bump'),
	rename			= require('gulp-rename'),
	replace 		= require('gulp-replace')
	uglify			= require('gulp-uglify'),
	sass			= require('gulp-sass'),
	sassJson 		= require('gulp-sass-json'),
	cleanCSS		= require('gulp-clean-css'),
	strip_comments	= require('gulp-strip-css-comments'),
	autoprefixer	= require('gulp-autoprefixer'),
	sourcemaps		= require('gulp-sourcemaps'),
	zip 			= require('gulp-zip'),
	del				= require('del');

const 
	scss_dir	= './components',
	src_styles	= './src',
	dist_styles	= './dist/css',
	docs_styles = './docs/dist/css';

var getPackageJson = function () {
	return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
};

// Build task process concat different tasks
gulp.task('build', function () {
	gulp.run('patch');
	gulp.run('bump');
	gulp.run('sass');
	gulp.run('clean');
});

// Preprocess SASS components
gulp.task('sass', function () {
	return gulp.src(scss_dir + '/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(sourcemaps.write('./'))
		.pipe(strip_comments())
		.pipe(gulp.dest(src_styles));
});

// DEV ONLY! Watch for any change in components dir
gulp.task('watch', function () {
	gulp.watch(scss_dir + '/**/*.scss', ['sass']);
});

// Delete all files from dist styles
gulp.task('delete', function () {
	return del(dist_styles);
});

// Autoprefix, clean & minify CSS
gulp.task('clean', ['delete'], function () {
	return gulp.src(src_styles + '/*.css')
		.pipe(sourcemaps.init())
		.pipe(autoprefixer())
		.pipe(rename({ suffix: '.min' }))
		.pipe(cleanCSS({
			keepSpecialComments: 1,
			processImportFrom: 'local',
			compatibility: 'ie8',
			debug: true
		}, function(details) {
			console.log(details.name + ': ' + details.stats.originalSize);
			console.log(details.name + ': ' + details.stats.minifiedSize);
		}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(dist_styles))
		.pipe(gulp.dest(docs_styles));
});

// Compress build (dist) pack in zip
gulp.task('compress', function () {
	var pkg = getPackageJson();
	return gulp.src('./dist/*/**')
		.pipe(zip(pkg.name + '-' + pkg.version + '.zip'))
		.pipe(gulp.dest('./'));
});

// Minor patch to package
gulp.task('patch', function () {
	return gulp.src('./package.json')
		.pipe(bump({ key: "version" }))
		.pipe(gulp.dest('./'));
});

// Bump replacement for SASS variable
gulp.task('bump', function () {
	var pkg = getPackageJson();
	return gulp.src(scss_dir + '/tadaima/variables.scss')
		.pipe(replace(/"(\d+.\d+.\d+)"/g, '"' + pkg.version + '"'))
		.pipe(gulp.dest(scss_dir + '/tadaima'));
});