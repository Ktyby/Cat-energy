var gulp = require('gulp'); 
var plumber = require('gulp-plumber'); 
var rename = require('gulp-rename'); 
 
var imagemin = require('gulp-imagemin'); 
var webp = require('gulp-webp'); 
var svgstore = require('gulp-svgstore'); 
 
var sass = require('gulp-sass'); 
var postcss = require('gulp-postcss'); 
var autoprefixer = require('autoprefixer'); 
var csso = require('gulp-csso'); 
 
var posthtml = require("gulp-posthtml"); 
var include = require("posthtml-include"); 
 
var server = require("browser-sync").create(); 
 
var minify = require('gulp-minify'); 
var concat = require('gulp-concat'); 
 
var del = require("del"); 
 
gulp.task('css', function () { 
    return gulp.src('www/scss/style.scss') 
    .pipe(plumber()) 
    .pipe(sass()) 
    .pipe(postcss([ 
        autoprefixer() 
    ])) 
    .pipe(gulp.dest("docs/css")) 
    .pipe(csso()) 
    .pipe(rename("style.min.css")) 
    .pipe(gulp.dest('docs/css')); 
}); 
 
gulp.task('images', function() { 
    return gulp.src('www/img/*.{png,jpg}') 
    .pipe(imagemin([ 
        imagemin.optipng({optimizationLevel: 3}), 
        imagemin.jpegtran({progressive: true}) 
    ])) 
    .pipe(gulp.dest('docs/img')); 
}); 
 
gulp.task('webp', function () { 
    return gulp.src('www/img/*.{png,jpg}') 
    .pipe(webp({quality: 90})) 
    .pipe(gulp.dest('docs/img')); 
 
}); 

gulp.task('sprite', function () { 
    return gulp.src('www/img/*.svg') 
    .pipe(svgstore({ 
        inlineSvg: true 
    })) 
    .pipe(rename('sprite.svg')) 
    .pipe(gulp.dest('docs/img')); 
}); 
 
gulp.task('html', function () { 
    return gulp.src('www/*.html') 
    .pipe(posthtml([ 
        include() 
    ])) 
    .pipe(gulp.dest('docs')); 
}); 
 
gulp.task('server', function () { 
    server.init({ 
        server: 'docs' 
    }); 

    gulp.watch('www/scss/**/*.scss', gulp.series('css')); 
    gulp.watch('www/js/**/*.js', gulp.series('js')); 
    gulp.watch('www/img/icon-*.svg', gulp.series('sprite', 'html')); 
    gulp.watch('www/*.html', gulp.series('html', 'refresh')); 
}); 
 
gulp.task('copy', function () {  
    return gulp.src([ 
        'www/fonts/**/*.{woff,woff2}', 
        'www/img/*.svg' 
    ], { 
        base: 'www' 
    }) 
    .pipe(gulp.dest('docs')); 
}); 
 
gulp.task('clean', function () {  
    return del('docs'); 
}); 
 
gulp.task('js', function() { 
    return gulp.src('www/js/*.js') 
    .pipe(concat('main.js')) 
    .pipe(minify({ 
        ext:{ 
            min:'.min.js' 
        }, 
    })) 
    .pipe(gulp.dest('docs/js')); 
}) 
 
gulp.task('docs', gulp.series( 
    'clean', 
    'copy', 
    'images', 
    'css', 
    'sprite', 
    'webp', 
    'html', 
    'js')); 
 
gulp.task('start', gulp.series('docs', 'server')); 
 
gulp.task("refresh", function (done) { 
    server.reload(); 
    done(); 
});