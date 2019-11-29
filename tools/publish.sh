git config --local user.name "huangshan"
git config --local user.email "shan@arcblock.io"

git remote remove origin
git remote add origin "https://$GITHUB_TOKEN@github.com/$TRAVIS_REPO_SLUG.git"
git remote -v
git pull origin master
git checkout master
git branch -a

DEBUG=* node tools/setup-ci.js

npm publish

# trigger cnpm sync
curl -X PUT https://npm.taobao.org/sync/forge-java-starter?sync_upstream=true
