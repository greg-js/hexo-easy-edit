'use strict';

var Promise = require('bluebird');
var chalk = require('chalk');
var inquirer = require('inquirer');
var fsStat = Promise.promisify(require('fs').stat);
var fsRename = Promise.promisify(require('fs').rename);
var fsMkdir = Promise.promisify(require('fs').mkdir);
var path = require('path');

module.exports = function modExports(args) {
  var doWholeFolder = !!args.a || !!args.all;
  var searchTerms = '';

  if (!doWholeFolder) {
    searchTerms = args._.map(function makeRE(arg) {
      return new RegExp(arg, 'i');
    });
  }

  this.load().then(function loadDB() {

    var locals = this.locals;
    var exileDir = path.join(this.source_dir, '_posts', '_exile');

    Promise.resolve(isDir(exileDir)).then(function checkExileDir(exists) {
      if (!exists) {
        makeDir(exileDir);
      }
    }).then(function splitPosts() {
      Promise.resolve(locals.get('posts').sort('-date').toArray()).then(function getArticles(arts) {
        var isolated;
        var entries;

        var articlesToStash = arts.map(function mapSource(art) {
          return art.full_source;
        });

        isolated = filterOnName(arts, searchTerms);

        if (isolated.length === 0) {
          console.log(chalk.red('No posts matched. Exiting.'));
          process.exit();
        } else if (isolated.length === 1) {
          doIsolate(isolated[0].full_source, articlesToStash);
        } else {
          entries = isolated.map(function mapTitles(article) {
            return [article.title, ' (', chalk.green(article.updated.format('YYYY-MM-DD')), ')'].join('');
          });

          inquirer.prompt([
            {
              type: 'list',
              name: 'selected',
              message: 'Select the post you want to isolate.',
              choices: entries,
            },
          ], function getAnswer(answer) {
            var pos = entries.indexOf(answer.selected);
            doIsolate(isolated[pos].full_source, articlesToStash);
          });
        }
      });
    });

    function doIsolate(isolated, toStash) {
      var articlesToStash = toStash.filter(function filterOutIsolated(art) {
        return art !== isolated;
      });
      var newName;

      var movePromises = articlesToStash.map(function makePromise(article) {
        newName = path.join(exileDir, article.substr(article.lastIndexOf(path.sep)));
        return new Promise(function returnPromise(resolve) {
          resolve(move(article, newName));
        });
      });

      Promise.all(movePromises).then(function allDone() {
        console.log('%s has been successfully isolated.\n`hexo integrate` to restore the posts.', isolated);
      });
    }

    function move(origin, destination) {
      return fsRename(origin, destination).then(function doMove() {
        // console.log('%s moved to %s', origin, destination);
      }).catch(function catchMove(err) {
        console.log('%s could not be moved to %s: %s', origin, destination, err);
      });
    }

    function filterOnName(arts, terms) {
      return arts.filter(function filterArts(article) {
        return terms.every(function testRE(term) {
          return term.test(article.title) || term.test(article.slug);
        });
      });
    }

    function isDir(dir) {
      return fsStat(dir).then(function doCheckDir(stats) {
        if (stats.isFile()) {
          console.log(chalk.gray(dir), 'seems to be a file on your filesystem! It needs to be either non-existent or a directory, so please rename your _exile post before using this command.');
          process.exit();
        }
        return true;
      }).catch(function catchCheckDir() {
        // The directory doesn't exist (which is not a bad thing)
        return false;
      });
    }

    function makeDir(dir) {
      return fsMkdir(dir).then(function doMakeDir() {
        console.log(chalk.gray(dir), 'created');
      }).catch(function catchMakeDir(err) {
        console.log(chalk.gray(dir), 'could not be created: ', chalk.red(err));
      });
    }
  }.bind(this));
};

