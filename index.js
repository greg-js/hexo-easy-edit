'use strict';

require('./lib/extensions')(hexo);

hexo.extend.console.register('edit', 'Edit a post or draft with your favorite $EDITOR', {
  desc: 'Edit a post or draft with your favorite $EDITOR',
  usage: '[title] [-a | --after MM-DD-YYYY] [-b | --before MM-DD-YYYY] [-c | --category CATEGORY] [-d | --draft | --drafts] [-f | --folder FOLDER] [-g | --gui] [-p | --page | --pages] [-t | --tag | --tags TAG]',
  arguments: [
    {name: 'title', desc: '(Part of) the title of a post. If more posts match this regex, a menu will be called.'},
  ],
  options: [
    {name: '-a, --after', desc: 'Only consider posts after this date (MM-DD-YYYY)'},
    {name: '-b, --before', desc: 'Only consider posts before this date (MM-DD-YYYY)'},
    {name: '-c, --category, --categories', desc: 'Category to filter on.'},
    {name: '-d, --draft, --drafts', desc: 'Only consider drafts'},
    {name: '-f, --folder', desc: 'Name of subfolder to filter on.'},
    {name: '-g, --gui', desc: 'Open file with associated GUI text editor. Default is to open in terminal using $EDITOR. If no $EDITOR is found, it will fall back to gui mode.'},
    {name: '-p, --page, --pages', desc: 'Edit pages instead of posts'},
    {name: '-t, --tag, --tags', desc: 'Tag to filter on.'},
  ],
}, require('./lib/edit'));

hexo.extend.console.register('rename', 'Rename a post or draft', {
  desc: 'Rename a post or draft. Both post title and filename (and asset folder) will be renamed by default. Wrap in ',
  usage: '<old name> <-n | --new new name>',
  arguments: [
    {name: '-n, --new', desc: '(required) The new title. Wrap in single or double quotes if the title includes spaces.'},
  ],
}, require('./lib/rename'));
