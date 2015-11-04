# hexo-easy-edit

This is a simple plugin for [Hexo](https://github.com/hexojs/hexo), a Node.js-based static site generator/blog framework.

It adds one command to the Hexo command-line interface (only usable when you are somewhere inside a hexo folder):

```
hexo edit [title] [-t | --target subfolder] [-g | --gui]
```

`title` is a regular expression (case insensitive and spaces are allowed) for matching the title of a markdown file somewhere in `hexo_dir/source`

`target` (optional) is the name of a subfolder in `hexo_dir/source` to narrow down your search some more. If the folder isn't found, this argument will be ignored.

`-g` or `--gui` is an option to open files using an associated GUI editor, rather than your terminal editor set in $EDITOR

## Installation

```
npm install --save hexo-easy-edit
```

## Notes

- It doesn't matter where in the hexo directory you are. As long as you're in one, the plugin will find the source dir
- The common folders `_posts` and `_drafts` are also recognized as `posts`, `post` and `_post`, and `drafts`, `draft` and `_draft`
- If your regular expression matches more than one file, a terminal menu will load so you can choose. Use the arrow keys or vim keybindings (j/k) to pick a file. This might not work as expected in the default Windows command shell, but it should fine in more powerfull shells
- By default, a file will open in your current terminal window, using whatever you've set as the global `$EDITOR` variable (you can set it in `.bashrc` or `.zshrc` if it's empty, don't forget to source the file before testing)
- With the `gui` option set (or if you don't have an `$EDITOR` set), the file will open with `xdg-open` (linux, osx) or `start` (win)
- A simple `hexo edit` will give you a menu with all your posts
- All spaces in your `title` will be treated as dashes, just like Hexo does
- This is useful primarily for myself, but might come in handy for others using Hexo who prefer to edit markdown files in their favorite local editor. Alternatively, you can use an administration plugin - check out [hexo-admin](https://github.com/jaredly/hexo-admin) or [hexo-hey](https://github.com/nihgwu/hexo-hey) if that's more up your alley
