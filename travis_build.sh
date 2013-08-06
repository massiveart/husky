#!/bin/bash

set -xe

npm install -g grunt-cli

echo ">>> grunt exited with code: $?"
echo ""

npm install -g bower
echo ">>> bower exited with code: $?"
echo ""

bower install

grunt travis
