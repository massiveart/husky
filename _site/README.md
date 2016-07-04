# Husky - The wuff wuff framework [![Build Status](https://api.travis-ci.org/massiveart/husky.png?branch=develop)](http://travis-ci.org/massiveart/husky)

Husky is an awesome front-end framework.

## Read the documentation

[Documentation](https://github.com/massiveart/husky/tree/develop/docs/md/README.md)

## How to contribute like a boss

First install all necessary npm modules by running:

    npm install

Install [grunt-cli](http://gruntjs.com/getting-started#installing-the-cli)

    sudo npm install -g grunt-cli

Install [bower](http://bower.io)

    sudo npm install -g bower

And now install all dependencies:

    bower install
	
Install [Compass](http://compass-style.org/install/) with [animations](https://github.com/ericam/compass-animation):

	
    gem update --system
    gem install compass
    gem install animation --pre
    
Command to start an npm server, which returns data to the demos:

    apimocker --config apimocker_config.json

### Grunt Tasks

Build Husky

    grunt build

Running Tests

    grunt test

Compiling SCSS

    grunt watch


### Documentation

1. Install [jekyll](http://jekyllrb.com/)
2. cd into the Husky root directory and run jekyll serve in the command line.
3. Open http://localhost:9001 in your browser, and voilà.
