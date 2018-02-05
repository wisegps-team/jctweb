

// var express = require('express');
// var router = express.Router();

// home page
// router.get('/', function (req, res, next) {
//     res.render('fix_apply', { title: 'Account Information' });
// });

// exports.fix_apply = function (req, res) {
//     res.render('fix_apply')
// }

//获取车牌号码
exports.hphm = function (req, res) {
    var db = req.con;
    var query = req.query;
    var str = 'select * from ga_cart where depart = ' + query.depart;
    db.query(str, function (err, row) {
        console.log(err, row);
        res.json(row)
    })
}



//获取维修单位
exports.wxdw = function (req, res) {
    var db = req.con;
    var query = req.query;
    var str = 'select * from ga_factory where XLH > 0';
    db.query(str, function (err, rows) {
        console.log(err, rows);
        res.json(rows);
    })
}
//获取审核人
exports.getaudit = function (req, res) {
    var db = req.con;
    var query = req.query;
    console.log(query)
    var str = [];
    for (var o in query) {
        if (o != '__proto__') {
            str.push(query[o])
        }

    }
    console.log(str, 'dtrdd')
    var sql = 'select * from ga_user where depart in (' + str.join(',') + ')'
    console.log(sql)
    db.query(sql, function (err, result) {
        res.json(result)
    })
}
//获取状态码
exports.code_king = function (req, res) {
    var db = req.con;
    var query = req.query;
    var str = 'select * from code_enum where KIND >= 0';
    var str1 = 'select * from code_enum_kind where KIND >= 0';
    var code = {};
    db.query(str, function (err, rows) {
        code.enum = rows;
        db.query(str1, function (error, rowss) {
            code.enum_kind = rowss;
            res.json(code)
        })
    })
}


//获取修理信息
exports.get_repairinfo = function (req, res) {
    var db = req.con;
    var query = req.query;
    var str = 'select * from ga_repairinfo where ID >= 0 '
    db.query(str, function (err, rows) {
        res.json(rows)
    })
}



//添加详情
exports.add_apply2 = function (req, res) {
    var db = req.con;
    var query = req.query;
    var _option = query.data.option;
    // console.log(query)
    var spstatus_data = query.data.spstatus;
    var ga_repairinfo = query.data.repair_info.clmx_arr;
    // spstatus_data.forEach(ele => {console.log(ele)})
    var text = [];
    // var val = [];
    var val2 = [];
    for (var o in _option) {
        if (o != '__proto__') {
            text.push(o);
            val2.push(_option[o])
        }

    }
    var val_str = '';
    val2.forEach(ele => {
        val_str += '"' + ele + '",'
    })
    val_str = val_str.slice(0, -1);
    console.log(val_str)
    var str1 = 'INSERT INTO ga_apply2(' + text.join(',') + ') VALUES(' + val_str + ')';
    console.log(str1)
    db.query(str1, function (err, rows) {
        console.log(err, rows)
        var applyid = rows.insertId;
        // console.log(spstatus_data, 'dfd')
        // if (applyid) {
        // console.log(spstatus_data,'ddddddd')
        var i = 0;
        spstatus_data.forEach(ele => {
            if (ele) {
                var _cre_tm = ~~(new Date(_option.SQSJ).getTime() / 1000)
                var _sop = {
                    id: 0,
                    uid: ele.id,
                    apply2_id: applyid,
                    cre_tm: _cre_tm,
                    isagree: 0,
                    sp_status: 1
                }
                if (ele.role == "科所队领导") {
                    _sop.status = 1
                } else if (ele.role == '警务保障室领导') {
                    _sop.status = 2
                } else {
                    _sop.status = 3
                }
                var stext = [];
                // var val = [];
                var sval = [];
                for (var o in _sop) {
                    if (o != '__proto__') {
                        stext.push(o);
                        if (o == 'cre_tm') {
                            sval.push(parseInt(_sop[o]))
                        } else {
                            sval.push(_sop[o])
                        }
                    }
                }
                var sval_str = '';
                sval.forEach(ele => {
                    sval_str += '"' + ele + '",'
                })
                sval_str = sval_str.slice(0, -1);
                var sstr = 'INSERT INTO ga_spstatus(' + stext.join(',') + ') VALUES(' + sval_str + ')'
                // if()
                console.log(sstr)
                db.query(sstr, function (err, sres) {
                    i++;
                    console.log(sres, 'res')
                    if (i == spstatus_data.length) {
                        ga_repairinfo.forEach(ele => {
                            console.log(ele)
                            var reArr = Object.assign({}, ele, { XLH: applyid })
                            var stext1 = [];
                            var sval1 = [];
                            for (var o in reArr) {
                                if (o != '__proto__') {
                                    stext1.push(o);
                                    sval1.push(reArr[o])
                                }

                            }
                            var sval_str1 = '';
                            console.log(sval1, sval_str1, 'dfdf')
                            sval1.forEach(ele => {
                                sval_str1 += '"' + ele + '",'
                            })
                            sval_str1 = sval_str1.slice(0, -1);
                            var sstr1 = 'INSERT INTO ga_repairinfo(' + stext1.join(',') + ') VALUES(' + sval_str1 + ')'
                            // if()
                            console.log(sstr1)
                            db.query(sstr1, function (err1, sres1) {
                                console.log(sres, 'res')
                            })
                        })
                        res.json(applyid)
                    }
                })
            } else {
                i++;
                res.json(applyid)
            }

        })
    })
}



//获取详情
exports.get_apply2 = function (req, res) {
    var db = req.con;
    var query = req.query;
    var str = 'select a.*,b.* from (select * from ga_apply2 where XLH = ' + query.id + ' ) as a left join ga_depart as b on a.DEPT = b.id'
    // var str = 'select * from ga_apply2 where XLH = ' + query.id;
    var op_d = {};

    db.query(str, function (err, row1) {
        var str4 = 'select * from ga_user where depart = ' + row1[0].id
        op_d.apply2 = row1;
        var str2 = "select a.*,b.* from (select * ,ga_spstatus.id As sid,ga_spstatus.cre_tm As scre_tm,ga_spstatus.status As sstatus from ga_spstatus where apply2_id = " + query.id + ") as a left join ga_user as b on a.uid = b.id order by a.sstatus";
        // var str2 = 'select * from ga_spstatus where apply2_id = ' + query.id;
        console.log(err, row1)
        db.query(str2, function (err2, row2) {
            op_d.spstatus = row2;
            console.log(err2, row2)
            var str3 = 'select * from ga_repairinfo where XLH = ' + query.id;
            db.query(str3, function (err3, row3) {
                console.log(err3, row3)
                op_d.repair_info = row3;
                db.query(str4, function (err4, row4) {
                    op_d.user = row4;
                    res.json(op_d)
                })
            })
        })
    })
}

//撤销申请
exports.update_apply2 = function (req, res) {
    var db = req.con;
    var query = req.query;
    var str = ''
    for (var o in query) { if (o != '__proto__') { if (o != 'id' && o != 'sp_status') str += (o + ' ="' + query[o] + '",') } }
    str = str.slice(0, -1);
    console.log(str)
    var sql = 'update ga_apply2 set ' + str + ' where XLH = ' + query['id']
    console.log(sql);
    db.query(sql, function (err, row) {
        // console.log(err,row,'row')
        if (err) throw err
        if (query.sp_status) {
            var sql2 = 'update ga_spstatus set sp_status = ' + query.sp_status + ' where apply2_id =' + query['id'];
            db.query(sql2, function (error, spstatus) {
                res.json(row)
            })
        } else {
            res.json(row)
        }
    })
}
exports.update_apply2_spstatus = function (req, res) {
    var db = req.con;
    var query = JSON.parse(req.query.data);
    console.log(query)
    var str = 'update ga_apply2 set STATE = "' + query.STATE + '", DQLC = "' + query.DQLC + '", XGLC = "' + query.XGLC + '" where XLH = ' + query.id;
    var str1 = 'update ga_spstatus set isagree = ' + query.isagree + ' where id = ' + query.sid;
    var str3 = '';
    if (query.sp_status) {
        str3 = 'update ga_spstatus set sp_status = ' + query.sp_status + ' where apply2_id = ' + query.id;
    }
    var str2 = '';
    if (query.spstatus) {
        var sps = query.spstatus;
        var stext = [];
        // var val = [];
        var sval = [];
        for (var o in sps) {
            if (o != '__proto') {
                stext.push(o);
                if (o == 'cre_tm') {
                    sval.push(parseInt(sps[o]))
                } else {
                    sval.push(sps[o])
                }
            }


        }
        // console.log(stext, sval)
        var sval_str = '';
        sval.forEach(ele => {
            sval_str += '"' + ele + '",'
        })
        sval_str = sval_str.slice(0, -1);
        str2 = 'INSERT INTO ga_spstatus(' + stext.join(',') + ') VALUES(' + sval_str + ')'
    }

    db.query(str, function (err, row) {
        db.query(str1, function (err1, row1) {
            console.log(err1, row1, 'ff');
            if (query.spstatus) {
                console.log(true)
                db.query(str2, function (err2, row2) {
                    if (query.sp_status) {
                        db.query(str3, function (err3, row3) {
                            res.json(row2)
                        })
                    }else {
                        res.json(row2)
                    }

                })
            } else {
                // console.log(false, 'false')
                // res.json(row1)
                if (query.sp_status) {
                    db.query(str3, function (err3, row3) {
                        res.json(row1)
                    })
                }else {
                    res.json(row1)
                }
            }
        })
    })
}


