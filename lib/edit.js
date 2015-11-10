'use strict';

var chalk = require('chalk');
var moment = require('moment');
var open = require('open');
var editor = process.env.EDITOR;
var spawn = require('child_process').spawn;
var path = require('path');
var inquirer = require('inquirer');

module.exports = function(args) {

  var title = args._ || '';

  var after = args.a || args.after || '';
  after = after.replace(/\//g, '-');

  var before = args.b || args.before || '';
  before = before.replace(/\//g, '-');

  var cat = args.c || args.category || args.categories || '';
  var draft = args.d || args.draft || args.drafts || '';
  var folder = args.f || args.folder || '';
  var gui = args.g || args.gui || !editor;
  var page = args.p || args.page || args.pages || '';
  var tag = args.t || args.tag || '';

  // load in the posts before processing them
  this.load().then(function() {
    var sourceDir = this.source_dir;
    var searchDir = sourceDir;
    var editor = process.env.EDITOR;

    var selected;
    var entries;

    var query = (page) ? 'pages' : 'posts';

    Promise.resolve(this.locals.get(query).sort('-date').toArray()).then(function(posts) {
      console.log(query);
      var filtered = posts.slice();

      // allow omission of leading underscore or trailing s for the common _drafts and _posts folders
      if (/post|draft/.test(folder)) {
        folder = (/^_/.test(folder)) ? folder : '_' + folder;
        folder = (/s$/.test(folder)) ? folder : folder + 's';
      }

      filtered = (draft) ? filterDrafts(filtered) : filtered;

      filtered = (folder) ? filterFolder(filtered) : filtered;

      filtered = (title) ? filterTitle(filtered) : filtered;

      filtered = (tag) ? filterTag(filtered) : filtered;

      filtered = (cat) ? filterCategory(filtered) : filtered;

      filtered = (before) ? filterBefore(filtered) : filtered;

      filtered = (after) ? filterAfter(filtered) : filtered;

      if (filtered.length == 0) {
        console.log('Sorry, no filtered matched your query. Exiting.');
        process.exit();
      } else if (filtered.length == 1) {

        // no menu necessary if there is only one matching file
        selected = path.join(searchDir, filtered[0].source);
        openFile(selected);
      } else {

        // get a list of entries to put in the menu -- slugs are easy because it shows the subfolder and can easily be put back together with the searchDir to open it
        entries = filtered.map(function(post) {
          var entry = '';
          var folder = post.source.substr(0, post.source.lastIndexOf(path.sep));
          if (post.published || page) {
            entry = ['[', chalk.gray(post.date.format('MM-DD-YYYY')), '] ', post.title, ' (', chalk.green(folder), ')'].join('');
          } else {
            entry = ['[', chalk.yellow.bgBlack('draft'), '] ', post.title].join('');
          }

          return entry;
        });

        inquirer.prompt([
          {
            type: 'list',
            name: 'file',
            message: 'Select the file you wish to edit.',
            choices: entries,
          },
        ], function(answer) {
          var pos = entries.indexOf(answer.file);
          selected = path.join(sourceDir, filtered[pos].source);
          openFile(selected);
        });
      }

    });

    // filter the posts using a subfolder if supplied
    function filterFolder(posts) {
      var reFolder = new RegExp(folder);
      return posts.filter(function(post) {
        return reFolder.test(post.source.substr(0, post.source.lastIndexOf(path.sep)));
      });
    }

    // filter the posts using a tag if supplied
    function filterTag(posts) {
      var reTag = new RegExp(tag);
      return posts.filter(function(post) {
        return post.tags.data.some(function(postTag) {
          return reTag.test(postTag.name);
        });
      });
    }

    // filter the posts using a category if supplied
    function filterCategory(posts) {
      var reCat = new RegExp(cat);
      return posts.filter(function(post) {
        return post.categories.data.some(function(postCat) {
          return reCat.test(postCat.name);
        });
      });
    }

    // filter out all non-published posts
    function filterDrafts(posts) {
      return posts.filter(function(post) {
        return !post.published;
      });
    }

    // filter the posts using a before date if supplied
    // dates don't make much sense for drafts, so they will be excluded
    function filterBefore(posts) {
      before = moment(before, 'MM-DD-YYYY', true);
      if (!before.isValid()) {
        console.log(chalk.red('Before date is not valid (expecting `MM-DD-YYYY`), ignoring argument.'));
        return posts;
      }

      return posts.filter(function(post) {
        return (page || post.published) && moment(post.date).isBefore(before);
      });
    }

    // filter the posts using an after date if supplied
    function filterAfter(posts) {
      after = moment(after, 'MM-DD-YYYY', true);
      if (!after.isValid()) {
        console.log(chalk.red('After date is not valid (expecting `MM-DD-YYYY`), ignoring argument.'));
        return posts;
      }

      return posts.filter(function(post) {
        return post.published && moment(post.date).isAfter(after);
      });
    }

    // filter the posts with the supplied regular expression -- uses the slug to avoid capitalization and spacing shenanigans
    function filterTitle(posts) {
      var reTitle = title.map(function(word) {
        return new RegExp(word, 'i');
      });

      return posts.filter(function(post) {
        return reTitle.every(function(regex) {
          return regex.test(post.title);
        });
      });
    }

    // spawn process and open with associated gui or terminal editor
    function openFile(file) {
      if (!editor || gui) {
        open(file);
      } else {
        var edit = spawn(editor, [file], {stdio: 'inherit'});
        edit.on('exit', process.exit);
      }
    }
  }.bind(this));
};
