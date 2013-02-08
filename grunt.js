module.exports = function(grunt) {



  grunt.initConfig({
    min: {
      dist: {
        src: [
          'client/js/{' +
            '{lib,models,collections,views,routers}/*,' +
            '{namespaces,constants,util,main}.js,' + 
          '}'
        ],
        dest: 'public/main.js'
      },
    },
    watch: {
      scripts: {
        files: '<config:min.dist.src>',
        tasks: 'default'
      }
    }
  });
  
  grunt.registerTask('default', 'min');




};

