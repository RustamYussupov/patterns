//============================================================================================
// -- Переменные для настройки
//============================================================================================
const gulp              = require('gulp');
const concat            = require('gulp-concat');
const autoprefixer      = require('gulp-autoprefixer');
const cleanCSS          = require('gulp-clean-css');
const uglify            = require('gulp-uglify');
const browserSync       = require('browser-sync').create();
const plumber           = require('gulp-plumber');
const less              = require('gulp-less');
const rename            = require('gulp-rename');
const sourcemaps        = require('gulp-sourcemaps');
const svgmin            = require('gulp-svgmin');
const imagemin          = require('gulp-imagemin');
const changeCase        = require('change-case');
// НА РАСМОТРЕНИИ
const csscomb           = require('gulp-csscomb');
const del               = require('del');


//============================================================================================
// -- РАЗРЕШЕНИЯ ИЗОБРОЖЕНИЙ
//============================================================================================
const image_ext = '{png,Png,PNG,jpg,Jpg,JPG,jpeg,Jpeg,JPEG,gif,Gif,GIF,bmp,BMP,Bmp}';

//============================================================================================
// -- ПУТИ ДО ФАЙЛОВ
//============================================================================================
const components     = './resources/assets/components/',
	scripts          = './resources/assets/js/',
	base             = './resources/assets/base/',
	images           = './resources/assets/img/',
	fonts   		 = './resources/assets/fonts/',
	pluginsOverlay   = './resources/assets/base/plugins_overlay/',
	vendor           = './resources/assets/vendor/',
	// myPlugins        = './resources/assets/js/my_plugins/',
	commonCss        = './resources/assets/base/common/',

	productionCss    = './public/css/',
	productionImg    = './public/img/',
	productionJs     = './public/js/',
	productionFonts  = './public/fonts/',
	html             = './resources/views/front/',

	devImg           = [
		images + '**/*.' + image_ext,
		components + '**/*.' + image_ext
	],
	devImgSvg        = [
		images + '**/*.svg',
		components + '**/*.svg'
	],
	styleComponents  = [
		commonCss        + '*.less',
		base           	    + '*.less',
		vendor           + '**/*.css',
		vendor           + '**/*.less',
		// myPlugins        + '**/*.less',
		pluginsOverlay   + '**/*.less',
		components       + '**/*.less',
		'!' + components + '**/*.adaptive.less',
		'!' + base + '**/*.adaptive.less',
		'!/**/d_*/*.*',
		'!/**/d_*.*'
	],
	adaptiveStyleComponents = [
		commonCss  + '*.less',
		// myPlugins  + '**/*.adaptive.less',
		components + '**/*.adaptive.less',
		base + '**/*.adaptive.less',
		'!/**/d_*/*.*',
		'!/**/d_*.*'
	],
	scriptComponents = [
		vendor     + '**/*.js',
		// myPlugins  + '**/*.js',
		pluginsOverlay   + '**/*.js',
		scripts    + '**/*.js',
		components + '**/*.js',
		'!/**/d_*/*.*',
		'!/**/d_*.*'
	],
	imageDirs = [];

//============================================================================================
// -- Компиляция и обработка LESS
//============================================================================================
function styles() {
	return gulp.src(styleComponents)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(concat('style.less'))
		.pipe(less())
		.pipe(autoprefixer({
			browsers: ['> 1%', 'last 3 versions', 'Firefox ESR'],
			cascade: false
		}))
		.pipe(rename('style.css'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(productionCss))
		.pipe(browserSync.stream());
}

function stylesAdaptive() {
	return gulp.src(adaptiveStyleComponents)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(concat('adaptive.less'))
		.pipe(less())
		.pipe(autoprefixer('> 1%', 'last 3 versions', 'Firefox ESR'))
		.pipe(rename('adaptive.css'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(productionCss))
		.pipe(browserSync.stream());
}

gulp.task('stylesAll', gulp.parallel(styles, stylesAdaptive));

//============================================================================================
// -- JS and PHP
//============================================================================================
function js() {
	return gulp.src(scriptComponents)
		.pipe(sourcemaps.init())
		.pipe(concat('scripts.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(productionJs))
		.pipe(browserSync.reload({
			stream: true
		}));
}

gulp.task('js', js);

//============================================================================================
// -- Ватчеры файлов
//============================================================================================
function watch(){
	browserSync.init({
		server: {
			baseDir: "./"
		}
	});

	gulp.watch(styleComponents, styles);
	gulp.watch(adaptiveStyleComponents, stylesAdaptive);
	gulp.watch(scriptComponents, js);
	gulp.watch(devImg, image);
	gulp.watch(devImgSvg, imageSVG);
	// gulp.watch(html).on('change', browserSync.reload);
	gulp.watch('./*.html').on('change', browserSync.reload);
}

gulp.task('watch', watch);

//============================================================================================
// -- Оптимизация изображений
//============================================================================================
function image() {
	return gulp.src(devImg)
		.pipe(plumber())
		.pipe(imagemin({
			progressive: true,
			interlaced: true,
			optimizationLevel: 7
		}))
		.pipe(rename(function (path) {
			path.basename = changeCase.lowerCase(path.basename); // Запись файлов в нижнем регистре вместе с расширением
			path.extname = changeCase.lowerCase(path.extname);  // Запись файлов в нижнем регистре вместе с расширением
		}))
		.pipe(gulp.dest(productionImg))
		.pipe(browserSync.reload({
			stream: true
		}));
}

function imageSVG() {
	gulp.src(devImgSvg)
		.pipe(plumber())
		.pipe(svgmin())
		.pipe(rename(function (path) {
			path.basename = changeCase.lowerCase(path.basename);
			path.extname  = changeCase.lowerCase(path.extname);
		}))
		.pipe(gulp.dest(productionImg))
		.pipe(browserSync.reload({
			stream: true
		}));
}

gulp.task('imageAll', gulp.parallel(image, imageSVG));

//============================================================================================
// -- PRODUCTION
//============================================================================================
// function ProductionStyles(){
// 	return gulp.src('./src/css/**/*.css')
// 		.pipe(plumber())
// 		.pipe(concat('style.css'))
// 		.pipe(autoprefixer({
//             browsers: ['> 1%', 'last 3 versions', 'Firefox ESR'],
//             cascade: false
//         }))
//      	.pipe(cleanCSS({
//      		level: 2
//      	}))
// 		.pipe(gulp.dest('./build/css'))
//         .pipe(browserSync.stream());
// }
//
// function ProductionStylesAdaptive() {
// 	return gulp.src(adaptiveStyleComponents)
// 		.pipe(plumber())
// 		.pipe(sourcemaps.init())
// 		.pipe(concat('adaptive.less'))
// 		.pipe(less())
// 		.pipe(autoprefixer('> 1%', 'last 3 versions', 'Firefox ESR'))
// 		.pipe(rename('adaptive.css'))
// 		.pipe(sourcemaps.write())
// 		.pipe(gulp.dest(productionCss))
// 		.pipe(browserSync.stream());
// }
//
// function ProductionScript(){
// 	return gulp.src('./src/js/**/*.js')
// 		.pipe(concat('all.js'))
// 		.pipe(uglify())
// 		.pipe(gulp.dest('./build/js'));
// }

//============================================================================================

function clean(){
	return del(['public/']);
}

gulp.task('clean', clean);
// gulp.task('build', gulp.series(clean, gulp.parallel(styles, scripts)));

//============================================================================================
