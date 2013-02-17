module.exports = function(grunt) {



  grunt.initConfig({
    concat: {
      dist: {
        src: [
          'client/js/namespaces.js',
          'client/js/{' +
            '{constants,util,main}.js,' + 
            '{lib,views,routers}/*,' +
          '}',
          'client/js/models/Remix.js',
          'client/js/models/Timeline.js',
          'client/js/models/Video.js',
          'client/js/models/Clip.js',
          'client/js/models/TimelineClip.js',
          'client/js/models/*.js',
          'client/js/collections/*'
        ],
        dest: 'public/main.js'
      },
    },
    watch: {
      scripts: {
        files: '<config:concat.dist.src>',
        tasks: 'default'
      }
    }
  });
  
  grunt.registerTask('default', 'concat');




};

