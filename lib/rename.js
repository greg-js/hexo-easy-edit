var chalk = require('chalk');
var inquirer = require('inquirer');
var fs = require('fs');
var slugize = require('hexo-util').slugize;
var path = require('path');
var async = require('async');

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
      });

    });

    function renameFile(post) {
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
        var src = post.full_source;
        var newSrc = path.join(src.substr(0, src.lastIndexOf(path.sep)), slugize(newName, {transform: 1}));

        switch (ans) {
          case 'Yes, rename both':
            async.series([
              function(cb) {
                renameTitle(post, newName);
                cb(null);
              },
              function(cb) {
                renameFile(src, newSrc);
                cb(null);
              },
            ]);
            break;
          case 'Title only please (don\'t rename the file!)':
            renameTitle(post, newName);
            break;
          case 'Filename only please (don\'t rename the title!)':
            renameFile(src, newSrc);
            break;
          case 'No, forget it, cancel everything.':
            break;
        }

        return chalk.gray('Done.');

        function renameFile(src, newSrc) {
          Promise.resolve(fs.rename(src, newSrc + '.md')).then(function(done) {
            var fldr = src.substr(0, src.lastIndexOf('.'));
            if (fs.exists(fldr, function(err, ex) {
              return ex;
            })) {
              Promise.resolve(fs.rename(fldr, newSrc)).then(function(done) {
                console.log(chalk.underline('Asset folder renamed as well.'));
              });
            }

            console.log(chalk.red(src) + ' renamed to ' + chalk.green(newSrc) + '.md');
            return;
          });
        }

        function renameTitle(post, newTitle) {
          var oldTitle = post.title;
          var oldTitleString = new RegExp('title: ' + oldTitle);

          fs.readFile(post.full_source, 'utf8', function(err, data) {
            if (err) {
              throw err;
            }

            data = data.replace(oldTitleString, 'title: ' + newTitle);

            fs.writeFile(post.full_source, data, 'utf8', function(err) {
              if (err) {
                throw err;
              }

              console.log(chalk.red(oldTitle) + ' renamed to ' + chalk.green(newTitle));
              return;
            });
          });
        }
      });
    }

    function filterOnName(articles, terms) {
      return articles.filter(function(article) {
        return terms.every(function(term) {
          return term.test(article.title) || term.test(article.source);
        });
      });
    }
  }.bind(this));
};

