const gulp = require("gulp");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");

const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");

const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("gulp-csso");

const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");

const server = require("browser-sync").create();

const minify = require("gulp-minify");
const concat = require("gulp-concat");

const del = require("del");

gulp.task("css", function () {
  return gulp
    .src("www/scss/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"));
});

gulp.task("images", function () {
  return gulp
    .src("www/img/*.{png,jpg}")
    .pipe(
      imagemin([
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.jpegtran({ progressive: true }),
      ])
    )
    .pipe(gulp.dest("build/img"));
});

gulp.task("webp", function () {
  return gulp
    .src("www/img/*.{png,jpg}")
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest("build/img"));
});

gulp.task("sprite", function () {
  return gulp
    .src("www/img/*.svg")
    .pipe(
      svgstore({
        inlineSvg: true,
      })
    )
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("html", function () {
  return gulp
    .src("www/*.html")
    .pipe(posthtml([include()]))
    .pipe(gulp.dest("build"));
});

gulp.task("server", function () {
  server.init({
    server: "build",
  });

  gulp.watch("www/scss/**/*.scss", gulp.series("css"));
  gulp.watch("www/js/**/*.js", gulp.series("js"));
  gulp.watch("www/img/icon-*.svg", gulp.series("sprite", "html"));
  gulp.watch("www/*.html", gulp.series("html", "refresh"));
});

gulp.task("copy", function () {
  return gulp
    .src(["www/fonts/**/*.{woff,woff2}", "www/img/*.svg"], {
      base: "www",
    })
    .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("js", function () {
  return gulp
    .src("www/js/*.js")
    .pipe(concat("index.js"))
    .pipe(
      minify({
        ext: {
          min: ".min.js",
        },
      })
    )
    .pipe(gulp.dest("build/js"));
});

gulp.task(
  "build",
  gulp.series("clean", "copy", "images", "css", "sprite", "webp", "html", "js")
);

gulp.task("start", gulp.series("build", "server"));

gulp.task("refresh", function (done) {
  server.reload();
  done();
});
