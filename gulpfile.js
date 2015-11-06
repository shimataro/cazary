var gulp = require("gulp");


// default task
gulp.task("default", ["js", "css"], function()
{
});


// JS task: embed translation data and minify
gulp.task("js", function()
{
	// generate translation data
	var translation_data = {};
	var yaml = require("gulp-yaml");
	gulp.src("./src/i18n/*.yaml")
		.pipe(yaml())
		.on("data", function(file)
		{
			// generate translation data
			var path = file.path;
			var found = path.match(/([-0-9a-zA-Z]+)\.json$/);
			if(found === null)
			{
				console.warn(path + " has been ignored");
				return;
			}

			var lang = found[1];
			translation_data[lang] = JSON.parse(file.contents.toString());
		})
		.on("end", function()
		{
			var translation_string = JSON.stringify(translation_data);

			var replace = require("gulp-replace");
			var uglify = require("gulp-uglify");
			var rename = require("gulp-rename");
			gulp.src("./src/*.js")
				.pipe(replace(/\b__TRANSLATION_DATA__\b/g, translation_string))
				.pipe(uglify({preserveComments: "some"}))
				.pipe(rename({suffix: ".min"}))
				.pipe(gulp.dest("."));
		});
});


// CSS task: compile Sass
gulp.task("css", function()
{
	var sass = require("gulp-sass");
	gulp.src("./themes/*/style.scss")
		.pipe(sass({outputStyle: "compressed"}))
		.pipe(gulp.dest("./themes"));
});
