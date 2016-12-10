var gulp = require("gulp");
var distdir = "./dist";


// default task
gulp.task("default", function()
{
	gulp.start("build");
});


// build all
gulp.task("build", function()
{
	gulp.start(["demo", "js", "css", "image"]);
});


// build demo file
gulp.task("demo", function()
{
	// generate "demo-legacy.html"
	var patch = require("apply-patch");
	patch.applyPatch("./patch/demo-legacy.html.patch");
});


// embed translation data and minify
gulp.task("js", function()
{
	// generate "src/cazary-legacy.es6"
	var patch = require("apply-patch");
	patch.applyPatch("./patch/cazary-legacy.es6.patch");

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
			var babel = require("gulp-babel");
			var uglify = require("gulp-uglify");
			var rename = require("gulp-rename");
			gulp.src("./src/*.es6")
				.pipe(replace(/\b__TRANSLATION_DATA__\b/g, translation_string))
				.pipe(babel({
					presets: ['es2015']
				}))
				.pipe(uglify({
					preserveComments: "some"
				}))
				.pipe(rename({
					suffix: ".min",
					extname: ".js"
				}))
				.pipe(gulp.dest(distdir));
		});
});


// compile Sass
gulp.task("css", function()
{
	var sass = require("gulp-sass");
	gulp.src("./src/themes/**/*.scss")
		.pipe(sass({outputStyle: "compressed"}))
		.pipe(gulp.dest(distdir + "/themes"));
});


// minify SVG and generate PNG
gulp.task("image", function()
{
	var imagemin = require("gulp-imagemin");
	var pngquant = require("imagemin-pngquant");
	var svg2png = require("gulp-svg2png");

	gulp.src(["./src/themes/**/*.svg", "!./**/*.orig.svg"])
		.pipe(imagemin({}))
		.pipe(gulp.dest(distdir + "/themes"))
		.pipe(svg2png())
		.pipe(imagemin({use: [pngquant({quality: "65-80", speed: 1})]}))
		.pipe(gulp.dest(distdir + "/themes"));
});
