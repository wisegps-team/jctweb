$(document).ready(function () {

    beta122()
    function beta122() {

        var _g = W.getSearch();
        var _user = JSON.parse(sessionStorage.getItem('user'));
        debugger;
        W.setCookie('types', _g.type || '')
        // W.setCookie('pagenum', _g.pagenum || '')
        window._user = _user;
        var sendname = '';
        var historyRepairinfo = [];
        var hqry = [];
        var deletefirst = null;

        var role = defalut.repairrole;
        var wx = defalut.repair._wx;
        var _LB = defalut.repair._LB;
        var _HPZL = defalut.repair._HPZL;
        var app_state = defalut.repair.STATE;

        var role1 = {
            9: '普通成员',
            12: '部门领导',
            13: '公司领导'

        }

        if (_user) {
            get_apply2()
        }

        // console.log(_user, 'user')
        // get_apply2()
        function get_apply2() {
            W.$ajax('mysql_api/list', {
                json_p: { XLH: _g.applyid },
                sorts: 'XLH',
                table: 'ga_apply2'
            }, function (res) {
                wistorm_api._list('department', { objectId: res.data[0].DEPT }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                    // console.log(json)
                    res.data[0].department = dep.data[0];
                    gethistory(res.data[0].HPHM)
                    gethq(res.data[0].SQR) //获取申请人信息
                    // res.data[0].spstatus = res1.data
                    W.$ajax('mysql_api/list', {
                        json_p: { XLH: _g.applyid },
                        sorts: 'ID',
                        table: 'ga_repairinfo'
                    }, function (res2) {
                        res.data[0].repairinfo = res2.data;
                        W.$ajax('mysql_api/list', {
                            json_p: { apply2_id: _g.applyid },
                            sorts: 'status',
                            table: 'ga_spstatus'
                        }, function (res1) {
                            var i = 0;
                            if (!res1.data.length) {
                                res.data[0].spstatus = res1.data;
                                mainContral(res.data[0]);
                                gethistory(res.data[0])
                            } else {
                                res1.data.forEach(ele => {
                                    wistorm_api._list('employee', { uid: ele.uid }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                                        wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                                            json.data[0] ? emp.data[0].userid = json.data[0].username : null;
                                            ele.user = emp.data;
                                            i++;
                                            if (i == res1.data.length) {
                                                res.data[0].spstatus = res1.data;
                                                mainContral(res.data[0]);
                                                gethistory(res.data[0])
                                            }
                                        })
                                    })
                                })
                            }
                        })
                    })
                })
            })
        }
        function gethq(data) {
            wistorm_api._list('employee', { name: data }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                emp.data.forEach(ele => {
                    wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                        ele.user = json.data[0];
                        hqry.push(ele);
                        console.log(hqry, 'hqry')
                    })
                })
            })
        }
        //获取号码号牌的历史记录
        function gethistory(data) {
            W.$ajax('mysql_api/list', {
                json_p: { HPHM: data.HPHM },
                table: 'ga_apply2',
                sorts: '-XLH',
            }, function (res) {
                console.log(res, 'res')
                var i = 0;
                res.data.forEach(ele => {
                    W.$ajax('mysql_api/list', {
                        json_p: { XLH: ele.XLH },
                        sorts: 'ID',
                        table: 'ga_repairinfo'
                    }, function (res3) {
                        ele.repairinfo = res3.data;
                        W.$ajax('mysql_api/list', {
                            json_p: { apply2_id: ele.XLH },
                            table: 'ga_spstatus',
                            sorts: 'status'
                        }, function (res2) {
                            ele.spstatus = res2.data;
                            i++;
                            if (i == res.data.length) {
                                // console.log(res)
                                historyRepairinfo = res.data;
                                historyRepairinfo = historyRepairinfo.filter(ele => ele.XLH != data.XLH)
                                show_repairinfo(data.repairinfo)
                            }
                        })
                    })

                })
            })
        }

        function mainContral(data) {
            console.log(data)
            show_apply(data);
            operation(data);
        }

        function show_apply(data) {
            console.log(data)
            var apply = data;
            // var sp_status = data.spstatus[0].sp_status
            var wxlx = ''
            apply.WXLX.split('').forEach(ele => {
                wxlx += (wx[ele] + '、')
            })
            wxlx = wxlx.slice(0, -1)
            $('#name').text(data.SQR + '的车修')
            $('#HPHM').text(apply.HPHM);
            $('#HPZL').text(_HPZL[apply.HPZL])
            $('#YJJED').text(apply.YJJED)
            $('#WXLX').text(wxlx)
            $('#SQR').text(apply.SQR);
            $('#DEPT').text(apply.department.name);
            $('#SQSJ').text(W.dateToString(W.date(apply.SQSJ)));
            $('#STATE').text(app_state[apply.STATE]);
            $('#DQLC').text(defalut.repair.LC[apply.DQLC]);
            $('#XGLC').text(defalut.repair.LC[apply.XGLC]);
            $('#WXDW').text(apply.WXDW);
            $('#ZJE').text(apply.ZJE);
            $('#JCRQ').text(apply.JCRQ || '');
            $('#CCRQ').text(apply.CCRQ || '');
            $('#JZR').text(apply.JZR || '');
            $('#JSR').text(apply.JSR || '');
            $('#WXDWLXDH').text(apply.WXDWLXDH);
            $('#_spstatus').text(app_state[apply.STATE])
            show_repairinfo(data.repairinfo) //列出维修明细
            show_audit(data.spstatus)       //列出审核人明细
        }


        function show_repairinfo(data) {
            console.log(data)
            $('#repair_info').empty();
            data.forEach((ele, index) => {
                // console.log(historyRepairinfo, '')
                var history_arr = [];
                historyRepairinfo.forEach(rep => {
                    var d = rep.repairinfo.filter(rep1 => rep1.XMMC.indexOf(ele.XMMC) > -1);
                    // console.log(d)
                    if (d.length) {
                        history_arr.push(rep)
                    }
                })
                console.log(history_arr, 'history_arr')
                var tr1 = `<select style="width:50%;border-radius:2px">`
                history_arr.forEach(ele => {
                    tr1 += `<option>${ele.SQR + '&nbsp;&nbsp;' + W.dateToString(W.date(ele.SQSJ))}</option>`
                })
                tr1 += '</select>'
                var tr_content = `<tr class="info">
                    <th>${_LB[ele.LB]}</th>
                    <th>${ele.XMBH || ''}</th>
                    <th ${history_arr.length ? 'style="color:red"' : null}>${ele.XMMC || ''} </th>
                    <th>${history_arr.length ? tr1 : ''}</th>
                    <th>${ele.SL || ''}</th>
                    <th>${ele.DJ || ''}</th>
                    <th>${ele.JE}</th>
                </tr>`;
                $('#repair_info').append(tr_content)
            })
        }
        //审核流程
        function show_audit(data) {
            $('#auditer').empty();
            data.forEach((ele, index) => {
                var isagree = ''
                ele.isagree ? ele.isagree == 1 ? isagree = '同意' : isagree = '驳回' : isagree = '审核中'

                var tr_content = `<tr class="tr_b_b1">
                    <th>${role[ele.status]}审批</th>
                    <th>${isagree}</th>
                    <th>${ele.user[0] ? ele.user[0].name : ''} </th>
                    <th>${ele.advice ? ele.advice : ''}</th>
                    <th>${W.dateToString(new Date((ele.cre_tm * 1000)))}</th>
                </tr>`
                $('#auditer').append(tr_content)
            })
        }

        function operation(data) {
            console.log(data, 'data')
            sendname = data.SQR;
            var spstatus_status = 0;


            if (_user.employee) {
                if (_user.employee.isDriver || _user.depart.name == '修理厂' || _user.employee.name == data.SQR) { //司机或修理厂
                    if (_g.my && data.STATE == 3) {
                        $('#my_button').show();
                        $('#resubmit').show();
                    } else if (_g.my && data.STATE == 1) {
                        if (data.spstatus.length) {
                            if (data.spstatus[0].isagree == 0) {
                                $('#my_button').show();
                                $('#resubmit').show();
                            }
                        }
                    }
                }
            }

            // debugger;
            if (_g.auditing && data.STATE == 1) { //审核中
                if (data.spstatus.length == 2 && data.SPJB == 13) {
                    $('#istakezgy').show();
                }
                if (data.DQLC == 2) {
                    if (_user.employee.role == 12 && _user.employee.departId == data.DEPT && (!_user.employee.rolename || _user.employee.rolename == '部门领导')) {
                        spstatus_status = 1
                        $('#other_button').show();
                    }
                } else if (data.DQLC == 4) {
                    if (_user.employee.role == 12 && _user.employee.rolename == '警务保障室领导') {
                        spstatus_status = 2
                        $('#other_button').show();
                    }
                } else if (data.DQLC == 6) {
                    if (_user.employee.role == 13) {
                        spstatus_status = 3
                        $('#other_button').show();
                    }
                } else if (data.DQLC == 3) {
                    if (_user.employee.isInCharge) {
                        spstatus_status = 4
                        $('#other_button').show();
                    }
                }
            }
            if (_g.reimburse && data.STATE == 5 && data.DQLC == 0) { //报销审批
                $('#reimburse_button').show()
            }
            if (_g.delete && _g.type == 8) {
                $('#delete_button').show();
            }
            $('#delete_button').on('click', function () {
                weui.confirm('确认删除', function () {
                    W.$ajax('mysql_api/delete', {
                        table: 'ga_apply2',
                        json_p: { XLH: _g.applyid }
                    }, function (res) {
                        W.$ajax('mysql_api/delete', {
                            table: 'ga_spstatus',
                            json_p: { apply2_id: _g.applyid }
                        }, function (res1) {
                            W.$ajax('mysql_api/delete', {
                                table: 'ga_repairinfo',
                                json_p: { XLH: _g.applyid }
                            }, function (res2) {
                                if (data.STATE == 1) {
                                    wistorm_api._update('vehicle', { name: data.HPHM }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                                        history.back();
                                    })
                                } else {
                                    history.back();
                                }
                            })
                        })
                    })
                })

            })


            var is_zgy = $('input[name="zgy1"]:checked').val()


            //撤销
            $('#backout').on('click', function () {
                W.$ajax('mysql_api/update', {
                    json_p: { XLH: _g.applyid },
                    update_json: { DQLC: 'A', XGLC: 'A', STATE: 0 },
                    table: 'ga_apply2',
                }, function (res) {
                    W.$ajax('mysql_api/update', {
                        json_p: { apply2_id: _g.applyid },
                        update_json: { sp_status: 0 },
                        table: 'ga_spstatus'
                    }, function (res2) {
                        wistorm_api._update('vehicle', { name: data.HPHM }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                            // console.log(1)
                            history.go(0)
                        })
                    })
                })
            })
            // //重新提交
            // $('#resubmit').on('click', function () {
            //     top.location = './fix_apply?resubmit=true&applyid=' + _g.applyid
            // })


            //通过
            $('#agree').on('click', function () {
                var sendid = '';
                var sendname = data.SQR;
                var newTime = ~~(new Date().getTime() / 1000)
                if (data.SPJB == 11) { //一级审批
                    // var etm = ~~(new Date().getTime() / 1000)
                    W.$ajax('mysql_api/update', {
                        json_p: { XLH: _g.applyid },
                        update_json: { DQLC: 0, XGLC: 'A', STATE: 5 },
                        table: 'ga_apply2'
                    }, function (res) {
                        console.log(res)
                        W.$ajax('mysql_api/update', {
                            json_p: { apply2_id: _g.applyid },
                            update_json: { isagree: 1, sp_status: 5, uid: _user.user.objectId, sp_tm: newTime },
                            table: 'ga_spstatus'
                        }, function (us) {
                            wistorm_api._update('vehicle', { name: data.HPHM }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                                debugger;
                                sendmessage(_g.applyid, hqry[0].user.username, data.SQR, '申请通过', 1, function () {
                                    history.go(0)
                                })
                            })
                        })
                    })
                } else if (data.SPJB == 12) { //二级审批
                    if (_user.employee.role == 12 && _user.employee.rolename == "警务保障室领导") {
                        W.$ajax('mysql_api/update', {
                            json_p: { XLH: _g.applyid },
                            update_json: { DQLC: 0, XGLC: 'A', STATE: 5 },
                            table: 'ga_apply2'
                        }, function (res) {
                            W.$ajax('mysql_api/update', {
                                json_p: { status: spstatus_status, apply2_id: _g.applyid },
                                update_json: { isagree: 1, uid: _user.user.objectId, sp_tm: newTime },
                                table: 'ga_spstatus'
                            }, function (res1) {
                                W.$ajax('mysql_api/update', {
                                    json_p: { apply2_id: _g.applyid },
                                    update_json: { sp_status: 5 },
                                    table: 'ga_spstatus'
                                }, function (res2) {
                                    wistorm_api._update('vehicle', { name: data.HPHM }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                                        sendmessage(_g.applyid, hqry[0].user.username, data.SQR, '申请通过', 1, function () {
                                            history.go(0)
                                        })
                                    })
                                })
                            })
                        })
                    } else if (_user.employee.role == 12) {
                        wistorm_api._list('department', { isSupportDepart: true, uid: _user.employee.companyId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                            wistorm_api._list('employee', { departId: dep.data[0].objectId, role: 12 }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                                var i = 0;
                                emp.data.forEach(ele => {
                                    wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                                        ele.user = json.data[0]
                                        wistorm_api._list('role', { objectId: ele.roleId }, '', '-createdAt', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), false, function (roles) {
                                            ele.rolename = roles.data ? roles.data[0].name : null;
                                            i++;
                                            if (i == emp.data.length) {
                                                selectAuditer(emp.data, 2, true)
                                            }
                                        })
                                    })
                                })
                            })
                        })
                    }

                } else if (data.SPJB == 13) { //三级审批
                    if (_user.employee.role == 13) {
                        W.$ajax('mysql_api/update', {
                            json_p: { XLH: _g.applyid },
                            update_json: { DQLC: 0, XGLC: 'A', STATE: 5 },
                            table: 'ga_apply2'
                        }, function (res) {
                            W.$ajax('mysql_api/update', {
                                json_p: { status: 3, apply2_id: _g.applyid },
                                update_json: { isagree: 1, uid: _user.user.objectId, sp_tm: newTime },
                                table: 'ga_spstatus'
                            }, function (res1) {
                                W.$ajax('mysql_api/update', {
                                    json_p: { apply2_id: _g.applyid },
                                    update_json: { sp_status: 5 },
                                    table: 'ga_spstatus'
                                }, function (res2) {
                                    wistorm_api._update('vehicle', { name: data.HPHM }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                                        sendmessage(_g.applyid, hqry[0].user.username, data.SQR, '申请通过', 1, function () {
                                            history.go(0)
                                        })
                                    })
                                })
                            })
                        })
                    } else if (_user.employee.role == 12 || _user.employee.isInCharge) {
                        if (data.spstatus.length == 1) {
                            wistorm_api._list('department', { isSupportDepart: true, uid: _user.employee.companyId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                                wistorm_api._list('employee', { departId: dep.data[0].objectId, role: 12 }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                                    var i = 0;
                                    emp.data.forEach(ele => {
                                        wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                                            ele.user = json.data[0]
                                            wistorm_api._list('role', { objectId: ele.roleId }, '', '-createdAt', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), false, function (roles) {
                                                ele.rolename = roles.data ? roles.data[0].name : null;
                                                i++;
                                                if (i == emp.data.length) {
                                                    selectAuditer(emp.data, 2)
                                                }
                                            })
                                        })
                                    })
                                })
                            })
                        } else if (data.spstatus.length == 2 || data.spstatus.length == 3) {
                            if (data.spstatus.length == 2 && is_zgy) {
                                wistorm_api._list('employee', { isInCharge: true, companyId: _user.employee.companyId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                                    wistorm_api.getUserList({ objectId: emp.data[0].uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                                        sendid = json.data[0].username;
                                        W.$ajax('mysql_api/update', {
                                            json_p: { XLH: _g.applyid },
                                            update_json: { DQLC: 3, XGLC: 6 },
                                            table: 'ga_apply2'
                                        }, function (res) {
                                            W.$ajax('mysql_api/update', {
                                                json_p: { status: 2, apply2_id: _g.applyid },
                                                update_json: { isagree: 1, uid: _user.user.objectId, sp_tm: newTime },
                                                table: 'ga_spstatus'
                                            }, function (res) {
                                                var append_spstatus = {
                                                    id: 0,
                                                    isagree: 0,
                                                    uid: emp.data[0].uid,
                                                    cre_tm: ~~(new Date().getTime() / 1000),
                                                    apply2_id: _g.applyid,
                                                    sp_status: 1,
                                                    status: 4
                                                }
                                                W.$ajax('mysql_api/create', {
                                                    json_p: append_spstatus,
                                                    table: 'ga_spstatus'
                                                }, function (res1) {
                                                    sendmessage(_g.applyid, sendid, sendname, '', 2, function () {
                                                        history.go(0)
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            } else {
                                wistorm_api._list('employee', { departId: '1', role: 13 }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                                    var i = 0;
                                    emp.data.forEach(ele => {
                                        // wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                                        //     ele.user = json.data[0];
                                        //     i++;
                                        //     if (i == emp.data.length) {
                                        //         console.log(emp.data)
                                        //         selectAuditer(emp.data, 3)
                                        //     }
                                        // })
                                        wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                                            ele.user = json.data[0]
                                            wistorm_api._list('role', { objectId: ele.roleId }, '', '-createdAt', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), false, function (roles) {
                                                ele.rolename = roles.data ? roles.data[0].name : null;
                                                i++;
                                                if (i == emp.data.length) {
                                                    selectAuditer(emp.data, 3)
                                                }
                                            })
                                        })
                                    })
                                })
                            }
                        }
                    }
                }

            })
            //驳回（审批不通过）
            $('#reject').on('click', function () {
                var etm = ~~(new Date().getTime() / 1000)
                W.$ajax('mysql_api/update', {
                    json_p: { XLH: _g.applyid },
                    update_json: { DQLC: 'A', XGLC: 'A', STATE: 4 },
                    table: 'ga_apply2'
                }, function (res) {
                    console.log(res)
                    W.$ajax('mysql_api/update', {
                        json_p: { apply2: _g.applyid, status: spstatus_status },
                        update_json: { isagree: 2, uid: _user.employee.uid },
                        table: 'ga_spstatus'
                    }, function (us) {
                        console.log(us)
                        W.$ajax('mysql_api/update', {
                            json_p: { apply2_id: _g.applyid },
                            update_json: { sp_status: 0, },
                            table: 'ga_spstatus'
                        }, function (u_s) {
                            console.log(u_s)
                            wistorm_api._update('vehicle', { name: data.HPHM }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                                console.log(veh)
                                sendmessage(_g.applyid, hqry[0].user.username, data.SQR, '申请驳回', 1, function () {
                                    history.go(0)
                                })
                            });
                        })
                    })
                })
            })


            $('#reimburse').on('click', function () {
                // console.log(1)
                W.$ajax('mysql_api/update', {
                    json_p: { XLH: _g.applyid },
                    update_json: { DQLC: 'A', XGLC: 'A', STATE: 6 },
                    table: 'ga_apply2',
                }, function (res) {
                    W.$ajax('mysql_api/update', {
                        json_p: { apply2_id: _g.applyid },
                        update_json: { sp_status: 6 },
                        table: 'ga_spstatus'
                    }, function (res2) {
                        // wistorm_api._update('vehicle', { name: data.HPHM }, { status: 0 }, $.cookie('auth_code'), true, function (veh) {
                        // console.log(1)
                        history.go(0)
                        // })
                    })
                })
            })
        }

        function selectAuditer(data, type, isover) {
            console.log(data, type, 'dfd')
            if (type == 2) {
                data = data.filter(ele => ele.rolename && ele.rolename == '警务保障室领导')
            }
            $('#nextAuditer').empty();
            var append_spstatus = {};
            var sendid = null;
            var _index = null;
            data.forEach((ele, index) => {
                var _id = 'add' + index;
                var checked = 'checked';
                // ele.responsibility.indexOf('1') > -1 ? _index = index : index == 0 ? _index = index : ''
                var tr_content = `
                    <div class="weui-cell weui-cell_access" >
                        <input type="checkbox" value=${ele.user.username} style="margin-right:5px" name='select_auditer' id=${_id} />
                        <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                            <img src="/img/1.png" style="width: 50px;display: block">
                        </div>
                        <div class="weui-cell__bd">
                            <label for=${_id}>
                                <p>`+ ele.name + `</p>
                                <p style="font-size: 13px;color: #888888;">`+ role1[ele.role] + `</p>
                            </label>
                        </div>
                    </div>
                `
                $('#nextAuditer').append(tr_content);
            })

            append_spstatus = {
                id: 0,
                isagree: 0,
                uid: '',
                cre_tm: ~~(new Date().getTime() / 1000),
                apply2_id: _g.applyid,
                sp_status: 1
            }
            type == 1 ? append_spstatus.status = 1 : type == 2 ? append_spstatus.status = 2 : type == 3 ? append_spstatus.status = 3 : null;
            // sendid = data[_index].user.username;
            $('#androidDialog1').fadeIn(200);
            $('#audit_cancle').on('click', function () {
                $('#androidDialog1').fadeOut(200);
            })
            $('#audit_commit').on('click', function () {
                debugger;
                console.log(append_spstatus, 'spstatus')
                var update_json = {};
                if (type == 1) {
                    update_json.DQLC = 2;
                    update_json.XGLC = 4;
                    update_json.STATE = 1;
                    if (isover) {
                        update_json.DQLC = 2;
                        update_json.XGLC = 0;
                        update_json.STATE = 1;
                    }
                } else if (type == 2) {
                    update_json.DQLC = 4;
                    update_json.XGLC = 6;
                    if (isover) {
                        update_json.DQLC = 4;
                        update_json.XGLC = 0;
                    }
                } else if (type == 3) {
                    update_json.DQLC = 6;
                    update_json.XGLC = 0
                }
                // console.log(update_json)
                var _addauditer = $('input[name="select_auditer"]')
                var _auditer = []; //推送人id
                for (var o in _addauditer) {
                    _addauditer[o].checked ? _auditer.push(_addauditer[o].value) : null
                }
                if (!_auditer.length) {
                    weui.alert('请选择审批人')
                }
                W.$ajax('mysql_api/update', {
                    json_p: { XLH: _g.applyid },
                    update_json: update_json,
                    table: 'ga_apply2'
                }, function (res) {
                    if (type == 1) {
                        W.$ajax('mysql_api/create', {
                            json_p: append_spstatus,
                            table: 'ga_spstatus'
                        }, function (res2) {
                            var _i = 0;
                            _auditer.forEach(ele => {
                                sendmessage(_g.applyid, ele, sendname, '', 2, function () {
                                    _i++;
                                    if (_i == _auditer.length) {
                                        history.go(0)
                                    }
                                })
                            })
                        })
                    } else { //type = 2、3 
                        debugger;
                        var _status = '';
                        var now = ~~(new Date().getTime() / 1000)
                        if (type == 2) {
                            _status = 1
                        } else if (type == 3 && _user.employee.isInCharge) {
                            _status = 4
                        } else if (type == 3) {
                            _status = 2
                        }
                        W.$ajax('mysql_api/update', {
                            json_p: { apply2_id: _g.applyid, status: _status },
                            update_json: { isagree: 1, sp_tm: now, uid: _user.user.objectId },
                            table: 'ga_spstatus'
                        }, function (res1) {
                            W.$ajax('mysql_api/create', {
                                json_p: append_spstatus,
                                table: 'ga_spstatus'
                            }, function (res2) {
                                var _i = 0;
                                _auditer.forEach(ele => {
                                    sendmessage(_g.applyid, ele, sendname, '', 2, function () {
                                        _i++;
                                        if (_i == _auditer.length) {
                                            history.go(0)
                                        }
                                    })
                                })
                            })
                        })
                    }
                })
            })
        }

        function sendmessage(id, userid, name, ti, type, callback) {
            var titles = ti || '车修申请'
            var str = 'http://jct.chease.cn' + '/fix_detail?applyid=' + id;
            if (type == 1) { //提交
                str += '&my=true'
            } else if (type == 2) { //审核
                str += '&auditing=true'
            }
            str += '&userid=' + userid
            var _desc = name + '维修申请'
            var _op_data = { touser: userid, title: titles, desc: _desc, url: str, remark: "查看详情" };
            $.ajax({
                url: 'http://h5.bibibaba.cn/send_qywx.php',
                data: _op_data,
                dataType: 'jsonp',
                crossDomain: true,
                success: function (re) {
                    callback()
                },
                error: function (err) {
                    callback()
                }
            })
        }
    }






    // beta()
    function beta() {
        var _g = W.getSearch();
        var _user = JSON.parse(localStorage.getItem('user'));
        var historyRepairinfo = [];
        var hqry = [];
        var sendname = '';
        var deletefirst = null;
        var lc = {
            1: '维修申请',
            2: '科所队领导审批',
            3: '专管员审批',
            4: '警务保障室领导审批',
            6: '局领导审批',
            9: '维修信息录入',
            0: '待报销',
            A: '已结束'
        }
        var role = {
            1: '科所队领导',
            2: '后勤科领导',
            3: '局领导',
            4: '专管员'
        }
        var role1 = {
            9: '普通成员',
            12: '部门领导',
            13: '公司领导'

        }
        var wx = {
            A: '发动机',
            B: '地盘',
            C: '电路',
            D: '轮胎',
            E: '外壳',
            Z: '其他',
        }
        var app_state = {
            0: '撤销',
            1: '审批中',
            3: '明细录入',
            4: '审批驳回',
            5: '待报销',
            6: '已结束'
        }
        var _HPZL = {
            '01': '大型汽车',
            '02': '小型汽车'
        }
        var _LB = {
            1: '工时费',
            2: '材料费'
        }
        console.log(_user, 'user')
        get_apply2()
        function get_apply2() {
            W.$ajax('mysql_api/list', {
                json_p: { XLH: _g.applyid },
                sorts: 'XLH',
                table: 'ga_apply2'
            }, function (res) {
                wistorm_api._list('department', { objectId: res.data[0].DEPT }, '', '', '-createdAt', 0, 0, 1, -1, $.cookie('auth_code'), true, function (dep) {
                    // console.log(json)
                    res.data[0].department = dep.data[0];
                    sendname = res.data[0].SQR
                    gethistory(res.data[0].HPHM)
                    gethq(res.data[0].SQR)
                    // res.data[0].spstatus = res1.data
                    W.$ajax('mysql_api/list', {
                        json_p: { XLH: _g.applyid },
                        sorts: 'ID',
                        table: 'ga_repairinfo'
                    }, function (res2) {
                        res.data[0].repairinfo = res2.data;
                        W.$ajax('mysql_api/list', {
                            json_p: { apply2_id: _g.applyid },
                            sorts: 'status',
                            table: 'ga_spstatus'
                        }, function (res1) {
                            var i = 0;

                            if (!res1.data.length) {
                                res.data[0].spstatus = res1.data
                                mainContral(res.data[0]);
                                gethistory(res.data[0])
                            } else {
                                res1.data.forEach(ele => {
                                    wistorm_api._list('employee', { uid: ele.uid }, '', '', '-createdAt', 0, 0, 1, -1, $.cookie('auth_code'), true, function (emp) {
                                        wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, $.cookie('auth_code'), function (json) {
                                            json.data[0] ? emp.data[0].userid = json.data[0].username : null;
                                            ele.user = emp.data;
                                            i++;
                                            if (i == res1.data.length) {
                                                res.data[0].spstatus = res1.data;
                                                mainContral(res.data[0]);
                                                gethistory(res.data[0])
                                            }
                                        })
                                    })
                                })
                            }

                        })
                    })
                })
            })
        }
        function gethq(data) {
            wistorm_api._list('employee', { name: data }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                // var i = 0;
                emp.data.forEach(ele => {
                    //     if (ele.responsibility.indexOf('4') > -1) {
                    wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                        ele.user = json.data[0];
                        hqry.push(ele);
                        // console.log(hqry, 'hqry')
                    })
                    //     }

                })
            })
        }
        //获取号码号牌的历史记录
        function gethistory(data) {
            W.$ajax('mysql_api/list', {
                json_p: { HPHM: data.HPHM },
                table: 'ga_apply2',
                sorts: '-XLH',
            }, function (res) {
                console.log(res, 'res')
                var i = 0;
                res.data.forEach(ele => {
                    W.$ajax('mysql_api/list', {
                        json_p: { XLH: ele.XLH },
                        sorts: 'ID',
                        table: 'ga_repairinfo'
                    }, function (res3) {
                        ele.repairinfo = res3.data;
                        W.$ajax('mysql_api/list', {
                            json_p: { apply2_id: ele.XLH },
                            table: 'ga_spstatus',
                            sorts: 'status'
                        }, function (res2) {
                            ele.spstatus = res2.data;
                            i++;
                            if (i == res.data.length) {
                                // console.log(res)
                                historyRepairinfo = res.data;
                                historyRepairinfo = historyRepairinfo.filter(ele => ele.XLH != data.XLH)
                                show_repairinfo(data.repairinfo)
                            }
                        })
                    })

                })
            })
        }

        function mainContral(data) {
            console.log(data)
            show_apply(data);
            operation(data);
        }
        function show_apply(data) {
            console.log(data)
            var apply = data;
            // var sp_status = data.spstatus[0].sp_status
            var wxlx = ''
            apply.WXLX.split('').forEach(ele => {
                wxlx += (wx[ele] + '、')
            })
            wxlx = wxlx.slice(0, -1)
            $('#HPHM').text(apply.HPHM);
            $('#HPZL').text(_HPZL[apply.HPZL])
            $('#YJJED').text(apply.YJJED)
            $('#WXLX').text(wxlx)
            $('#SQR').text(apply.SQR);
            $('#DEPT').text(apply.department.name);
            $('#SQSJ').text(W.dateToString(W.date(apply.SQSJ)));
            $('#STATE').text(app_state[apply.STATE]);
            $('#DQLC').text(lc[apply.DQLC]);
            $('#XGLC').text(lc[apply.XGLC]);
            $('#WXDW').text(apply.WXDW);
            $('#ZJE').text(apply.ZJE);
            $('#JCRQ').text(apply.JCRQ || '');
            $('#CCRQ').text(apply.CCRQ || '');
            $('#JZR').text(apply.JZR || '')
            $('#WXDWLXDH').text(apply.WXDWLXDH);
            show_repairinfo(data.repairinfo)
            show_audit(data.spstatus)
        }


        function show_repairinfo(data) {
            console.log(data)
            $('#repair_info').empty();
            data.forEach((ele, index) => {
                // console.log(historyRepairinfo, '')
                var history_arr = [];
                historyRepairinfo.forEach(rep => {
                    var d = rep.repairinfo.filter(rep1 => rep1.XMMC.indexOf(ele.XMMC) > -1);
                    // console.log(d)
                    if (d.length) {
                        history_arr.push(rep)
                    }
                })
                console.log(history_arr)
                var tr1 = `<select style="width:50%;border-radius:2px">`
                history_arr.forEach(ele => {
                    tr1 += `<option>${ele.SQR + '&nbsp;&nbsp;' + W.dateToString(W.date(ele.SQSJ))}</option>`
                })
                tr1 += '</select>'
                var tr_content = `<tr class="info">
                    <th>${_LB[ele.LB]}</th>
                    <th>${ele.XMBH || ''}</th>
                    <th ${history_arr.length ? 'style="color:red"' : null}>${ele.XMMC || ''} </th>
                    <th>${history_arr.length ? tr1 : ''}</th>
                    <th>${ele.SL || ''}</th>
                    <th>${ele.DJ || ''}</th>
                    <th>${ele.JE}</th>
                </tr>`;
                $('#repair_info').append(tr_content)
            })
        }
        //审核流程
        function show_audit(data) {
            $('#auditer').empty();
            data.forEach((ele, index) => {
                var isagree = ''
                ele.isagree ? ele.isagree == 1 ? isagree = '同意' : isagree = '驳回' : isagree = '审核中'

                var tr_content = `<tr class="tr_b_b1">
                    <th>${role[ele.status]}审批</th>
                    <th>${isagree}</th>
                    <th>${ele.user[0] ? ele.user[0].name : ''} </th>
                    <th>${ele.advice ? ele.advice : ''}</th>
                    <th>${W.dateToString(new Date((ele.cre_tm * 1000)))}</th>
                </tr>`
                $('#auditer').append(tr_content)
            })
        }

        function operation(data) {
            console.log(data, 'data')

            var firstsp = true;

            for (var i = 0; i < data.spstatus.length; i++) {
                if (data.spstatus[i].status != 1) {
                    firstsp = false;
                    break;
                }
            }

            if (_user.employee.responsibility.indexOf('4') > -1 && _g.my && data.STATE == 3) {
                $('#my_button').show();
            }
            // if (_user.employee.responsibility.indexOf('2') > -1 && _g.auditing && data.STATE == 1) {
            //     $('#other_show').show();
            // }
            if (_g.auditing && data.STATE == 1) {
                $('#other_button').show();
                data.spstatus.forEach(ele => {
                    if (ele.uid == _user.employee.uid && ele.isagree) {
                        $('#other_button').hide();
                    }
                })
                if (data.spstatus.length == 2 && data.SPJB == 13) {
                    if (!firstsp) {
                        $('#istakezgy').show();
                    }
                    // $('#istakezgy').show();
                }

            }
            if (_g.reimburse && data.STATE == 5) { //报销审批
                $('#reimburse_button').show()
            }

            if (_user.employee.responsibility.indexOf('4') > -1 && _g.my && data.STATE == 5) {
                $('#print_1button').show();
            }


            $('#reimburse').on('click', function () {
                // console.log(1)
                W.$ajax('mysql_api/update', {
                    json_p: { XLH: _g.applyid },
                    update_json: { DQLC: 'A', XGLC: 'A', STATE: 6 },
                    table: 'ga_apply2',
                }, function (res) {
                    W.$ajax('mysql_api/update', {
                        json_p: { apply2_id: _g.applyid },
                        update_json: { sp_status: 6 },
                        table: 'ga_spstatus'
                    }, function (res2) {
                        // wistorm_api._update('vehicle', { name: data.HPHM }, { status: 0 }, $.cookie('auth_code'), true, function (veh) {
                        // console.log(1)
                        history.go(0)
                        // })
                    })
                })
            })

            //确认提交审批
            $('#submitAndaudit').on('click', function () {
                console.log($('input[name="istake"]:checked').val(), 'd')
                console.log(hqry, 'hqry')
                wistorm_api._list('department', { uid: _user.employee.companyId, objectId: _user.employee.departId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                    wistorm_api._list('employee', { departId: dep.data[0].objectId, role: 12 }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                        var i = 0;
                        emp.data.forEach(ele => {
                            wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                                ele.user = json.data[0]
                                i++;
                                if (i == emp.data.length) {
                                    if (data.SPJB == 11) {
                                        selectAuditer(emp.data, 1, true)
                                    } else {
                                        selectAuditer(emp.data, 1)
                                    }
                                }
                            })
                        })
                    })
                })
            })
            //撤销
            $('#backout').on('click', function () {
                W.$ajax('mysql_api/update', {
                    json_p: { XLH: _g.applyid },
                    update_json: { DQLC: 'A', XGLC: 'A', STATE: 0 },
                    table: 'ga_apply2',
                }, function (res) {
                    W.$ajax('mysql_api/update', {
                        json_p: { apply2_id: _g.applyid },
                        update_json: { sp_status: 0 },
                        table: 'ga_spstatus'
                    }, function (res2) {
                        wistorm_api._update('vehicle', { name: data.HPHM }, { status: 0 }, $.cookie('auth_code'), true, function (veh) {
                            // console.log(1)
                            history.go(0)
                        })
                    })
                })
            })

            //通过
            $('#agree').on('click', function () {
                // console.log($('input[name="istake"]:checked').val(), 'd')
                // deletefirst = data.spstatus.filter(ele => ele.status == 1 && ele.uid != _user.employee.uid);

                var sendid = '';
                var sendname = data.SQR;
                var newTime = ~~(new Date().getTime() / 1000)
                if (data.SPJB == 11) { //一级审批
                    // var etm = ~~(new Date().getTime() / 1000)
                    W.$ajax('mysql_api/update', {
                        json_p: { XLH: _g.applyid },
                        update_json: { DQLC: 0, XGLC: 'A', STATE: 5 },
                        table: 'ga_apply2'
                    }, function (res) {
                        console.log(res)
                        W.$ajax('mysql_api/update', {
                            json_p: { apply2_id: _g.applyid },
                            update_json: { isagree: 1, sp_status: 5, uid: _user.user.objectId, sp_tm: newTime },
                            table: 'ga_spstatus'
                        }, function (us) {
                            wistorm_api._update('vehicle', { name: data.HPHM }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                                sendmessage(_g.applyid, hqry[0].user.username, data.SQR, '申请通过', 1, function () {
                                    history.go(0)
                                })
                            })
                        })
                    })
                } else if (data.SPJB == 12) {
                    if (_user.employee.role == 12 && _user.depart.isSupportDepart) {
                        W.$ajax('mysql_api/update', {
                            json_p: { XLH: _g.applyid },
                            update_json: { DQLC: 0, XGLC: 'A', STATE: 5 },
                            table: 'ga_apply2'
                        }, function (res) {
                            W.$ajax('mysql_api/update', {
                                json_p: { status: 2, apply2_id: _g.applyid },
                                update_json: { isagree: 1, uid: _user.user.objectId, sp_tm: newTime },
                                table: 'ga_spstatus'
                            }, function (res1) {
                                W.$ajax('mysql_api/update', {
                                    json_p: { apply2_id: _g.applyid },
                                    update_json: { sp_status: 5 },
                                    table: 'ga_spstatus'
                                }, function (res2) {
                                    wistorm_api._update('vehicle', { name: data.HPHM }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                                        sendmessage(_g.applyid, hqry[0].user.username, data.SQR, '申请通过', 1, function () {
                                            history.go(0)
                                        })
                                    })
                                })
                            })
                        })
                    } else if (_user.employee.role == 12) {
                        wistorm_api._list('department', { isSupportDepart: true, uid: _user.employee.companyId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                            wistorm_api._list('employee', { departId: dep.data[0].objectId, role: 12 }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                                var i = 0;
                                emp.data.forEach(ele => {
                                    wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                                        ele.user = json.data[0]
                                        i++;
                                        if (i == emp.data.length) {
                                            // console.log(emp.data)
                                            selectAuditer(emp.data, 2, true)
                                        }
                                    })
                                })
                            })
                        })
                    }

                } else if (data.SPJB == 13) { //三级审批
                    if (_user.employee.role == 13) {
                        W.$ajax('mysql_api/update', {
                            json_p: { XLH: _g.applyid },
                            update_json: { DQLC: 0, XGLC: 'A', STATE: 5 },
                            table: 'ga_apply2'
                        }, function (res) {
                            W.$ajax('mysql_api/update', {
                                json_p: { status: 3, apply2_id: _g.applyid },
                                update_json: { isagree: 1, uid: _user.user.objectId, sp_tm: newTime },
                                table: 'ga_spstatus'
                            }, function (res1) {
                                W.$ajax('mysql_api/update', {
                                    json_p: { apply2_id: _g.applyid },
                                    update_json: { sp_status: 5 },
                                    table: 'ga_spstatus'
                                }, function (res2) {
                                    wistorm_api._update('vehicle', { name: data.HPHM }, { status: 0 }, $.cookie('auth_code'), true, function (veh) {
                                        sendmessage(_g.applyid, hqry[0].user.username, data.SQR, '申请通过', 1, function () {
                                            history.go(0)
                                        })
                                    })
                                })
                            })
                        })
                    } else if (_user.employee.role == 12 || _user.employee.isInCharge) {
                        if (data.spstatus.length == 1) {
                            wistorm_api._list('department', { isSupportDepart: true, uid: _user.employee.companyId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                                wistorm_api._list('employee', { departId: dep.data[0].objectId, role: 12 }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                                    var i = 0;
                                    emp.data.forEach(ele => {
                                        wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                                            ele.user = json.data[0]
                                            i++;
                                            if (i == emp.data.length) {
                                                console.log(emp.data)
                                                selectAuditer(emp.data, 2)
                                            }
                                        })
                                    })
                                })
                            })
                        } else if (data.spstatus.length == 2 || data.spstatus.length == 3) {
                            if (data.spstatus.length == 2 && $('input[name="istake"]:checked').val()) {
                                wistorm_api._list('employee', { isInCharge: true, companyId: _user.employee.companyId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                                    wistorm_api.getUserList({ objectId: emp.data[0].uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                                        sendid = json.data[0].username;
                                        W.$ajax('mysql_api/update', {
                                            json_p: { XLH: _g.applyid },
                                            update_json: { DQLC: 3, XGLC: 6 },
                                            table: 'ga_apply2'
                                        }, function (res) {
                                            W.$ajax('mysql_api/update', {
                                                json_p: { status: 2, apply2_id: _g.applyid },
                                                update_json: { isagree: 1, uid: _user.user.objectId, sp_tm: newTime },
                                                table: 'ga_spstatus'
                                            }, function (res) {
                                                var append_spstatus = {
                                                    id: 0,
                                                    isagree: 0,
                                                    cre_tm: ~~(new Date().getTime() / 1000),
                                                    apply2_id: _g.applyid,
                                                    sp_status: 1,
                                                    status: 4
                                                }
                                                W.$ajax('mysql_api/create', {
                                                    json_p: append_spstatus,
                                                    table: 'ga_spstatus'
                                                }, function (res1) {
                                                    sendmessage(_g.applyid, sendid, sendname, '', 2, function () {
                                                        history.go(0)
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            } else {
                                wistorm_api._list('employee', { departId: '1', role: 13 }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                                    var i = 0;
                                    emp.data.forEach(ele => {
                                        wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                                            ele.user = json.data[0];
                                            i++;
                                            if (i == emp.data.length) {
                                                console.log(emp.data)
                                                selectAuditer(emp.data, 3)
                                            }
                                        })
                                    })
                                })
                            }
                        }
                    }
                }

            })
            //驳回
            $('#reject').on('click', function () {
                var etm = ~~(new Date().getTime() / 1000)
                W.$ajax('mysql_api/update', {
                    json_p: { XLH: _g.applyid },
                    update_json: { DQLC: 'A', XGLC: 'A', STATE: 4 },
                    table: 'ga_apply2'
                }, function (res) {
                    console.log(res)
                    W.$ajax('mysql_api/update', {
                        json_p: { uid: _user.user.objectId },
                        update_json: { isagree: 2 },
                        table: 'ga_spstatus'
                    }, function (us) {
                        console.log(us)
                        W.$ajax('mysql_api/update', {
                            json_p: { apply2_id: _g.applyid },
                            update_json: { sp_status: 0 },
                            table: 'ga_spstatus'
                        }, function (u_s) {
                            // console.log(u_s)
                            wistorm_api._update('vehicle', { name: data.HPHM }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                                console.log(veh)
                                sendmessage(_g.applyid, hqry[0].user.username, data.SQR, '申请驳回', 1, function () {
                                    history.go(0)
                                })
                            });
                        })
                    })
                })
            })
        }
        //同意并选择下一级审核人
        function selectAuditer(data, type, isover) {
            console.log(data, type, 'dfd')
            $('#nextAuditer').empty();
            var append_spstatus = {};
            var sendid = null;
            var _index = null;
            data.forEach((ele, index) => {
                var _id = 'add' + index;
                var checked = 'checked';
                ele.responsibility.indexOf('1') > -1 ? _index = index : index == 0 ? _index = index : ''
                var tr_content = `
                    <div class="weui-cell weui-cell_access" >
                        <input type="radio" style="margin-right:5px" name='add' id=${_id} ` + (ele.responsibility.indexOf('1') > -1 ? checked : index == 0 ? checked : '') + `/>
                        <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                            <img src="js/merge/img/1.png" style="width: 50px;display: block">
                        </div>
                        <div class="weui-cell__bd">
                            <p>`+ ele.name + `</p>
                            <p style="font-size: 13px;color: #888888;">`+ role1[ele.role] + `</p>
                        </div>
                    </div>
                `
                $('#nextAuditer').append(tr_content);
                $('#' + _id).on('click', function () {
                    console.log(index)
                    append_spstatus = {
                        id: 0,
                        isagree: 0,
                        cre_tm: ~~(new Date().getTime() / 1000),
                        apply2_id: _g.applyid,
                        sp_status: 1
                    }
                    type == 1 ? append_spstatus.status = 1 : type == 2 ? append_spstatus.status = 2 : type == 3 ? append_spstatus.status = 3 : null;
                    sendid = data[index].user.username
                })
            })

            append_spstatus = {
                id: 0,
                isagree: 0,
                cre_tm: ~~(new Date().getTime() / 1000),
                apply2_id: _g.applyid,
                sp_status: 1
            }
            type == 1 ? append_spstatus.status = 1 : type == 2 ? append_spstatus.status = 2 : type == 3 ? append_spstatus.status = 3 : null;
            sendid = data[_index].user.username;
            $('#androidDialog1').fadeIn(200);
            $('#audit_cancle').on('click', function () {
                $('#androidDialog1').fadeOut(200);
            })
            $('#audit_commit').on('click', function () {
                // console.log(11)
                console.log(append_spstatus, 'spstatus')
                var update_json = {};
                if (type == 1) {
                    update_json.DQLC = 2;
                    update_json.XGLC = 4;
                    update_json.STATE = 1;
                    if (isover) {
                        update_json.DQLC = 2;
                        update_json.XGLC = 0;
                        update_json.STATE = 1;
                    }
                } else if (type == 2) {
                    update_json.DQLC = 4;
                    update_json.XGLC = 6;
                    if (isover) {
                        update_json.DQLC = 4;
                        update_json.XGLC = 0;
                    }
                } else if (type == 3) {
                    update_json.DQLC = 6;
                    update_json.XGLC = 0
                }

                console.log(update_json)
                W.$ajax('mysql_api/update', {
                    json_p: { XLH: _g.applyid },
                    update_json: update_json,
                    table: 'ga_apply2'
                }, function (res) {
                    if (type == 1) {
                        W.$ajax('mysql_api/create', {
                            json_p: append_spstatus,
                            table: 'ga_spstatus'
                        }, function (res2) {
                            sendmessage(_g.applyid, sendid, sendname, '', 2, function () {
                                history.go(0)
                            })
                        })
                    } else { //2、3
                        var _status = '';
                        var now = ~~(new Date().getTime() / 1000)
                        if (type == 2) {
                            _status = 1
                        } else if (type == 3 && _user.user.isInCharge) {
                            _status = 4
                        } else if (type == 3) {
                            _status = 2
                        }
                        W.$ajax('mysql_api/update', {
                            json_p: { apply2_id: _g.applyid, status: _status },
                            update_json: { isagree: 1, sp_tm: now, uid: _user.user.objectId },
                            table: 'ga_spstatus'
                        }, function (res1) {
                            W.$ajax('mysql_api/create', {
                                json_p: append_spstatus,
                                table: 'ga_spstatus'
                            }, function (res2) {
                                sendmessage(_g.applyid, sendid, sendname, '', 2, function () {
                                    history.go(0)
                                })
                            })
                        })
                        // W.$ajax('mysql_api/update', {
                        //     json_p: { uid: _user.user.objectId },
                        //     update_json: { isagree: 1 },
                        //     table: 'ga_spstatus'
                        // }, function (res1) {
                        //     if (type == 2) {
                        //         // var _uid = '<' + _user.employee.uid + '|>' + _user.employee.uid
                        //         W.$ajax('mysql_api/delete', {
                        //             json_p: { id: deletefirst[0].id },
                        //             table: 'ga_spstatus'
                        //         }, function (res2) {
                        //             W.$ajax('mysql_api/create', {
                        //                 json_p: append_spstatus,
                        //                 table: 'ga_spstatus'
                        //             }, function (res2) {
                        //                 sendmessage(_g.applyid, sendid, sendname, '', 2, function () {
                        //                     sendmessage(_g.applyid, deletefirst[0].user[0].username, data.SQR, _user.employee.name + '已通过', 1, function () {
                        //                         history.go(0)
                        //                     })
                        //                 })
                        //             })
                        //         })
                        //     } else {
                        //         W.$ajax('mysql_api/create', {
                        //             json_p: append_spstatus,
                        //             table: 'ga_spstatus'
                        //         }, function (res2) {
                        //             sendmessage(_g.applyid, sendid, sendname, '', 2, function () {
                        //                 history.go(0)
                        //             })
                        //         })
                        //     }
                        // })
                    }

                })
            })
        }


        function sendmessage(id, userid, name, ti, type, callback) {
            var titles = ti || '车修申请'
            var str = 'http://jct.chease.cn' + '/fix_detail?applyid=' + id;
            if (type == 1) { //提交
                str += '&my=true'
            } else if (type == 2) { //审核
                str += '&auditing=true'
            }
            str += '&userid=' + userid
            var _desc = name + '维修申请'
            var _op_data = { touser: userid, title: titles, desc: _desc, url: str, remark: "查看详情" };
            $.ajax({
                url: 'http://h5.bibibaba.cn/send_qywx.php',
                data: _op_data,
                dataType: 'jsonp',
                crossDomain: true,
                success: function (re) {
                    callback()
                },
                error: function (err) {
                    // console.log(err)
                    callback()

                }
            })
        }



        $('#goback').on('click', function () {
            history.back();
        })
        $('#print').on('click', function () {
            // console.log(1)
            print()
        })

        function print() {
            var headstr = "<html><head><title></title></head><body><h1 style='text-align:center'>车修详情</h1>";
            var footstr = "</body>";
            var printData = document.getElementById("dvData").innerHTML;
            var oldstr = document.body.innerHTML;
            document.body.innerHTML = headstr + printData + footstr;
            console.log(document.body.innerHTML)
            window.print();
            document.body.innerHTML = oldstr;
            console.log()
            beta();
        }

    }

















    /**************************************华丽的分割线******************************************************** */
    function test() {
        var _g = W.getSearch();
        var _user = JSON.parse(localStorage.getItem('user'));
        var lc = {
            1: '维修申请',
            2: '科所队领导审批',
            3: '专管员审批',
            4: '警务保障室领导审批',
            6: '局领导审批',
            9: '维修信息录入',
            0: '待报销',
            A: '已结束'
        }
        var wx = {
            A: '发动机',
            B: '地盘',
            C: '电路',
            D: '轮胎',
            E: '外壳',
            Z: '其他',
        }
        var app_state = {
            0: '撤销',
            1: '审批中',
            4: '审批驳回',
            5: '待报销',
            6: '已结束'
        }
        var _HPZL = {
            '01': '大型汽车',
            '02': '小型汽车'
        }
        var _LB = {
            1: '工时费',
            2: '材料费'
        }
        function getApply() {
            W.ajax('/fix_apply/get_apply2', {
                data: { id: _g.applyid },
                success: function (res) {
                    // console.log(res,'2')
                    show_apply(res)
                }
            })
        }
        getApply()
        // $(".datepicker").datetimepicker({
        //     language: "zh-CN",
        //     autoclose: true,//选中之后自动隐藏日期选择框
        //     format: "yyyy-mm-dd",//日期格式
        //     minView: 2
        // });
        function show_apply(data) {
            console.log(data)
            var apply = data.apply2[0];
            var sp_status = data.spstatus[0].sp_status
            var wxlx = ''
            apply.WXLX.split('').forEach(ele => {
                wxlx += (wx[ele] + '、')
            })
            wxlx = wxlx.slice(0, -1)
            $('#HPHM').text(apply.HPHM);
            $('#HPZL').text(_HPZL[apply.HPZL])
            $('#YJJED').text(apply.YJJED)
            $('#WXLX').text(wxlx)
            $('#SQR').text(apply.SQR);
            $('#DEPT').text(apply.name);
            $('#SQSJ').text(W.dateToString(W.date(apply.SQSJ)));
            $('#STATE').text(app_state[apply.STATE]);
            $('#DQLC').text(lc[apply.DQLC]);
            $('#XGLC').text(lc[apply.XGLC]);
            $('#WXDW').text(apply.WXDW);
            $('#ZJE').text(apply.ZJE);
            !apply.JCRQ && sp_status == 1 ? $('#jcrq').show() : $('#JCRQ').text(apply.JCRQ)
            !apply.CCRQ && sp_status == 1 ? $('#ccsj').show() : $('#CCRQ').text(apply.CCRQ);
            $('#WXDWLXDH').text(apply.WXDWLXDH);
            !apply.JCRQ && sp_status == 1 ? $('#zjr').show() : $('#JZR').text(apply.JZR);
            // $('#wxdwdh').text(data.WXDWLXDH);
            // $('#_spstatus').text(app_state[data.STATE])
            apply.JCRQ ? $('#tjrq').hide() : $('#tjrq').show();
            show_repairinfo(data.repair_info)
            show_audit(data.spstatus)
            show_auditer(data)
        }


        function show_repairinfo(data) {
            console.log(data)
            $('#repair_info').empty();
            data.forEach((ele, index) => {
                var tr_content = `<tr class="info">
            <th>${_LB[ele.LB]}</th>
            <th>${ele.XMBH}</th>
            <th>${ele.XMMC} </th>
            <th>${ele.SL}</th>
            <th>${ele.DJ}</th>
            <th>${ele.JE}</th>
        </tr>`;
                $('#repair_info').append(tr_content)
            })

            $('#backout').on('click', function () {
                // var etm = ~~(new Date().getTime() / 1000)
                W.ajax('/fix_apply/update_apply2', {
                    data: { STATE: 0, DQLC: 'A', XGLC: 'A', id: _g.applyid, sp_status: 0 },
                    success: function (res) {
                        // history.go(0);
                        sendmessage(_g.applyid, _user.user.userid, data.SQR, '撤销成功')
                    }
                })
            })
        }
        //审核流程
        function show_audit(data) {
            $('#auditer').empty();
            data.forEach((ele, index) => {
                var isagree = ''
                ele.isagree ? ele.isagree == 1 ? isagree = '同意' : isagree = '驳回' : isagree = '审核中'

                var tr_content = `<tr class="tr_b_b1">
            <th>${ele.role}审批</th>
            <th>${isagree}</th>
            <th>${ele.name} </th>
            <th>${ele.advice ? ele.advice : ''}</th>
            <th>${W.dateToString(new Date((ele.scre_tm * 1000)))}</th>
        </tr>`
                $('#auditer').append(tr_content)
            })
        }


        function show_auditer(datas) {
            var data = datas.spstatus;
            var _spstatus = [];


            _status = 0;
            _sp_status = datas.spstatus[0].sp_status;

            if (_sp_status == 0 || _sp_status == 4) {//已撤销
                if (_g.my) {
                    $('#print_button').show();
                }
            } else if (_sp_status == 1) { //审核中
                if (_g.my) {
                    $('#my_button').show();
                } else if (_g.auditing) {
                    $('#other_button').show();
                }
            } else if (_sp_status == 5) { //通过

            }

            data.forEach(ele => {
                if (ele.role == '科所队领导') {
                    _spstatus[0] = ele
                } else if (ele.role == '警务保障室领导') {
                    _spstatus[1] = ele
                } else if (ele.role == '局领导') {
                    _spstatus[2] = ele
                } else if (ele.role == '管理员') {
                    _spstatus[0] = ele
                } else if (ele.role == '专管员') {
                    _spstatus[3] = ele
                }
            })
            data = _spstatus;

            var _res = datas;
            // var _href = './my_list?applyid=' + _res.apply2[0].XLH + '&my=' + true;
            var state = {
                STATE: 1,
                DQLC: 0,
                XGLC: 0,
                id: _res.apply2[0].XLH
            }
            var userid = '';
            var userid1 = '';
            var is_zgy = $('input[name="zgy1"]:checked').val();
            var username = _res.apply2[0].SQR
            console.log(is_zgy)
            if (_res.spstatus.length == 1) {
                state.sid = _res.spstatus[0].sid
                if (_user.user.role !== '科所队领导') {
                    $('#other_button').hide()
                }
                if (_res.spstatus[0].isagree) {
                    $('#other_button').hide()
                } else {
                    $('#other_button').show()
                }
                // $('#urge').on('click', function () {
                //     sendmessage(datas.apply2[0].XLH, datas.spstatus[0].userid, username, null, '已催办')
                // })

                $('#agree').on('click', function () {
                    state.STATE = 5;
                    state.DQLC = 0;
                    state.XGLC = 'A';
                    state.isagree = 1;
                    state.sp_status = 5;
                    W.ajax('/fix_apply/update_apply2_spstatus', {
                        data: { data: JSON.stringify(state) },
                        success: function (res) {
                            // history.go(0)
                            sendmessage(_res.apply2[0].XLH, _user.user.userid, username, '审批通过');
                        }
                    })
                })
                $('#reject').on('click', function () {
                    state.STATE = 4;
                    state.DQLC = 'A';
                    state.XGLC = 'A';
                    state.isagree = 2;
                    state.sp_status = 4;
                    W.ajax('/fix_apply/update_apply2_spstatus', {
                        data: { data: JSON.stringify(state) },
                        success: function (res) {
                            sendmessage(_res.apply2[0].XLH, _user.user.userid, username, '审批驳回');
                        }
                    })
                })

            } else if (_res.spstatus.length == 2) {
                if (!_res.spstatus[0].isagree) {
                    _userid = _res.spstatus[0].userid;
                    _userid1 = _res.spstatus[1].userid
                    state.DQLC = 4;
                    state.XGLC = 0;
                    state.sid = _res.spstatus[0].sid
                } else if (!_res.spstatus[1].isagree) {
                    state.STATE = 5
                    state.DQLC = 0;
                    state.XGLC = 'A';
                    state.sid = _res.spstatus[1].sid;
                    _userid = _res.spstatus[1].userid;
                    state.sp_status = 5;
                }

                // $('#urge').on('click', function () {
                //     sendmessage(_res.apply2[0].XLH, _userid, username, null, '已催办')
                // })

                $('#agree').on('click', function () {
                    var _senid = _res.apply2[0].XLH;
                    state.isagree = 1;
                    W.ajax('/fix_apply/update_apply2_spstatus', {
                        data: { data: JSON.stringify(state) },
                        success: function (res) {
                            if (_user.user.role == '警务保障室领导') {
                                sendmessage(_res.apply2[0].XLH, _user.user.userid, username, '审批通过');
                            } else {
                                sendmessage(_res.apply2[0].XLH, _userid1, username);
                            }
                        }
                    })
                })
                $('#reject').on('click', function () {
                    state.STATE = 4;
                    state.DQLC = 'A';
                    state.XGLC = 'A';
                    state.isagree = 2;
                    state.sp_status = 4;
                    W.ajax('/fix_apply/update_apply2_spstatus', {
                        data: { data: JSON.stringify(state) },
                        success: function (res) {
                            // console.log(res)
                            // history.go(0)
                            sendmessage(_res.apply2[0].XLH, _user.user.userid, username, '审批驳回');
                        }
                    })
                })


                if (_user.user.role == '科所队领导' || _user.user.role == '警务保障室领导') {
                    if (_user.user.role == '科所队领导' && _res.spstatus[0].isagree) {
                        $('#other_button').hide();
                    } else if (_user.user.role == '警务保障室领导') {
                        if (!_res.spstatus[0].isagree || _res.spstatus[1].isagree) {
                            $('#other_button').hide();
                        }
                    }
                }
                if (_res.apply2[0].STATE != 1 && _g.my) {
                    $('#my_button').hide();
                }
            } else if (_res.spstatus.length == 3 || _res.spstatus.length == 4) {
                if (!_res.spstatus[0].isagree) {
                    if (_user.user.role != '科所队领导') {
                        // $('#other_button').hide()
                    }
                    _userid = _res.spstatus[0].userid;
                    _userid1 = _res.spstatus[1].userid
                    state.DQLC = 4;
                    state.XGLC = 6;
                    state.sid = _res.spstatus[0].sid
                } else if (!_res.spstatus[1].isagree) {
                    // if()
                    if (_user.user.role != '警务保障室领导') {
                        // $('#other_button').hide()
                    }
                    state.DQLC = 6;
                    state.XGLC = 0;
                    state.sid = _res.spstatus[1].sid;
                    _userid = _res.spstatus[1].userid;
                    _userid1 = _res.spstatus[2].userid
                } else if (!_res.spstatus[2].isagree) {
                    if (_user.user.role != '局领导') {
                        // $('#other_button').hide()
                    }
                    state.STATE = 5
                    state.DQLC = 0;
                    state.XGLC = 'A';
                    state.sid = _res.spstatus[2].sid;
                    _userid = _res.spstatus[2].userid;
                    state.sp_status = 5;
                }
                if (_res.spstatus.length == 4) {
                    if (!_res.spstatus[3].isagree) {
                        if (_user.user.role != '专管员') {
                            // $('#other_button').hide()
                        }
                        _userid = _res.spstatus[3].userid;
                        _userid1 = _res.spstatus[2].userid
                        state.STATE = 1
                        state.DQLC = 6;
                        state.XGLC = 0;
                        state.sid = _res.spstatus[3].sid;
                    }
                }
                // $('#urge').on('click', function () {
                //     sendmessage(_res.apply2[0].XLH, _userid, username, null, '已催办')
                // })

                $('#agree').on('click', function () {
                    var _senid = _res.apply2[0].XLH;
                    is_zgy = $('input[name="zgy1"]:checked').val()
                    if (_user.user.role == '警务保障室领导' && is_zgy) {
                        state.DQLC = 3;
                        state.XGLC = 6;
                        state.spstatus = {
                            status: 4,
                            isagree: 0,
                            uid: 114,
                            cre_tm: ~~(new Date().getTime() / 1000),
                            apply2_id: _senid,
                            sp_status: 1
                        }
                        _userid1 = 'zg0038'
                    } else if (_user.user.role == '警务保障室领导') {
                        state.DQLC = 6;
                        state.XGLC = 0;
                        delete state.spstatus
                    }
                    state.isagree = 1;
                    console.log(state)
                    W.ajax('/fix_apply/update_apply2_spstatus', {
                        data: { data: JSON.stringify(state) },
                        success: function (res) {
                            // history.go(0);
                            // console.log(res)
                            if (_user.user.role == '局领导') {
                                sendmessage(_res.apply2[0].XLH, _user.user.userid, username, '审批通过');
                            } else {
                                sendmessage(_res.apply2[0].XLH, _userid1, username);
                            }
                            sendmessage(_res.apply2[0].XLH, _user.user.userid, username, '审批通过');
                        }
                    })
                })
                $('#reject').on('click', function () {
                    state.STATE = 4;
                    state.DQLC = 'A';
                    state.XGLC = 'A';
                    state.isagree = 2;
                    state.sp_status = 4;
                    W.ajax('/fix_apply/update_apply2_spstatus', {
                        data: { data: JSON.stringify(state) },
                        success: function (res) {
                            sendmessage(_res.apply2[0].XLH, _user.user.userid, username, '审批驳回');
                        }
                    })
                })

                if (_user.user.role == '科所队领导' || _user.user.role == '警务保障室领导' || _user.user.role == '局领导' || _user.user.role == "专管员") {
                    if (_user.user.role == '科所队领导' && _res.spstatus[0].isagree) {
                        $('#other_button').hide();
                    } else if (_user.user.role == '警务保障室领导' && _res.spstatus[1].isagree) {
                        $('#other_button').hide();
                    } else if (_user.user.role == '局领导' && _res.spstatus[2].isagree) {
                        $('#other_button').hide();
                    } else if (_user.user.role == '专管员') {
                        if (_res.spstatus[3]) {
                            if (_res.spstatus[3].isagree) {
                                $('#other_button').hide();
                            }
                        }
                    }
                    if (_user.user.role == '警务保障室领导' && !_res.spstatus[1].isagree) {
                        $('#zgy').show();
                    } else {
                        $('#zgy').hide();
                    }
                }
                if (_res.apply2[0].STATE != 1 && _g.my) {
                    $('#my_button').hide();
                }
            }
            if (_g.my) {
                $('#other_button').hide();
            }
            // if()
            var applyState = datas.apply2[0];
            console.log(applyState)
            if (applyState.STATE == 5 && _g.my) {
                $('#my_button').hide();
                $('#print_button').show();
            } else {
                $('#print_button').hide();
            }

        }
        $('#tjrq').on('click', function () {
            var tjrq_obj = {};
            tjrq_obj.jZR = $('#zjr').val();
            tjrq_obj.JCRQ = $('#jcrq').val();
            tjrq_obj.CCRQ = $('#ccsj').val();
            tjrq_obj.id = _g.applyid;
            if (!tjrq_obj.JCRQ) {
                weui.alert('请选择进厂时间');
                return false;
            }
            if (!tjrq_obj.CCRQ) {
                weui.alert('请选择出厂时间');
                return false;
            }
            W.ajax('/fix_apply/update_apply2', {
                data: tjrq_obj,
                success: function (res) {
                    // console.log(res)
                    history.go(0)
                }
            })
        })


        $('#goback').on('click', function () {
            history.back();
        })
        $('#print').on('click', function () {
            // console.log(1)
            print()
        })

        function print() {
            var headstr = "<html><head><title></title></head><body><h1 style='text-align:center'>车修详情</h1>";
            var footstr = "</body>";
            var printData = document.getElementById("dvData").innerHTML;
            var oldstr = document.body.innerHTML;
            document.body.innerHTML = headstr + printData + footstr;
            console.log(document.body.innerHTML)
            window.print();
            document.body.innerHTML = oldstr;
            console.log()

            $('#goback').on('click', function () {
                history.back();
            })
            $('#print').on('click', function () {
                // console.log(1)
                print()
            })
        }
        function sendmessage(id, userid, name, ti, alt) {
            var titles = ti || '车修申请'
            var str = 'http://jct.chease.cn' + '/fix_detail?applyid=' + id;
            if (alt) {
                str += '&my=true'
            }
            var _desc = name + '的车修'
            var _op_data = { touser: userid, title: titles, desc: _desc, url: str, remark: "查看详情" };
            $.ajax({
                "url": 'http://h5.bibibaba.cn/send_qywx.php',
                "data": _op_data,
                "type": "GET",
                "contentType": "application/json",
                "dataType": 'jsonp',
                "crossDomain": true,
                success: function (re) {
                    if (alt) {
                        weui.alert(alt, function () {
                            history.go(0);
                        })
                    } else {
                        history.go(0);
                    }
                },
                error: function (err) {
                    // console.log(err)
                    if (alt) {
                        weui.alert(alt, function () {
                            history.go(0);
                        })
                    } else {
                        history.go(0);
                    }
                }
            })
        }
    }


})