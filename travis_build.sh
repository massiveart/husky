#!/bin/bash

set -xe

npm install -g grunt-cli

echo ">>> grunt exited with code: $?"
echo ""

grunt travis
