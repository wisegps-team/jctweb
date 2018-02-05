// $(document).ready(function () {
$(document).ready(function () {
    console.log(1)

    var _g = W.getSearch();
    var _user = JSON.parse(localStorage.getItem('user'));
    window._user = _user;
    if (_g.my) {
        $('#my_button').show();
        $('#other_button').hide();
        $('#show_clli')[0].style['margin-bottom'] = '60px'
    } else {
        $('#my_button').hide();
        $('#other_button').show();
    }

    var tjrq_obj = {};
    var lc = {
        2: '科所队领导审批',
        3: '专管员审批',
        4: '警务保障室领导审批',
        6: '局领导审批',
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
    //进厂日期
    $('#jcrq1').on('click', function () {
        var _year = new Date().getFullYear();
        var _mon = new Date().getMonth() + 1;
        var _day = new Date().getDate();
        var end_year = _year + 20;
        console.log(_mon)
        weui.datePicker({
            start: _year,
            end: end_year,
            defaultValue: [_year, _mon, _day],
            onChange: function (res) {
                console.log(res);
            },
            onConfirm: function (res) {
                // console.log(res);
                var dateString = res[0].value + '-' + res[1].value + '-' + res[2].value;
                tjrq_obj.JCRQ = dateString;
                console.log(dateString)
                $('#jcrq1 .weui-cell__ft').text(dateString);
                $('#jcrq1 .weui-cell__ft').css({ color: '#000' })
            },
            id: 'jcrq1'
        })
    })
    //出厂日期
    $('#ccrq1').on('click', function () {
        var _year = new Date().getFullYear();
        var _mon = new Date().getMonth() + 1;
        var _day = new Date().getDate();
        var end_year = _year + 20;
        console.log(_mon)
        weui.datePicker({
            start: _year,
            end: end_year,
            defaultValue: [_year, _mon, _day],
            onChange: function (res) {
                console.log(res);
            },
            onConfirm: function (res) {
                // console.log(res);
                var dateString = res[0].value + '-' + res[1].value + '-' + res[2].value;
                console.log(dateString)
                tjrq_obj.CCRQ = dateString;
                $('#ccrq1 .weui-cell__ft').text(dateString);
                $('#ccrq1 .weui-cell__ft').css({ color: '#000' })
            },
            id: 'ccrq1'
        })
    })

    W.ajax('/fix_apply/get_apply2', {
        data: { id: _g.applyid },
        success: function (res) {
            console.log(res, 2);
            show_apply(res.apply2[0]);
            show_auditer(res);
            show_repair(res.repair_info);
        }
    })

    function show_apply(data) {
        var hpzl;
        data.HPZL == 02 ? hpzl = '小型汽车' : hpzl = '大型汽车'
        var wxlx = ''
        data.WXLX.split('').forEach(ele => {
            wxlx += (wx[ele] + '、')
        })
        wxlx = wxlx.slice(0, -1)
        $('#name').text(data.SQR + '的车修')
        $('#sqsj').text(W.dateToString(W.date(data.SQSJ)))
        $('#hphm').text(data.HPHM);
        $('#hpzl').text(hpzl);
        $('#sqr').text(data.SQR);
        $('#yjje').text(data.YJJED);
        $('#wxlx').text(wxlx);
        $('#sqbm').text(data.name);
        $('#zje').text(data.ZJE);
        $('#dqlc').text(lc[data.DQLC]);
        $('#xglc').text(lc[data.XGLC]);
        $('#wxdw').text(data.WXDW);
        $('#wxdwdh').text(data.WXDWLXDH);
        $('#_spstatus').text(app_state[data.STATE])
        if (data.CCRQ) {
            $('#push_detail').show();
            $('#tjrq').hide();
            $('#jccsj').hide();
            $('#jcrq').text(data.JCRQ);
            $('#ccrq').text(data.CCRQ);
            $('#jzr_1').text(data.JZR);
            $('#jsr_1').text(data.JSR);
        } else {
            $('#tjrq').show();
            if (_g.my) {
                $('#jccsj').show();
            } else {
                $('#jccsj').hide();
            }
            $('#push_detail').hide();
        }
        $('#show_detail').show();
        if (data.STATE == 1 && _g.my) {
            $('#my_button').show();
        } else {
            $('#my_button').hide();
        }

        $('#backout').on('click', function () {
            // var etm = ~~(new Date().getTime() / 1000)
            W.ajax('/fix_apply/update_apply2', {
                data: { STATE: 0, DQLC: 'A', XGLC: 'A', id: _g.applyid, sp_status: 0 },
                success: function (res) {
                    sendmessage(_g.applyid, _user.user.userid, data.SQR, '撤销成功')
                }
            })
        })
    }

    function show_auditer(datas) {
        var data = datas.spstatus;
        var _spstatus = [];
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
        data.forEach(ele => {
            var icon = !ele.isagree ? '<i class="weui-icon-circle f14 flow_agree_icon"></i>' : ele.isagree == 1 ? '<i class="weui-icon-success f14 flow_agree_icon"></i>' : '<i class="weui-icon-cancel f14 flow_agree_icon"></i>'
            var aud = !ele.isagree ? '·审批中' : ele.isagree == 1 ? '·已通过' : '·驳回'
            var tr_content = `
            <div class="weui-flex">
            <div class="weui-flex__item">
                <div class="weui-cell weui-cell_access p_0 ">
                    <div class="flow_agree weui-media-box_text w_100">
                        `+ icon + `
                        <img src="./js/merge/img/1.png" class="small_img">
                        <span class="f_w_7 ">`+ ele.name + aud + `</span>
                    </div>
                </div>
            </div>
        </div>`
            $('#auditer').append(tr_content);
        })
        $('#show_auditer').show();


        // if (data.length == 1) {

        // } else if (data.length == 3 || data.length == 4) {
        //     // if ()
        // }
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
            $('#urge').on('click', function () {
                sendmessage(datas.apply2[0].XLH, datas.spstatus[0].userid, username, null, '已催办')
            })

            $('#agree').on('click', function () {
                // var etm = 
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
                // getJson('./agree_apply', function (res) {
                //     // console.log(res)
                //     sendmessage(_res.apply2[0].XLH, _res.apply2[0].userid, username, '审批通过');
                //     // history.go(0)

                // }, state)
            })
            $('#reject').on('click', function () {
                // var re_etm = ~~(new Date().getTime() / 1000);
                state.STATE = 4;
                state.DQLC = 'A';
                state.XGLC = 'A';
                state.isagree = 2;
                state.sp_status = 4;
                W.ajax('/fix_apply/update_apply2_spstatus', {
                    data: { data: JSON.stringify(state) },
                    success: function (res) {
                        // history.go(0)
                        sendmessage(_res.apply2[0].XLH, _user.user.userid, username, '审批驳回');
                    }
                })
                // getJson('./agree_apply', function (res) {
                //     console.log(res)
                //     sendmessage(_res.apply2[0].aid, _res.apply2[0].userid, username, '审批驳回');
                //     // history.go(0)
                // }, { id: res.spstatus[0].sid, isagree: 2, applyid: res.apply[0].aid, etm: re_etm })
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

            $('#urge').on('click', function () {
                sendmessage(_res.apply2[0].XLH, _userid, username, null, '已催办')
            })

            $('#agree').on('click', function () {
                var _senid = _res.apply2[0].XLH;
                state.isagree = 1;
                W.ajax('fix_apply/update_apply2_spstatus', {
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
                W.ajax('fix_apply/update_apply2_spstatus', {
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
                } else if (_user.user.role == '警务保障室领导' && _res.spstatus[1].isagree) {
                    $('#other_button').hide();
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
            $('#urge').on('click', function () {
                sendmessage(_res.apply2[0].XLH, _userid, username, null, '已催办')
            })

            $('#agree').on('click', function () {
                var _senid = _res.apply2[0].XLH;
                is_zgy = $('input[name="zgy1"]:checked').val()
                if (_user.user.role == '警务保障室领导' && is_zgy == 1) {
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
                W.ajax('fix_apply/update_apply2_spstatus', {
                    data: { data: JSON.stringify(state) },
                    success: function (res) {
                        // console.log(res)
                        if (_user.user.role == '局领导') {
                            sendmessage(_res.apply2[0].XLH, _user.user.userid, username, '审批通过');
                        } else {
                            sendmessage(_res.apply2[0].XLH, _userid1, username);
                        }
                        // sendmessage(_res.apply2[0].XLH, _user.user.userid, username, '审批通过')/;
                    }
                })
            })
            $('#reject').on('click', function () {
                state.STATE = 4;
                state.DQLC = 'A';
                state.XGLC = 'A';
                state.isagree = 2;
                state.sp_status = 4;
                W.ajax('fix_apply/update_apply2_spstatus', {
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
    }

    function show_repair(data) {
        $('#show_clli').empty();
        data.forEach((ele, index) => {
            var _lb;
            ele.LB == 1 ? _lb = '工时费' : _lb = '材料费'
            var tr_content = `
            <a class="weui-cell weui-cell_access cell" href="javascript:;" style="padding:0;line-height:3" id="xq_${index}">
                <div class="weui-cell__bd" style="flex:1">
                    <div class="placeholder t_a_c">${_lb}</div>
                </div>
                <div class="weui-cell__bd slh">
                    <div class="placeholder t_a_c slh">${ele.XMMC}</div>
                </div>
                <div class="weui-cell__bd">
                    <div class="placeholder t_a_c">${ele.JE}</div>
                </div>
            </a>
        </div>`


            $('#show_clli').append(tr_content);
            $('#xq_' + index).on('click', function () {
                // console.log(index)
                $('#container').hide();
                $('#repair_info').show();
                // if(!_g.my){
                //     $('#my_button').hide();
                // }
                var state = { 'page_id': 1, 'user_id': 5 };
                var title = '明细详情';
                var url = 'fix_details#details_' + index;
                history.pushState(state, title, url);
                window.addEventListener('popstate', function (e) {
                    $('#container').show();
                    $('#repair_info').hide();
                    history.go(0)
                    // if(_g.my){
                    //     $('#my_button').show();
                    // }

                });
                var _thisArr = data[index];
                var _lb1;
                _thisArr.LB == 1 ? _lb = '工时费' : _lb = '材料费'
                $('#detail_xmbh').val(_thisArr.XMBH);
                $('#detail_xmmc').val(_thisArr.XMMC);
                $('#detail_lb').val();
                $('#detail_sl').val(_thisArr.SL);
                $('#detail_dj').val(_thisArr.DJ);
                $('#detail_je').val(_thisArr.JE)

            })
        });
        if (data.length) {
            $('#show_clli').prepend(`<div class="weui-flex" style="background:#ececec;line-height:3">
            <div class="weui-flex__item">
                <div class="placeholder t_a_c">类别</div>
            </div>
            <div class="weui-flex__item">
                <div class="placeholder t_a_c">材料名称</div>
            </div>
            <div class="weui-flex__item">
                <div class="placeholder t_a_c">金额</div>
            </div>
        </div>`);
            // $('#show_clli').show();
        }
    }

    $('#tjrq').on('click', function () {
        tjrq_obj.jZR = $('#jzr').val();
        tjrq_obj.JSR = $('#jsr').val();
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
                console.log(res)
                history.go(0)
            }
        })
    })




    function sendmessage(id, userid, name, ti, alt) {
        var titles = ti || '车修申请'
        var str = 'http://jct.chease.cn' + '/fix_detail?applyid=' + id;
        if (alt) {
            str += '&my=true'
        }
        var _desc = name + '的车修'
        var _op_data = { touser: userid, title: titles, desc: _desc, url: str, remark: "查看详情" };
        $.ajax({
            url: 'http://h5.bibibaba.cn/send_qywx.php',
            data: _op_data,
            dataType: 'jsonp',
            crossDomain: true,
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
})