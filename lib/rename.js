var Promise = require('bluebird');
var chalk = require('chalk');
var inquirer = require('inquirer');
var fsReadFile = Promise.promisify(require('fs').readFile);
var fsStat = Promise.promisify(require('fs').stat);
var fsWriteFile = Promise.promisify(require('fs').writeFile);
var fsRename = Promise.promisify(require('fs').rename);
var slugize = require('hexo-util').slugize;
var path = require('path');

module.exports = function(args) {
  var oldName;
  var newName = args.n || args.new || '';

  if (!args._.join('') || !newName) {
    console.log(chalk.red('Both a new and an old filename/title are required. `hexo rename help` to display help.'));
    process.exit();
  } else {
    oldName = args._.map(function(arg) {
      return new RegExp(arg, 'i');
    });
  }

  this.load().then(function() {
    var locals = this.locals;

    Promise.resolve(locals.get('posts').toArray().concat(locals.get('pages').toArray())).then(function(articles) {
      var getSelected = new Promise(function(resolve, reject) {

        articles = filterOnName(articles, oldName);
        var entries;

        if (articles.length == 0) {
          return reject(chalk.red('No posts or pages found using your query.'));
          process.exit();
        } else if (articles.length == 1) {
          return resolve(articles[0]);
        } else {

          entries = articles.map(function(article) {
            return [article.title, ' (', chalk.green(article.source), ')'].join('');
          });

          inquirer.prompt([
            {
              type: 'list',
              name: 'selected',
              message: 'Select the post or page you wish to rename.',
              choices: entries,
            },
          ], function(answer) {
            var pos = entries.indexOf(answer.selected);
            return resolve(articles[pos]);
          });
        }

      });

      getSelected.then(function(selected) {
        renameFile(selected);
      }).catch(function(e) {
        console.log(e);
        process.exit();
      });

    });

    function renameFile(post) {
      var origSrc = post.full_source;
      var message = '\n - Rename title (' + chalk.green.underline(post.title) + ') to ' + chalk.cyan.underline(newName) + ' ?\n - Rename filename (' + chalk.green.underline(post.source.substr(post.source.lastIndexOf(path.sep))) + ') to ' + chalk.cyan.underline(slugize(newName, {transform: 1}) + '.md') + ' ?';
      inquirer.prompt([
        {
          type: 'list',
          message: message,
          name: 'answer',
          choices: [
            'Yes, rename both',
            'Title only please (don\'t rename the file!)',
            'Filename only please (don\'t rename the title!)',
            'No, forget it, cancel everything.',
          ],
        },
      ], function(response) {
        var ans = response.answer;

        switch (ans) {
          case 'Yes, rename both':
            renameBoth(post, newName);
            break;
          case 'Title only please (don\'t rename the file!)':
            renameTitle(post, newName);
            break;
          case 'Filename only please (don\'t rename the title!)':
            renameFile(post);
            break;
          case 'No, forget it, cancel everything.':
            break;
        }

        return chalk.gray('Done.');

        function renameBoth(post, newName) {
          renameTitle(post, newName, renameFile);
        }

        function renameFile(post) {

          var src = post.full_source;
          var newSrc = path.join(src.substr(0, src.lastIndexOf(path.sep)), slugize(newName, {transform: 1}));

          fsRename(src, newSrc + '.md').then(function(done) {
            var fldr;

            console.log(chalk.red(src) + ' renamed to ' + chalk.green(newSrc) + '.md');

            fldr = src.substr(0, src.lastIndexOf('.'));

            fsStat(fldr).then(function(stats) {
              if (stats.isDirectory()) {
                fsRename(fldr, newSrc).then(function(done) {
                  console.log(chalk.underline('Asset folder renamed as well.'));
                });
              }
            });
          });

        }

        function renameTitle(post, newTitle, cb) {
          var oldTitle = post.title;
          var oldTitleString = new RegExp('title: ' + oldTitle);

          fsReadFile(post.full_source, 'utf8').then(function(data) {
            data = data.replace(oldTitleString, 'title: ' + newTitle);

            fsWriteFile(post.full_source, data, 'utf8').then(function() {
              console.log(chalk.red(oldTitle) + ' renamed to ' + chalk.green(newTitle));
              if (cb) {
                cb.call(null, post);
              };
            });
          });
        }

      });
    }

    function filterOnName(articles, terms) {
      return articles.filter(function(article) {
        return terms.every(function(term) {
          return term.test(article.title) || term.test(article.slug);
        });
      });
    }

  }.bind(this));
};

