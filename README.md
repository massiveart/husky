# Husky - The wuff wuff framework

Husky is an awesome front-end framework.

## How to contribute like a boss

First install all necessary npm modules by running:

    npm install

Install [bower](http://bower.io)

    sudo npm install -g bower

And now install all dependencies:

    bower install

Install [Compass](http://compass-style.org/install/) with [animations](https://github.com/ericam/compass-animation):

    gem update --system
    gem install compass
    gem install animation --pre

### NPM Tasks

Build Husky

    npm run build

Compiling SCSS

    npm run watch:scss

Command to start an npm server, which returns data to the demos:

    npm run api

Command to run npm server for demos

    npm run serve

Running Tests

    npm run test

### Documentation

1. Install [jekyll](http://jekyllrb.com/)
2. cd into the Husky root directory and run jekyll serve in the command line.
3. Open http://localhost:9001 in your browser, and voilà.
