'use strict';

var open = require('open');
var editor = process.env.EDITOR;
var spawn = require('child_process').spawn;
var path = require('path');
var inquirer = require('inquirer');

hexo.extend.console.register('edit', 'Edit a post or draft with your favorite $EDITOR', {
  desc: 'Edit a post or draft with your favorite $EDITOR',
  usage: '[title] [-f|--folder] [-g|--gui]',
  arguments: [
    {name: 'title', desc: '(Part of) the title of a post. If more posts match this regex, a menu will be called.'},
  ],
  options: [
    {name: '-g, --gui', desc: 'Open file with associated GUI text editor. Default is to open in terminal using $EDITOR. If no $EDITOR is found, it will fall back to gui mode.'},
    {name: '-f, --folder', desc: 'Name of subfolder to filter on.'},
  ],
}, edit);

// extend `hexo new` to open newly created post/draft
hexo.on('new', function(post) {
  var edit;
  var content = post.content;

  // only open a new empty post -- prevent opening on publishing an already written one
  if (content.substr(content.indexOf('\n---\n')).length == 5) {
    if (!editor) {
      open(file);
    } else {
      edit = spawn(editor, [post.path], {stdio: 'inherit'});
      edit.on('exit', process.exit);
    }
  }
});

function edit(args) {

  // load in the posts before processing them
  hexo.load().then(function() {
    var posts = hexo.locals.get('posts').sort('-date').toArray();

    var sourceDir = hexo.source_dir;
    var searchDir = sourceDir;
    var editor = process.env.EDITOR;

    var title = args._.join(' ').replace(/ /g, '-') || '';
    var folder = args.f || args.folder || '';

    var gui = args.g || args.gui || !editor;

    var selected;
    var titles;

    // allow omission of leading underscore or trailing s for the common _drafts and _posts folders
    if (/post|draft/.test(folder)) {
      folder = (/^_/.test(folder)) ? folder : '_' + folder;
      folder = (/s$/.test(folder)) ? folder : folder + 's';
    }

    posts = (folder) ? filterFolder(posts) : posts;

    posts = (title) ? filterTitle(posts) : posts;

    if (posts.length == 0) {
      console.log('Sorry, no posts matched your query. Exiting.');
      process.exit();
    } else if (posts.length == 1) {

      // no menu necessary if there is only one matching file
      selected = path.join(searchDir, posts[0].source);
      openFile(selected);
    } else {

      // get a list of titles to put in the menu -- slugs are easy because it shows the subfolder and can easily be put back together with the searchDir to open it
      titles = posts.map(function(post) {
        return post.source;
      });

      inquirer.prompt([
        {
          type: 'list',
          name: 'file',
          message: 'Select the file you wish to edit.',
          choices: titles,
        },
      ], function(answer) {
        selected = path.join(sourceDir, answer.file);
        openFile(selected);
      });
    }

    // filter the posts using a subfolder if supplied
    function filterFolder(posts) {
      var reFolder = new RegExp(folder);
      return posts.filter(function(post) {
        return reFolder.test(post.source.substr(0, post.source.lastIndexOf(path.sep)));
      });
    }

    // filter the posts with the supplied regular expression -- uses the slug to avoid capitalization and spacing shenanigans
    function filterTitle(posts) {
      var reTitle = new RegExp(title, 'i');
      return posts.filter(function(post) {
        return reTitle.test(post.slug);
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

  });
};
