var targetDir = '../wwwroot/js';


module.exports = function (grunt) {

  grunt.initConfig({
    'myConfig': {
      'vendor_modules': [
        'jquery',
        'bootstrap',
        // 'bootstrap-sass',
        // 'angular-route',
        // 'angular-sanitize',
        // 'restangular',
        // 'jquery.cookie',
        // 'lodash',
        // 'underscore.string',
        // 'lodash-deep'
      ],
      'srcArray':[
        'src/layout/sideBar.js',
        'src/index.js', 
        'src/index2.js'
      ],
      'targetArray':[
        '../wwwroot/js/sideBar.js', 
        '../wwwroot/js/app.js', 
        '../wwwroot/js/app2.js'
      ],
      'srcCSS':[
        'node_modules/bootstrap/dist/css/bootstrap.min.css',
        'node_modules/bootstrap/dist/css/bootstrap.min.css.map',
        'node_modules/bootstrap-rtl/dist/css/bootstrap-rtl.css',
        'node_modules/bootstrap-rtl/dist/css/bootstrap-rtl.css.map',
      ],
      'targetCSS':[
       '../wwwroot/css/bootstrap/bootstrap.min.css',
       '../wwwroot/css/bootstrap/bootstrap.min.css.map',
       '../wwwroot/css/bootstrap/bootstrap-rtl.css',
       '../wwwroot/css/bootstrap/bootstrap-rtl.css.map',
      ]
    },
    uglify: {
      dist: {
        files: {
          '../wwwroot/js/sideBar.min.js': '../wwwroot/js/sideBar.js',
          '../wwwroot/js/app.min.js': '../wwwroot/js/app.js',
          '../wwwroot/js/app2.min.js': '../wwwroot/js/app2.js',
          '../wwwroot/js/vendor/jquery.min.js': '../wwwroot/js/vendor/jquery.js',
          '../wwwroot/js/vendor/bootstrap.min.js': '../wwwroot/js/vendor/bootstrap.js',
        }
      }
    }
  });

  //----------------------------------------------------------
  grunt.loadNpmTasks('grunt-contrib-uglify');
  //grunt.registerTask('default', ['uglify']);

  //---------------------------------------------------------
  grunt.registerTask('copyCss', function () {
    var done = this.async();
    var fs = require('fs');
    const path = require("path");

    var srcArray = grunt.config.get('myConfig.srcCSS') || []; 
    var targetArray = grunt.config.get('myConfig.targetCSS') || []; 


    var copyRecursiveSync = function(src, dest) {
      var exists = fs.existsSync(src);
      var stats = exists && fs.statSync(src);
      var isDirectory = exists && stats.isDirectory();
      if (isDirectory) {
        
        fs.readdirSync(src).forEach(function(childItemName) {

          grunt.log.writelns('readdirSync: %s - %s', src, childItemName);

          var exists = fs.existsSync(dest);
          if(!exists) fs.mkdirSync(dest);
          
          copyRecursiveSync(path.join(src, childItemName),
                            path.join(dest, childItemName));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    };

    srcArray.map((src,index)=>{
      var target = targetArray[index];

      copyRecursiveSync(src,target);
    })

    

  });
  //----------------------------------------------------------
  grunt.registerTask('browserify', function () {
    var done = this.async();
    var fs = require('fs');
    var browserify = require('browserify');

    var srcArray = grunt.config.get('myConfig.srcArray') || []; 
    var targetArray = grunt.config.get('myConfig.targetArray') || []; 

    srcArray.map((src, index) => {

      var target = targetArray[index];


      var browserify1 = new browserify({
        'cache': {},
        'packageCache': {}
      });

      browserify1.add(src);

      var compile = function (err, data) {
        grunt.log.writelns('compile: %s %s', src, target);
        if (err) return grunt.log.error(err);
        if (!data) return grunt.log.error('No data');
        grunt.file.mkdir(targetDir);
        fs.writeFileSync(target, data);
      };

      var vendorModules = grunt.config.get('myConfig.vendor_modules') || [];
      vendorModules.forEach(function (vm) {
        grunt.log.writelns('Excluding module from application bundle: %s', vm);
        browserify1.exclude(vm);
      });

      browserify1.bundle(compile);

    });


    //grunt.task.run('uglify');

  });

  
  //----------------------------------------------------------
  grunt.registerTask('watchify', function () {
    var done = this.async();
    var browserify = require('browserify');
    var watchify = require('watchify');
    var fs = require('fs');

    var srcArray = grunt.config.get('myConfig.srcArray') || []; 
    var targetArray = grunt.config.get('myConfig.targetArray') || [];

    srcArray.map((src, index) => {

      var target = targetArray[index];

      var browserify1 = new browserify({
        'cache': {},
        'packageCache': {}
      });
      browserify1 = watchify(browserify1);
      browserify1.add(src);
      var compile = function (err, data) {
        grunt.log.writelns('compile: %s %s', src, target);
        if (err) return grunt.log.error(err);
        if (!data) return grunt.log.error('No data');
        grunt.file.mkdir(targetDir);
        fs.writeFileSync(target, data);
      };

      var vendorModules = grunt.config.get('myConfig.vendor_modules') || [];
      vendorModules.forEach(function (vm) {
        grunt.log.writelns('Excluding module from application bundle: %s', vm);
        browserify1.exclude(vm);
      });

      browserify1.bundle(compile);

      browserify1.on('update', function () {
        browserify1.bundle(compile);
      });

      browserify1.on('log', function (msg) {
        grunt.log.oklns(msg);
      });

    })

  });
};