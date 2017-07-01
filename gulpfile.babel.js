import gulp from "gulp";
import babel from "gulp-babel";
import imagemin from "gulp-imagemin";
import rename from "gulp-rename";
import replace from "gulp-replace";
import uglify from "gulp-uglify";
import sass from "gulp-sass";
import svg2png from "gulp-svg2png";
import yaml from "gulp-yaml";

import patch from "apply-patch";
import path from "path";
import pngquant from "imagemin-pngquant";

const distdir = path.resolve("dist");
const themedir = path.join(distdir, "themes");


// default task
gulp.task("default", () =>
{
	gulp.start("build");
});


// build all
gulp.task("build", () =>
{
	gulp.start(["demo", "js", "css", "image"]);
});


// build demo file
gulp.task("demo", () =>
{
	// generate "demo-legacy.html"
	patch.applyPatch("./patch/demo-legacy.html.patch");
});


// embed translation data and minify
gulp.task("js", () =>
{
	// generate "src/cazary-legacy.es6"
	patch.applyPatch("./patch/cazary-legacy.es6.patch");

	// generate translation data
	const translation_data = {};
	gulp.src("./src/i18n/*.yaml")
		.pipe(yaml())
		.on("data", (file) =>
		{
			// generate translation data
			const path = file.path;
			const found = path.match(/([-0-9a-zA-Z]+)\.json$/);
			if(found === null)
			{
				console.warn(path + " has been ignored");
				return;
			}

			const lang = found[1];
			translation_data[lang] = JSON.parse(file.contents.toString());
		})
		.on("end", () =>
		{
			gulp.src("./src/*.es6")
				.pipe(replace("{/*@TRANSLATION_DATA@*/}", JSON.stringify(translation_data)))
				.pipe(babel({
					presets: [
						[
							"env",
							{
								targets: {
									browsers: [
										"ie >= 8",
										"opera >= 12",
										"last 2 firefox versions",
										"last 2 chrome versions",
										"last 2 safari versions",
									],
								},
							},
						],
					],
					babelrc: false,
				}))
				.pipe(uglify({
					output: {
						comments: /^!/,
					},
				}))
				.pipe(rename({
					suffix: ".min",
					extname: ".js",
				}))
				.pipe(gulp.dest(distdir));
		});
});


// compile Sass
gulp.task("css", () =>
{
	gulp.src("./src/themes/**/*.scss")
		.pipe(sass({outputStyle: "compressed"}))
		.pipe(gulp.dest(themedir));
});


// minify SVG and generate PNG
gulp.task("image", () =>
{
	gulp.src(["./src/themes/**/*.svg", "!./**/*.orig.svg"])
		.pipe(imagemin({}))
		.pipe(gulp.dest(themedir))
		.pipe(svg2png())
		.pipe(imagemin({use: [pngquant({quality: "65-80", speed: 1})]}))
		.pipe(gulp.dest(themedir));
});
