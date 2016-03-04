How to build
==============

# 1. Preparation

## 1-1. Install npm

### [Ubuntu 14.04](http://releases.ubuntu.com/14.04/)

    # apt-get install nodejs npm

### [Ubuntu 12.04](http://releases.ubuntu.com/12.04/)

    # apt-add-repository ppa:chris-lea/node.js
    # apt-get update
    # apt-get install nodejs npm

### [Gentoo Linux](https://www.gentoo.org/)

    # USE="npm" emerge net-libs/nodejs

## 1-2. Install packages

    $ npm install

# 2. Build

    $ npm run build

That's it! Distribution files will be generated in `dist` directory.
