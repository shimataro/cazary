var gulp = require("gulp");


// default task
gulp.task("default", ["js", "sass"], function()
{
	console.log("done");
});


// combine and minify JS
gulp.task("js", function()
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
	gulp.src("./themes/*/*.scss")
		.pipe(sass({
			outputStyle: "compressed"
		}))
		.pipe(gulp.dest("./themes"));
});
