var hexoFs = require('hexo-fs');
var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var open = require('open');

module.exports = function(args) {
  var sourceDir = this.source_dir;
  var searchDir = sourceDir;
  var editor = process.env.EDITOR;

  var title = args._.join(' ').replace(/ /g, '-') || '';
  var reTitle = new RegExp(title, 'i');

  var target = args.t || args.target || '';

  var gui = (args.g || args.gui || !editor) ? true : false;

  var joined;

  if (/post|draft/.test(target)) {
    target = (/^_/.test(target)) ? target : '_' + target;
    target = (/s$/.test(target)) ? target : target + 's';
  }

  joined = path.join(searchDir, target);

  hexoFs.exists(joined).then(function(exists) {
    if (exists) {
      fs.lstat(joined, function(err, stats) {
        if (err) {
          throw err;
        }

        searchDir = (stats.isDirectory()) ? joined : searchDir;
        processFiles();
      });
    } else {
      processFiles();
    }
  });

  function processFiles() {
    var selected;
    hexoFs.listDir(searchDir).then(function(files) {
      files = files.filter(function(file) {
        return file.substr(-3) == '.md' && reTitle.test(file);
      });

      if (files.length == 0) {
        console.log('Sorry, no files matched. Exiting.');
        process.exit();
      } else if (files.length == 1) {
        selected = path.join(searchDir, files[0]);
        openFile(selected);
      } else {
        inquirer.prompt([
          {
            type: 'list',
            name: 'file',
            message: 'Select the file you wish to edit.',
            choices: files,
          },
        ], function(answer) {
          selected = path.join(searchDir, answer.file);
          openFile(selected);
        });
      }
    });
  }

  function openFile(file) {
    if (!editor || gui) {
      open(file);
    } else {
      var edit = spawn(editor, [file], {stdio: 'inherit'});
      edit.on('exit', process.exit);
    }
  }
};
