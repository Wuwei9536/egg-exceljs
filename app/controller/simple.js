'use strict';
/* eslint-disable*/
//一级表头适用
exports.excel = async ctx => {
    // 请求数据地址
    let url = 'https://www.easy-mock.com/mock/5c46cad124390d27ad616890/api-node/selectRateList';
    // 请求数据参数
    let param = {
        dataType: 'json',
        // data: {
        // }
    };

    // t:title k:key w:width  ==>表头
    let headers = [[
        { t: '姓名', k: 'userName', w: 20 },
        { t: '所属部门', k: 'deptName' },
        { t: '自评分', k: 'selfRate' },
        { t: 'learder评分', k: 'leaderRate' },
        { t: '绩效结果', k: 'rateResult' },
    ]];

    await ctx.helper.excelNew(url, param, headers, '绩效考核统计表', function (res) {
        //数据二次处理函数
    });
}

