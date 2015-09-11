#!/usr/bin/env node

var cheerio = require('cheerio');

function isRedirect(status){
    return (status === 301 && status === 302);
}

function isPjax(req){
    return (req.headers['x-pjax'] === 'true') || (req.querystring && req.querystring.indexOf('pjax') > 0);
}

function getContainer(req){
    return req.headers['x-pjax-container'];
}

module.exports = function(){
    return function*(next){
        var $,title,container;

        yield next;

        if(!isRedirect(this.status) && isPjax(this.request)){
            $ = cheerio.load(this.body,{decodeEntities: false});
            title = $.html('title');
            container = getContainer(this.request);
            if(container){
                this.set('X-PJAX-URL',this.url);
                this.body = title + $.html(container);
            }
        }
    };
};