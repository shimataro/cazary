var gulp = require("gulp");


// default task
gulp.task("default", ["js", "sass"], function()
{
});


// combine translation files
gulp.task("translation", function()
{
	var concat = require("gulp-concat");
	var yaml = require("gulp-yaml");
	var rename = require("gulp-rename");
	return gulp.src("./src/i18n/*.yaml")
		.pipe(concat("_.yaml"))
		.pipe(yaml())
		.pipe(rename({extname: ".json"}))
		.pipe(gulp.dest("./src"));
});


// combine and minify JS
gulp.task("js", ["translation"], function()
{
	var fs = require("fs");
	var replace = require("gulp-replace");
	var uglify = require("gulp-uglify");
	var rename = require("gulp-rename");
	var translation_data = fs.readFileSync("./src/_.json");
	gulp.src("./src/*.js")
		.pipe(replace("TRANSLATION_DATA", translation_data))
		.pipe(uglify({preserveComments: "some"}))
		.pipe(rename({suffix: ".min"}))
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
