# pastek.js

pastek.js is a JS port of [pastek][org], a lightweight markdown-like markup
language, using [js\_of\_ocaml][jsofo].

## Building

You need [pastek/core][core] in order to build `pastek.js`.

```
git clone https://github.com/pastek-project/pastek.js.git # clone this repo
git clone https://github.com/pastek-project/core.git      # clone the core
make CORE_DIR=../../core -C src                           # make both
mv src/pastek.js .                                        # copy the main file
```

If you already have pastek/core and a local clone of this repo, just `cd` into
`src`, and use `make CORE_DIR=xxx`, where `xxx` is a path the the core main
directory.

## Live Editor

A live editor based on `pastek.js` is available [online][liveeditor].

### Features

* Instant preview
* Autosaving in your browser
* 'Save As' button to get the file on your computer

[org]: https://github.com/pastek-project
[core]: https://github.com/pastek-project/core
[liveeditor]: http://www.pastek-project.org/pastek.js
[jsofo]: http://ocsigen.org/js_of_ocaml/
