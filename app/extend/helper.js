/* eslint-disable*/
//simple
/**
   * 请求接口得到数据并生成excel
   *  支持数据自定义 func
   *  支持数据字典
   *  支持日期
   * @param {string} url 接口地址：相对地址或者http开头完整地址 
   * @param {object} param 请求数据参数
   * @param {Array} headers excel标题栏
   * @param {string} name 文件名称
   * @param {function} func 数据自定义函数
   */

//complex
/**
* 请求接口得到数据并生成excel
*  支持复杂表头（m1:合并单元格左上坐标；m2:合并单元格右下坐标）
*  支持合计行  totalRowText totalRow
*  支持数据自定义 func
*  支持数据字典
*  支持日期
*/

const Excel = require('exceljs');
module.exports = {
    //simple
    async excelNew(url, param, headers, name, func) {
        let columns = [];//exceljs要求的columns
        let titleRows = headers.length;//标题栏行数

        //处理表头
        for (let i = 0; i < titleRows; i++) {
            let row = headers[i];
            for (let j = 0, rlen = row.length; j < rlen; j++) {
                let col = row[j];
                let { k, t, w = 15 } = col;
                if (!k) continue;//不存在k则跳过
                col.style = { alignment: { vertical: 'middle', horizontal: 'center' } };
                col.header = t;
                col.key = k;
                col.width = w;
                columns.push(col);
            }
        }

        //请求并处理数据
        let result = await this.ctx.curl(url, param);
        //   if(func) result = func(result);

        //生成excel  这一部门语法需看下exceljs
        let workbook = new Excel.Workbook();
        let sheet = workbook.addWorksheet('绩效考核统计表', { views: [{ xSplit: 1, ySplit: 1 }] });
        sheet.columns = columns;
        sheet.addRows(result.data.data)

        //处理样式、日期、字典项
        let that = this;
        sheet.eachRow(function (row, rowNumber) {
            //设置行高
            row.height = 25;

            row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
                //设置边框 黑色 细实线
                let top = left = bottom = right = { style: 'thin', color: { argb: '000000' } };
                cell.border = { top, left, bottom, right };

                //设置标题部分为粗体
                if (rowNumber <= titleRows) { cell.font = { bold: true }; return; }

                //处理数据项里面的日期和字典
                let { type, dict } = columns[colNumber - 1];
                if (type && (cell.value || cell.value == 0)) return;//非日期、字典或值为空的直接返回
                switch (type) {
                    case 'date': cell.value = that.parseDate(cell.value); break;
                    case 'dict': cell.value = that.parseDict(cell.value.toString(), dict); break;
                }

            });
        });

        this.ctx.set('Content-Type', 'application/vnd.openxmlformats');
        this.ctx.set('Content-Disposition', "attachment;filename*=UTF-8' '" + encodeURIComponent(name) + '.xlsx');
        this.ctx.body = await workbook.xlsx.writeBuffer();
    },

// ------------------------------------------------------------------------------------------------------------------------

    //complex
    async excelNewComplex(url, req, headers, name, func) {
        let columns = [];//exceljs要求的columns
        let hjRow = {};//合计行
        let titleRows = headers.length;//标题栏行数

        //处理表头
        for (let i = 0; i < titleRows; i++) {
            let row = headers[i];
            for (let j = 0, rlen = row.length; j < rlen; j++) {
                let col = row[j];
                let { f, t, w = 15 } = col;
                if (!f) continue;//不存在f则跳过

                if (col.totalRow) hjRow[f] = true;
                if (col.totalRowText) hjRow[f] = col.totalRowText;
                col.style = { alignment: { vertical: 'middle', horizontal: 'center' } };
                col.header = t;
                col.key = f;
                col.width = w;
                columns.push(col);
            }
        }

        // const result = await this.post(url, req);//请求数据
        // let result = await this.ctx.curl(url);
        // let data = result.data;
        // if (func) data = func(data);
        let data={"data":[]}    //需要在这边自己适配数据，这边为空

        //处理合计行
        if (JSON.stringify(hjRow) != "{}") {
            let tr = {};
            for (let i = 0, len = data.data.length; i < len; i++) {
                let item = data.data[i];
                for (let key in item) {
                    if (hjRow[key] === true) {
                        tr[key] = (tr[key] || 0) + item[key];
                        continue;
                    }
                    tr[key] = hjRow[key] || '';
                }
            }
            data.data.push(tr);
        }

        let workbook = new Excel.Workbook();
        let sheet = workbook.addWorksheet('My Sheet', { views: [{ xSplit: 1, ySplit: 1 }] });
        sheet.columns = columns;
        sheet.addRows(data.data);

        //处理复杂表头
        if (titleRows > 1) {
            for (let i = 1; i < titleRows; i++)  sheet.spliceRows(1, 0, []);//头部插入空行

            for (let i = 0; i < titleRows; i++) {
                let row = headers[i];
                for (let j = 0, rlen = row.length; j < rlen; j++) {
                    let col = row[j];
                    if (!col.m1) continue;

                    sheet.getCell(col.m1).value = col.t;
                    sheet.mergeCells(col.m1 + ":" + col.m2);
                }
            }
        }

        //处理样式、日期、字典项
        let that = this;
        sheet.eachRow(function (row, rowNumber) {
            //设置行高
            row.height = 25;

            row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
                //设置边框 黑色 细实线
                let top = left = bottom = right = { style: 'thin', color: { argb: '000000' } };
                cell.border = { top, left, bottom, right };

                //设置标题部分为粗体
                if (rowNumber <= titleRows) { cell.font = { bold: true }; return; }

                //处理数据项里面的日期和字典
                let { type, dict } = columns[colNumber - 1];
                if (type && (cell.value || cell.value == 0)) return;//非日期、字典或值为空的直接返回
                switch (type) {
                    case 'date': cell.value = that.parseDate(cell.value); break;
                    case 'dict': cell.value = that.parseDict(cell.value.toString(), dict); break;
                }

            });
        });

        this.ctx.set('Content-Type', 'application/vnd.openxmlformats');
        this.ctx.set('Content-Disposition', "attachment;filename*=UTF-8' '" + encodeURIComponent(name) + '.xlsx');
        this.ctx.body = await workbook.xlsx.writeBuffer();
    }
};

