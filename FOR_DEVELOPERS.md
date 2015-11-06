For Developers
==============

---

## How to build

### 1. Preparation

#### 1-1. Install npm

in [Ubuntu](http://www.ubuntu.com/) 14.04,

    # apt-get install nodejs npm

in [Ubuntu](http://www.ubuntu.com/) 12.04,

    # apt-add-repository ppa:chris-lea/node.js
    # apt-get update
    # apt-get install nodejs npm

in [Gentoo Linux](https://www.gentoo.org/),

    # USE="npm" emerge net-libs/nodejs

#### 1-2. Install gulp

    # npm install -g gulp

#### 1-3. Install packages

    $ npm install

### 2. Build

#### 2-1. Run gulp

    $ gulp

That's it! Now following distribution files are generated.
* `cazary.min.js`
* `cazary-legacy.min.js`
* `themes/flat/style.css`

---

## How to translate

### 1. Create YAML file

Language files are in `src/i18n` directory.
If you translate cazary, put it in this directory as `[language].yaml`.

Format is very simple, so you will be able to create easily with no explanation.

### 2. Build with gulp

Build distribution files by `gulp` as above.
Language data will be embedded in `cazary.min.js` automatically.
