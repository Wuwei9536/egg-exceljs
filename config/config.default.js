'use strict';
// const path = require('path');
module.exports = appInfo => {
  const config = exports = {};

  config.view = {
    // root: [
    //   path.join(appInfo.baseDir, 'app/view'),
    // ].join(','),
    defaultViewEngine: 'nunjucks',
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1548729941824_4568';

  // add your config here
  config.middleware = [];

  return config;
};
