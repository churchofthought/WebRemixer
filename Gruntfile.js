module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.initConfig({
		concat: {
			dist: {
				src: [
					'client/js/namespaces.js',
					'client/js/{' +
						'{constants,util,main}.js,' + 
						'{lib,routers}/*' +
					'}',
					'client/js/views/View.js',
					'client/js/views/*.js',
					'client/js/models/Model.js',
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
