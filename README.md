# hexo-easy-edit

This is a simple plugin for [Hexo](https://github.com/hexojs/hexo), a Node.js-based static site generator/blog framework.

It adds one command to the Hexo command-line interface (only usable when you are somewhere inside a hexo folder):

```
hexo edit [title] [-a | --after MM-DD-YYYY] [-b | --before MM-DD-YYYY] [-c | --category | --categories CATEGORY] [-d | --draft | --drafts] [-f | --folder SUBFOLDER] [-g | --gui] [-p | --page | --pages] [-t | --tag | --tags TAG]
```

`title` is a regular expression (case insensitive and spaces are allowed) for matching the title of a post

`-a` or `--after` (optional) lets you filter out all posts that were made before the given date. A little parsing is done to help you, but use `MM-DD-YYYY` for best results

`-b` or `--before` (optional) lets you filter out all posts that were made after the given date. A little parsing is done to help you, but use `MM-DD-YYYY` for best results

`-c` or `--category` (optional) allows you to filter your posts on category

`-d` or `--draft` (optional) lets you exclude all published posts

`-f` or `--folder` (optional) is (part of) the name of a subfolder in `hexo_dir/source` to narrow down your search if you have multiple post folders (for filtering on drafts, prefer to use `-d`)

`-g` or `--gui` (optional) is an option to open files using an associated GUI editor, rather than your terminal editor set in $EDITOR

`-p` or `--page` (optional) selects pages instead of posts

`-t` or `--tag` (optional) allows you to filter your posts on tag

Installing this will also cause any new post you create with `hexo new ...` to open automatically in your text editor.

## Installation

```
npm install --save hexo-easy-edit
```

## Notes

- It doesn't matter where in the hexo directory you are. As long as you're in one, your posts will be found

- If you filter on title, put it first in your query. Because of the way the arguments are parsed, you may get unexpected results otherwise if you also use one of the boolean arguments. For example, `hexo edit -d my draft` will return drafts and filter on "draft" whereas `hexo edit my draft -d` will correctly filter on the regular expression "my draft"

- If your regular expression matches more than one file, a terminal menu will load so you can choose. Use the arrow keys or vim keybindings (j/k) to pick a file. This, as well as the colors, might not work as expected in the default Windows command shell (`cmd.exe`), but it should be fine in more powerfull shells

- When you use either of the two date filters, all drafts will also be excluded because the date field makes little sense for a draft and you likely don't want to see them in the results

- By default, a file will open in your current terminal window, using whatever you've set as the global `$EDITOR` variable (you can set it in `.bashrc` or `.zshrc` if it's empty, don't forget to source the file before testing)

- With the `gui` option set (or if you don't have an `$EDITOR` set), the file will open with `xdg-open` (linux, osx) or `start` (win)

- A simple `hexo edit` will give you a menu with all your posts

- All spaces in your `title` will be treated as dashes, just like Hexo does

- This is useful primarily for myself, but might come in handy for others using Hexo who prefer to edit markdown files in their favorite local editor. Alternatively, you can use an administration plugin - check out [hexo-admin](https://github.com/jaredly/hexo-admin) or [hexo-hey](https://github.com/nihgwu/hexo-hey) if that's more up your alley
