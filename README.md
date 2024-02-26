# crawler
Very simple in memory web crawler. Sequentially crawls internal links on page starting from base url. 

## Prerequisites

node >= 18 installed. 

## usage

1. clone repo.
2. install dependencies
```shell
$ npm install
```
3. build
```shell
$ npm run build
```
4. crawl web page
```shell
$ node ./dist/main.js <base-url>
```