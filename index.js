'use strict';

require('./lib/extensions')(hexo);

hexo.extend.console.register('edit', 'Edit a post or draft with your favorite $EDITOR', {
  desc: 'Edit a post or draft with your favorite $EDITOR',
  usage: '[title] [-f | --folder] [-g | --gui]',
  arguments: [
    {name: 'title', desc: '(Part of) the title of a post. If more posts match this regex, a menu will be called.'},
  ],
  options: [
    {name: '-a, --after', desc: 'Only consider posts after this date (MM-DD-YYYY)'},
    {name: '-b, --before', desc: 'Only consider posts before this date (MM-DD-YYYY)'},
    {name: '-c, --category', desc: 'Category to filter on.'},
    {name: '-d, --draft', desc: 'Only consider drafts'},
    {name: '-f, --folder', desc: 'Name of subfolder to filter on.'},
    {name: '-g, --gui', desc: 'Open file with associated GUI text editor. Default is to open in terminal using $EDITOR. If no $EDITOR is found, it will fall back to gui mode.'},
    {name: '-t, --tag', desc: 'Tag to filter on.'},
  ],
}, require('./lib/edit'));

hexo.extend.console.register('rename', 'Rename a post or draft', {
  desc: 'Rename a post or draft. Both post title and filename (and asset folder) will be renamed by default. Wrap in ',
  usage: '<old name> <-n | --new new name> [-t | --title-only | -f | --filename-only]',
  arguments: [
    {name: '-n, --new', desc: '(required) The new name. Wrap in single or double quotes if the name includes spaces.'},
    {name: '-t --title-only', desc: '(optional boolean) Only change the post title (not the filename)'},
    {name: '-f --filename-only', desc: '(optional boolean) Only change the filename and the asset folder if it exists (not the post title)'},
  ],
}, require('./lib/rename'));
