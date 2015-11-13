'use strict';

require('./lib/extensions')(hexo);

hexo.extend.console.register('edit', 'Edit a post or draft with your favorite $EDITOR', {
  desc: 'Edit a post or draft with your favorite $EDITOR',
  usage: '[title] [-a | --after MM-DD-YYYY] [-b | --before MM-DD-YYYY] [-c | --category CATEGORY] [-d | --draft | --drafts] [-f | --folder FOLDER] [-g | --gui] [-l | --layout LAYOUT] [-p | --page | --pages] [-t | --tag | --tags TAG]',
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
    {name: '-l, --layout', desc: 'Only consider posts with a given layout'},
    {name: '-p, --page, --pages', desc: 'Only consider pages'},
    {name: '-t, --tag, --tags', desc: 'Tag to filter on.'},
  ],
}, require('./lib/edit'));

hexo.extend.console.register('rename', 'Rename a post or draft', {
  desc: 'Rename a post or draft. Search for a post and set a new name with the -n or --new option, followed by the new title wrapped in single or double quotes',
  usage: '<old name> <-n | --new new name>',
  arguments: [
    {name: '-n, --new', desc: '(required) The new title. Wrap in single or double quotes if the title includes spaces.'},
  ],
}, require('./lib/rename'));

hexo.extend.console.register('remove', 'Remove a post or draft', {
  desc: 'Search for a post or draft and remove it.',
  usage: '<search terms for a post to be deleted>',
}, require('./lib/remove'));
