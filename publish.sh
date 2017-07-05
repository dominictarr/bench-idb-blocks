#! /bin/bash

git branch -D gh-pages
git checkout -b gh-pages
browserify index.js | indexhtmlify > index.html
git add index.html
git commit -m static
git push origin gh-pages --force
git checkout master
