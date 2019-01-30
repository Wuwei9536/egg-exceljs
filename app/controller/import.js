'use strict';
/* eslint-disable*/
const Controller = require('egg').Controller;
const Excel = require('exceljs');
// const fs = require('fs');
// const path = require('path');

class submitController extends Controller {
    //适用于简单表格的导入，所以一般导入要先下载固定格式的excel表格才能正确解析
    async index() {
        const { ctx } = this;
        const file = ctx.request.files[0];

        // fs.exists(path.resolve(__dirname, '../public/绩效考核统计表 (1).xlsx') //绝对路径
        //     , (exists) => {
        //         console.log(exists ? 'it\'s there' : 'no passwd!');
        //     });

        let dataArray = [];//最后得到的Json对象数组
        let workbook = new Excel.Workbook();
        await workbook.xlsx.readFile(file.filepath) //绝对路径
            .then(function () {
                let worksheet = workbook.getWorksheet(1);
                dataArray = changeRowsToDict(worksheet);
                console.log(JSON.stringify(dataArray));
                ctx.body = dataArray;
                // console.log('异步');
            });

        // console.log('同步');

        /* 将所有的行数据转换为json */
        function changeRowsToDict(worksheet) {
            let dataArray = [];
            let keys = [];
            worksheet.eachRow(function (row, rowNumber) {
                if (rowNumber == 1) {
                    keys = row.values;
                }
                else {
                    // method1  ===============
                    // let rowDict = cellValueToDict(keys, row.values);
                    // dataArray.push(rowDict);
                    // method2  ===============
                    let rowDict = cellValueToDict2(keys, row);
                    dataArray.push(rowDict);
                }
            });
            return dataArray;
        }

        /* keys: {id,name,phone}, rowValue：每一行的值数组, 执行次数3次 */
        function cellValueToDict(keys, rowValue) {
            let rowDict = {};
            keys.forEach((value, index) => {
                rowDict[value] = rowValue[index];
            });
            return rowDict;
        }

        /* keys: {id,name,phone}, rowValue：每一行的值数组， 执行次数3次 */
        function cellValueToDict2(keys, row) {
            let data = {};
            row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
                let value = cell.value;
                // if (typeof value == "object") value = value.text;
                data[keys[colNumber]] = value;
            });
            return data;
        }
    }
}

module.exports = submitController;
