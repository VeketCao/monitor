var gulp = require('gulp');
rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('auto',function(){
    gulp.watch('src/*.js',['script']);
})

gulp.task('script',function () {
    gulp.src('src/*.js')
        .pipe(uglify({mangle:false}))
        .pipe(rename({suffix:'.min'}))
        .pipe(gulp.dest('dist'))
});

gulp.task("default", ['script','auto']);