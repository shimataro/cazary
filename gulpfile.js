var gulp = require("gulp");


// default task
gulp.task("default", ["js", "sass"], function()
{
});


// combine translation files
gulp.task("translation", function()
{
	var concat = require("gulp-concat");
	return gulp.src("./src/i18n/*.yaml")
		.pipe(concat("translation.yaml"))
		.pipe(gulp.dest("./src"));
});


// combine and minify JS
gulp.task("js", ["translation"], function()
{
	var webpack = require("webpack-stream");
	var uglify = require("gulp-uglify");
	gulp.src("")
		.pipe(webpack({
//			devtool: "#source-map",
			entry: {
				"cazary": "./src/cazary.js",
				"cazary-legacy": "./src/cazary-legacy.js",
			},
			output: {
				filename: "[name].min.js"
			}
		}))
		.pipe(uglify({
			preserveComments: "some"
		}))
		.pipe(gulp.dest("."));
});


// compile Sass
gulp.task("sass", function()
{
	var sass = require("gulp-sass");
	gulp.src("./themes/*/style.scss")
		.pipe(sass({
			outputStyle: "compressed"
		}))
		.pipe(gulp.dest("./themes"));
});
