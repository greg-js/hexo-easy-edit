'use strict';

var open = require('open');
var editor = process.env.EDITOR;
var spawn = require('child_process').spawn;

hexo.extend.console.register('edit', 'Edit a post or draft with your favorite $EDITOR', {
  desc: 'Edit a post or draft with your favorite $EDITOR',
  usage: '<title> [type]',
  arguments: [
    {name: 'type',  desc: '[optional] Name of source subfolder to search. Will search entire source folder if no matching folder is found. Neither the leading \'_\' or the trailing \'s\' is required for specifying the _posts or _drafts folder.'},
    {name: 'title', desc: '[required] (Part of) the title of a post. If more posts match this regex, a menu will be called.'},
  ],
  options: [
    {name: '-g, --gui', desc: 'Open file with associated GUI text editor. Default is to open in terminal using $EDITOR.'},
  ],
}, require('./edit'));

hexo.on('new', function(post) {
  if (!editor) {
    open(file);
  } else {
    var edit = spawn(editor, [post], {stdio: 'inherit'});
    edit.on('exit', process.exit);
  }
});
