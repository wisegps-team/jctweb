$(document).ready(function () {


    function beta122() {
        var _g = W.getSearch();
        var _type = _g.type
        var _user = JSON.parse(sessionStorage.getItem('user'));
        W.setCookie('types', _g.type)
        var vehicleCaptain = null;
        var sendname = null;
        var senduserid = null;
        var companyId = $.cookie('dealer_id')
        // var driver = '';
        var driver = '';
        var driver_tel = '';
        var driver_message = {};
        var name_tel = '';
        var allCar = [];
        var allDriver = [];
        var car = '';
        var status = defalut.use.status;
        var estatus = defalut.use.estatus
        var role = {
            9: '普通成员',
            12: '部门领导',
            13: '公司领导'

        }

        if (_user) {
            mainContral(_user)
        } else {
            _user = {};
            if (_g.userid) {
                $.ajax({
                    url: '/login',
                    data: { password: hex_md5('123456') },
                    success: function (res) {
                        W.setCookie('dev_key', res.wistorm.dev_key);
                        W.setCookie('app_key', res.wistorm.app_key);
                        W.setCookie('app_secret', res.wistorm.app_secret);
                        W.setCookie('auth_code', res.access_token);
                        wistorm_api.getUserList({ username: _g.userid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                            if (json.data[0]) {
                                _user.user = json.data[0];
                                wistorm_api._list('employee', { uid: _user.user.objectId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                                    _user.employee = emp.data[0];
                                    if (emp.data[0]) {
                                        if (emp.data[0].roleId) {
                                            wistorm_api._list('role', { objectId: emp.data[0].roleId }, '', '-createdAt', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), false, function (roles) {
                                                // console.log(roles)
                                                _user.employee.rolename = roles.data[0] ? roles.data[0].name : '';
                                                wistorm_api._list('department', { objectId: _user.employee.departId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                                                    _user.depart = dep.data[0];
                                                    mainContral(_user)
                                                })
                                            })
                                        } else {
                                            wistorm_api._list('department', { objectId: _user.employee.departId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                                                _user.depart = dep.data[0];
                                                mainContral(_user)
                                            })
                                        }
                                    }
                                })
                            } else {
                                top.location = '/login1'
                            }
                        })
                    }
                })
            }
        }

        function mainContral(user) {
            console.log(user, 'user')
            sessionStorage.setItem('user', JSON.stringify(user));
            //获取车队队长信息
            GetVehicleCaptain(user);
            //获取申请信息
            GetApplyMessage(user);


        }

        function GetApplyMessage(user) {
            W.$ajax('mysql_api/list', {
                json_p: { id: _g.applyid },
                table: 'ga_apply'
            }, function (res) {
                wistorm_api._list('vehicle', { name: res.data[0].car_num }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (vvv) {
                    res.data[0].cart = vvv.data[0];
                    wistorm_api._list('department', { objectId: res.data[0].depart }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                        res.data[0].departName = dep.data[0];
                        wistorm_api.getUserList({ objectId: res.data[0].uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                            res.data[0].user = json.data[0];
                            console.log(res, 'res')
                            W.$ajax('mysql_api/list', {
                                json_p: { apply_id: res.data[0].id },
                                table: 'ga_spstatus',
                                sorts: 'status'
                            }, function (sps) {
                                if (sps.data.length) {
                                    var i = 0;
                                    sps.data.forEach(ele => {
                                        wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json1) {
                                            ele.user = json1.data[0];
                                            wistorm_api._list('employee', { uid: ele.uid }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp1) {
                                                ele.employee = emp1.data[0]
                                                if (ele.employee) {
                                                    wistorm_api._list('role', { objectId: ele.employee.roleId || '' }, '', '-createdAt', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), false, function (roles) {
                                                        i++;
                                                        ele.employee.rolename = roles.data[0] ? roles.data[0].name : '';
                                                        if (i == sps.data.length) {
                                                            res.data[0].spstatus = sps.data;
                                                            // console.log(res.data[0],'ddff')
                                                            showMesssage(res.data[0])
                                                        }
                                                    })
                                                } else {
                                                    i++;
                                                    if (i == sps.data.length) {
                                                        res.data[0].spstatus = sps.data;
                                                        // console.log(res.data[0],'ddff')
                                                        showMesssage(res.data[0])
                                                    }
                                                }

                                            })

                                        })
                                    })
                                } else {
                                    res.data[0].spstatus = []
                                    showMesssage(res.data[0])
                                }
                            })
                        })
                    })
                })

            })
        }
        function GetVehicleCaptain(user) {
            wistorm_api._list('department', { name: '车队', uid: companyId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                console.log(dep, 'dep')
                wistorm_api._list('employee', { departId: dep.data[0].objectId, role: '12|13' }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                    console.log(emp, 'emmp')
                    var i = 0;
                    emp.data.forEach(ele => {
                        wistorm_api._list('role', { objectId: ele.roleId }, '', '-createdAt', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), false, function (roles) {
                            ele.rolename = roles.data ? roles.data[0].name : '';
                            wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                                ele.user = json.data[0];
                                i++;
                                if (i == emp.data.length) {
                                    vehicleCaptain = emp.data;
                                    console.log(vehicleCaptain, 'vehiclecaptaion')
                                }
                            })
                        })
                    })
                })
            })
        }
        function GetSQRMessage(uid) {
            wistorm_api._list('employee', { uid: uid }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                // return emp.data[0];
                name_tel = emp.data[0].name + '(' + emp.data[0].tel + (emp.data[0].wechat ? '(' + emp.data[0].wechat + ')' : '') + ')'
            })
        }

        function GetDriverUserName(uid) {
            wistorm_api.getUserList({ objectId: uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                driver_message = json.data[0];
                console.log(driver_message, 'message')
            })
        }

        function showMesssage(data) {
            console.log(data);
            console.log(vehicleCaptain, 'vehicle')
            // var applystatus = data.spstatus[0].sp_status
            sendname = data.name
            // $('#name').text(data.name)
            // $('#dqlc').text(estatus[data.estatus])
            // $('#address').text(data.address || '');
            // $('#days').text(data.days || '');
            // $('#peer').text(data.peer || '');
            // $('#province').text(data.province || '');
            // $('#night').text(data.night ? '是' : '否');
            // $('#car_num').text(data.car_num || '');
            // $('#driver').text(data.driver == 3 ? '' : data.driver);
            if (data.estatus != 8) {
                $('#cl').text(data.car_num || '')
                $('#jsy').text(data.driver || '')
            }
            $('#dqlc').text(estatus[data.estatus])
            $('#days').text(data.days || '')
            $('#peer').text(data.peer || '');
            $('#sqr').text(data.name || '');
            $('#sqsj').text(W.dateToString(new Date((data.cre_tm * 1000))));
            $('#sqbm').text(data.departName.name || '');
            $('#night').text(data.night ? '是' : '否');
            $('#dz').text(data.province || '');
            $('#address').text(data.address || '');
            $('#container').show();
            // var span_status = `<span class="weui-badge great  chang_f12" style="margin-left: 5px;" id="_spstatus">${status[data.sp_status || 6]}</span>`
            // $('#_spstatus_1').empty();
            // $('#_spstatus_1').append(span_status);
            GetSQRMessage(data.uid)
            ShowAuditer(data.spstatus); //显示审核列表
            Operation(data) //具体操作
            // debugger;
            // var use_status = '';

        }

        function ShowAuditer(data) {
            $('#auditer').empty();

            data.forEach(ele => {
                if (ele.isagree == 0) {
                    senduserid = ele.user ? ele.user.username : '';
                }
                var isagree = ''
                ele.isagree ? ele.isagree == 1 ? isagree = '同意' : isagree = '驳回' : isagree = '审核中';
                var tr_content = `<tr class="tr_b_b1">
                    <th>${defalut.userole[ele.status]}审批</th>
                    <th>${isagree}</th>
                    <th>${ele.employee ? ele.employee.name : ''} </th>
                    <th>${ele.advice ? ele.advice : ''}</th>
                    <th>${W.dateToString(new Date((ele.cre_tm * 1000)))}</th>
                </tr>`
                $('#auditer').append(tr_content);
            })
        }

        function showCarDriver() { //获取车队司机和车辆
            wistorm_api._list('vehicle', { departId: 58 }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (veh) {
                var i = 0;
                if (veh.data.length) {
                    veh.data.forEach(ele => {
                        if (ele.status == 1) { //出车
                            W.$ajax('mysql_api/list', {
                                table: 'ga_apply',
                                json_p: { car_num: ele.name, etm: 0, sp_status: '5' },
                                sorts: '-id'
                            }, function (res) {
                                ele.apply = res.data[0];
                                if (res.data[0]) {
                                    wistorm_api._list('employee', { name: res.data[0].name }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                                        i++;
                                        ele.driverMessage = emp.data[0];
                                        if (i == veh.data.length) {
                                            show_car(veh.data)
                                        }
                                    })
                                } else {
                                    i++;
                                    if (i == veh.data.length) {
                                        show_car(veh.data)
                                    }
                                }
                            })
                        } else {
                            i++;
                            if (i == veh.data.length) {
                                show_car(veh.data)
                            }
                        }
                    })
                } else {
                    show_car(veh.data)
                }

            })
            wistorm_api._list('employee', { departId: 58, role: 9 }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                var i = 0;
                if (emp.data.length) {
                    emp.data.forEach(ele => {
                        // if (ele.status == 1) { //出车
                        W.$ajax('mysql_api/list', {
                            table: 'ga_apply',
                            json_p: { driver: ele.name, etm: 0, sp_status: 5 },
                            sorts: '-id'
                        }, function (res) {
                            ele.apply = res.data[0];
                            i++;
                            if (i == emp.data.length) {
                                show_driver(emp.data)
                            }
                        })
                    })
                } else {
                    show_driver(emp.data)
                }
            })
            function show_car(res) {
                allCar = res;
                console.log(res, 'car')
                var car_data = [];
                // var user_car = [];
                $('#select_car').empty();
                res.forEach((ele, index) => {
                    var op = {};
                    if (ele.status == 1) {
                        ele.apply && ele.driverMessage ? op.label = ele.name + '(' + ele.apply.name + ele.driverMessage.tel + ')' : ele.apply ? op.label = ele.name + '(' + ele.apply.name + ')' : op.label = ele.name;
                    } else {
                        op.label = ele.name
                    }
                    op.value = ele.objectId;
                    var content = `<option value=${op.label}>${op.label}</option>`;
                    $('#select_car').append(content)
                    // car_data.push(op);
                    // ele.status == 0 ? user_car.push(ele) : null
                })
            }
            function show_driver(res) {
                allDriver = res;
                console.log(res, 'res')
                var driver_data = [];
                $('#select_driver').empty();
                if (res.length) {
                    var _thisDriver = res[0]
                    driver_tel = _thisDriver.name + '(' + _thisDriver.tel + (_thisDriver.wechat ? '(' + _thisDriver.wechat + ')' : '') + ')'
                    GetDriverUserName(_thisDriver.uid)
                    console.log(driver_tel);
                }
                res.forEach((ele, index) => {
                    var op = {};
                    ele.apply ? op.label = ele.name + '(' + ele.apply.car_num + ')' : op.label = ele.name;
                    // op.label = ele.name
                    op.value = index;
                    var content = `<option value=${op.value}>${op.label}</option>`;
                    $('#select_driver').append(content)
                })
            }
        }

        $('#select_driver').on('change', function () {
            // console.log(this.value)
            var _thisDriver = allDriver[this.value]
            driver_tel = _thisDriver.name + '(' + _thisDriver.tel + (_thisDriver.wechat ? '(' + _thisDriver.wechat + ')' : '') + ')'
            console.log(driver_tel);

            GetDriverUserName(_thisDriver.uid)
        })

        function Operation(data) {
            console.log(data)
            var s_status = 0;
            if (_g.my && data.sp_status == 1) {
                $('#my_button').show();
                if (data.spstatus.length) {
                    if (data.spstatus[0].isagree == 0) {
                        $('#resubmit').show(); //重新提交
                    } else {
                        $('#backout').parent().hide() //撤销
                    }
                }
            }
            if (_g.auditing && data.sp_status == 1) { //审核中
                if (data.estatus == 2) {
                    if (_user.employee.role == 12 && _user.employee.departId == data.depart && (!_user.employee.rolename || _user.employee.rolename == '部门领导')) {
                        s_status = 1
                        $('#other_button').show();
                    }
                } else if (data.estatus == 4) {
                    if (_user.employee.role == 12 && _user.employee.rolename == '警务保障室领导') {
                        s_status = 2
                        $('#other_button').show();
                    }
                } else if (data.estatus == 6) {
                    if (_user.employee.role == 13) {
                        s_status = 3
                        $('#other_button').show();
                    }
                }
            }

            if (_g.vehicleManage && data.sp_status == 5) { //车队还车或者归还车辆
                if (data.estatus == 8) {
                    // showCarDriver()
                    // $('#pcar_driver').show();
                    $('#select_driver').show();
                    $('#select_car').show();
                    $('#other_vehicle_send').show();
                    showCarDriver()
                } else if (data.estatus == 9) {
                    $('#vehicle_back').show()
                }
            }
            if (_g.my && data.sp_status == 5) { //申请人还车或者催车队还车
                if (data.estatus == 7) {
                    $('#my_back_car').show()
                } else if (data.estatus == 8) {

                } else if (data.estatus == 9) {
                    $('#call_vechicle_back').show();
                }
            }

            if (_g.my && data.sp_status == 6) {
                $('#print_button').show();
            }

            if (_g.delete) {
                $('#delete_button').show();
            }


            AllToast(data, s_status)






        }

        //按钮控制
        function AllToast(data, s_status) {
            console.log(data, 'toast_button');
            // weui.alert
            $('#delete_button').on('click', function () {
                weui.confirm('确认删除', function () {
                    W.$ajax('mysql_api/delete', {
                        table: 'ga_apply',
                        json_p: { id: _g.applyid }
                    }, function (res) {
                        W.$ajax('mysql_api/delete', {
                            table: 'ga_spstatus',
                            json_p: { apply_id: _g.applyid }
                        }, function (res1) {
                            if (data.sp_status == 1 || data.sp_status == 5) {
                                wistorm_api._update('vehicle', { name: data.car_num }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                                    history.back();
                                })
                            }else {
                                history.back(); 
                            }
                        })
                    })
                })

            })

            $('#urge').on('click', function () {  //催办
                var option1 = {};
                var type = 0;
                if (data.estatus == 2) {
                    option1 = { objectId: _user.employee.departId, uid: companyId }
                    type = 1
                } else if (data.estatus == 4) {
                    option1 = { isSupportDepart: true, uid: companyId }
                    type = 2
                } else if (data.estatus == 6) {
                    option1 = { name: '局领导', uid: companyId }
                    type = 3
                }
                getAuditers(option1, type, true)
            })

            //撤销
            $('#backout').on('click', function () {
                var etm = ~~(new Date().getTime() / 1000)
                W.$ajax('mysql_api/update', {
                    json_p: { id: _g.applyid },
                    update_json: { etm: etm, estatus: 0, is_sh: 2, sp_status: 0 },
                    table: 'ga_apply'
                }, function (res) {
                    console.log(res)
                    W.$ajax('mysql_api/update', {
                        json_p: { apply_id: _g.applyid },
                        update_json: { sp_status: 0 },
                        table: 'ga_spstatus'
                    }, function (u_s) {
                        console.log(u_s)
                        wistorm_api._update('vehicle', { name: data.car_num }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                            console.log(veh)
                            sendmessage(_g.applyid, data.user.username, sendname, '撤销成功', 1, '', function () {
                                history.go(0)
                            })
                        });
                    })
                })
            })
            //同意
            $('#agree').on('click', function () {
                var apply_ujson = { is_sh: 2, sp_status: 5 };
                if (data.use_type == 3) {
                    apply_ujson.estatus = 8;
                } else {
                    apply_ujson.estatus = 7;
                }
                if (data.status == 1) { //一级审批
                    var etm = ~~(new Date().getTime() / 1000)
                    W.$ajax('mysql_api/update', {
                        json_p: { id: _g.applyid },
                        update_json: apply_ujson,
                        table: 'ga_apply'
                    }, function (res) {
                        console.log(res)
                        W.$ajax('mysql_api/update', {
                            json_p: { apply_id: _g.applyid, status: s_status },
                            update_json: { isagree: 1, sp_status: 5, uid: _user.employee.uid },
                            table: 'ga_spstatus'
                        }, function (us) {
                            if (data.use_type != 3) {
                                sendmessage(_g.applyid, data.user.username, sendname, '审核通过', 1, '', function () {
                                    history.go(0)
                                })
                            } else {
                                var i = 0;
                                vehicleCaptain.forEach(ele => {
                                    sendmessage(_g.applyid, ele.user.username, sendname, '派车申请', 3, '', function () {
                                        i++;
                                        if (vehicleCaptain.length == i) {
                                            sendmessage(_g.applyid, data.user.username, sendname, '审核通过', 1, '', function () {
                                                history.go(0)
                                            })
                                        }
                                    })
                                })
                            }
                        })
                    })
                } else if (data.status == 3) { //三级审批
                    if (_user.employee.role == 13) { //局领导
                        W.$ajax('mysql_api/update', {
                            json_p: { id: _g.applyid },
                            update_json: apply_ujson,
                            table: 'ga_apply'
                        }, function (res) {
                            W.$ajax('mysql_api/update', {
                                json_p: { apply_id: _g.applyid, status: s_status },
                                update_json: { isagree: 1, uid: _user.employee.uid },
                                table: 'ga_spstatus'
                            }, function (res1) {
                                W.$ajax('mysql_api/update', {
                                    json_p: { apply_id: _g.applyid },
                                    update_json: { sp_status: 5 },
                                    table: 'ga_spstatus'
                                }, function (res2) {
                                    debugger;
                                    if (data.use_type != 3) {
                                        sendmessage(_g.applyid, data.user.username, sendname, '审核通过', 1, function () {
                                            history.go(0)
                                        })
                                    } else {
                                        var i = 0;
                                        vehicleCaptain.forEach(ele => {
                                            sendmessage(_g.applyid, ele.user.username, sendname, '派车申请', 3, '', function () {
                                                i++;
                                                if (vehicleCaptain.length == i) {
                                                    sendmessage(_g.applyid, data.user.username, sendname, '审核通过', 1, '', function () {
                                                        history.go(0)
                                                    })
                                                }
                                            })
                                        })
                                    }
                                })
                            })
                        })

                    } else if (_user.employee.role == 12) { //科所队领导
                        if (data.estatus == 2) { //警务保障室领导
                            var option1 = { isSupportDepart: true, uid: companyId }
                            getAuditers(option1, 2)

                        } else if (data.estatus == 4) { //局领导
                            var option1 = { name: '局领导', uid: companyId }
                            getAuditers(option1, 3)

                        }
                    }
                }
            })
            //驳回
            $('#reject').on('click', function () {
                var etm = ~~(new Date().getTime() / 1000)
                W.$ajax('mysql_api/update', {
                    json_p: { id: _g.applyid },
                    update_json: { etm: etm, estatus: 0, is_sh: 2, sp_status: 4 },
                    table: 'ga_apply'
                }, function (res) {
                    console.log(res)
                    W.$ajax('mysql_api/update', {
                        json_p: { apply_id: _g.applyid, status: s_status },
                        update_json: { isagree: 2 },
                        table: 'ga_spstatus'
                    }, function (us) {
                        console.log(us)
                        W.$ajax('mysql_api/update', {
                            json_p: { apply_id: _g.applyid },
                            update_json: { sp_status: 0, },
                            table: 'ga_spstatus'
                        }, function (u_s) {
                            console.log(u_s)
                            wistorm_api._update('vehicle', { name: data.car_num }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                                console.log(veh)
                                sendmessage(_g.applyid, data.user.username, sendname, '申请驳回', 1, '', function () { //通知申请人
                                    history.go(0)
                                })
                            });
                        })
                    })
                })
            })


            //车队还车
            $('#vehicle_back').on('click', function () {
                debugger;
                var etm = ~~(new Date().getTime() / 1000)
                W.$ajax('mysql_api/update', {
                    json_p: { id: _g.applyid },
                    update_json: { estatus: 'A', etm: etm, sp_status: 6 },
                    table: 'ga_apply'
                }, function (res) {
                    console.log(res)
                    W.$ajax('mysql_api/update', {
                        json_p: { apply_id: _g.applyid },
                        update_json: { sp_status: 6 },
                        table: 'ga_spstatus'
                    }, function (us) {
                        wistorm_api._update('vehicle', { name: data.car_num }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                            console.log(veh)
                            sendmessage(_g.applyid, data.user.username, sendname, '还车成功', 1, '', function () { //通知申请人还车成功
                                history.go(0)
                            })
                        });
                    })
                })

            })
            //用于我还车
            $('#my_back_car').on('click', function () {
                var etm = ~~(new Date().getTime() / 1000)
                W.$ajax('mysql_api/update', {
                    json_p: { id: _g.applyid },
                    update_json: { estatus: 'A', etm: etm, sp_status: 6 },
                    table: 'ga_apply'
                }, function (res) {
                    console.log(res)
                    W.$ajax('mysql_api/update', {
                        json_p: { apply_id: _g.applyid },
                        update_json: { sp_status: 6 },
                        table: 'ga_spstatus'
                    }, function (us) {
                        wistorm_api._update('vehicle', { name: data.car_num }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                            console.log(veh)
                            sendmessage(_g.applyid, data.user.username, sendname, '还车成功', 1, '', function () {
                                history.go(0)
                            })
                        });
                    })
                })
            })
            //派车
            $('#other_vehicle_send').on('click', function () {
                debugger;
                var driver = allDriver[$('#select_driver').val()].name;

                var car = $('#select_car').val();
                if (!driver) {
                    weui.alert('请选择司机');
                    return;
                }
                if (data.role != '局领导') {
                    if (!car) {
                        weui.alert('请选择车辆');
                        return;
                    }
                }

                W.$ajax('mysql_api/update', {
                    json_p: { id: _g.applyid },
                    update_json: { driver: driver, car_num: car, estatus: 9 },
                    table: 'ga_apply'
                }, function (ga) {
                    wistorm_api._update('vehicle', { name: car }, { status: 1 }, W.getCookie('auth_code'), true, function (veh) {
                        // sendmessage(_g.applyid, data.user.username, sendname, '车队已派车', 1, function () {
                        //     history.go(0)
                        // })
                        driver_tel = '\n驾驶员' + driver_tel
                        sendmessage(_g.applyid, data.user.username, sendname, '车队已派车', 1, driver_tel, function () { //发送给申请人
                            // history.go(0)
                            name_tel = '\n' + data.role + name_tel
                            sendmessage(_g.applyid, driver_message.username, sendname, '车队派车', 1, name_tel, function () { //发送给驾驶员
                                history.go(0)
                            })
                        })
                    })
                })
            })
            //通知车队还车
            $('#call_vechicle_back').on('click', function () {
                weui.alert('已通知车队还车', function () {
                    // vehicleCaptain
                    vehicleCaptain.forEach(ele => {
                        sendmessage(_g.applyid, ele.user.username, sendname, '还车申请', 3, '', function () {

                        })
                    })
                })
            })


        }

        function getAuditers(option1, type, isagain) {
            wistorm_api._list('department', option1, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                var option2 = { departId: dep.data[0].objectId }
                option2.role = (type == 2 || type == 1) ? 12 : 13;
                wistorm_api._list('employee', option2, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                    var i = 0;
                    emp.data.forEach(ele => {
                        wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                            ele.user = json.data[0]
                            wistorm_api._list('role', { objectId: ele.roleId }, '', '-createdAt', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), false, function (roles) {
                                ele.rolename = roles.data ? roles.data[0].name : '';
                                i++;
                                if (i == emp.data.length) {
                                    selectAuditer(emp.data, type, isagain)
                                }
                            })
                        })
                    })
                })
            })
        }


        function selectAuditer(data, type, isagain) {
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
                            <img src="js/merge/img/1.png" style="width: 50px;display: block">
                        </div>
                        <div class="weui-cell__bd">
                            <label for=${_id}>
                                <p>${ele.name}</p>
                                <p style="font-size: 13px;color: #888888;">${ele.rolename || role[ele.role]}</p>
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
                apply_id: _g.applyid,
                sp_status: 1
            }
            append_spstatus.status = type;
            $('#androidDialog1').fadeIn(200);
            $('#audit_cancle').on('click', function () {
                $('#androidDialog1').fadeOut(200);
            })
            $('#audit_commit').on('click', function () {
                if (!isagain) {
                    debugger;
                    console.log(append_spstatus, 'spstatus')
                    var update_json = {};
                    if (type == 2) {
                        update_json.estatus = 4;
                    } else if (type == 3) {
                        update_json.estatus = 6;
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
                    debugger;
                    W.$ajax('mysql_api/update', {
                        json_p: { id: _g.applyid },
                        update_json: update_json,
                        table: 'ga_apply'
                    }, function (res) {

                        var _status = '';
                        var now = ~~(new Date().getTime() / 1000)
                        if (type == 2) {
                            _status = 1
                        } else if (type == 3) {
                            _status = 2
                        }
                        W.$ajax('mysql_api/update', {
                            json_p: { apply_id: _g.applyid, status: _status },
                            update_json: { isagree: 1, sp_tm: now, uid: _user.user.objectId },
                            table: 'ga_spstatus'
                        }, function (res1) {
                            W.$ajax('mysql_api/create', {
                                json_p: append_spstatus,
                                table: 'ga_spstatus'
                            }, function (res2) {
                                var _i = 0;
                                _auditer.forEach(ele => {
                                    sendmessage(_g.applyid, ele, sendname, '', 2, '', function () {
                                        _i++;
                                        if (_i == _auditer.length) {
                                            history.go(0)
                                        }
                                    })
                                })
                            })
                        })
                    })
                } else { //催办
                    $('#androidDialog1').fadeOut(200);
                    weui.alert('已催办', function () {

                        var _addauditer = $('input[name="select_auditer"]')
                        var _auditer = []; //推送人id
                        for (var o in _addauditer) {
                            _addauditer[o].checked ? _auditer.push(_addauditer[o].value) : null
                        }
                        if (!_auditer.length) {
                            weui.alert('请选择审批人')
                        }
                        // console.log(_auditer)
                        var _i = 0;
                        _auditer.forEach(ele => {
                            sendmessage(_g.applyid, ele, sendname, '', 2, '', function () {
                                _i++;
                                if (_i == _auditer.length) {
                                    history.go(0)
                                }
                            })
                        })


                    })
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
            var headstr = "<html><head><title></title></head><body><h1 style='text-align:center'>用车详情</h1>";
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

        // function sendmessage(id, userid, name, ti, type, callback) {
        //     var titles = ti || '用车申请'
        //     var str = 'http://jct.chease.cn' + '/my_list?applyid=' + id;
        //     if (type == 1) { //提交
        //         str += '&my=true'
        //     } else if (type == 2) { //审核
        //         str += '&auditing=true'
        //     } else if (type == 3) { //车队
        //         str += '&vehiclesend=true'
        //     }
        //     str += '&userid=' + userid
        //     var _desc = name + '的用车'
        //     var _op_data = { touser: userid, title: titles, desc: _desc, url: str, remark: "查看详情" };
        //     $.ajax({
        //         url: 'http://h5.bibibaba.cn/send_qywx.php',
        //         data: _op_data,
        //         dataType: 'jsonp',
        //         crossDomain: true,
        //         success: function (re) {
        //             callback()
        //         },
        //         error: function (err) {
        //             // console.log(err)
        //             callback()

        //         }
        //     })
        // }
        function sendmessage(id, userid, username, title, type, tel, callback) {
            var titles = title || '用车申请'
            var str = 'http://jct.chease.cn' + '/my_list?applyid=' + id;
            if (type == 1) { //提交
                str += '&my=true'
            } else if (type == 2) { //审核
                str += '&auditing=true'
            } else if (type == 3) { //车队
                str += '&vehiclesend=true'
            }
            str += '&userid=' + userid
            var _desc = username + '的用车'
            if (tel) {
                _desc += tel
            }
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

    }

    beta122()









    function beta() {
        var _g = W.getSearch();
        _user = JSON.parse(localStorage.getItem('user1'));
        var vehicleCaptain = null;
        // var vehicleCaptain = null;
        var sendname = null;
        var senduserid = null;
        var pc_op = {};
        var role = {
            9: '普通成员',
            12: '部门领导',
            13: '公司领导'

        }
        function getAllMessage() {
            //获取车队队长信息
            wistorm_api._list('department', { name: '车队', uid: _user.employee.companyId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                console.log(dep, 'dep')

                wistorm_api._list('employee', { departId: dep.data[0].objectId, companyId: _user.employee.companyId, role: 12 }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                    dep.data[0].employee = emp.data[0]
                    // console.log(emp)
                    wistorm_api.getUserList({ objectId: emp.data[0].uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                        dep.data[0].employee.user = json.data[0];
                        vehicleCaptain = dep.data[0];
                        // console.log(dat)
                    })
                })
            })

            W.$ajax('mysql_api/list', {
                json_p: { id: _g.applyid },
                table: 'ga_apply',
            }, function (res) {
                var data = res.data;
                wistorm_api.getUserList({ objectId: data[0].uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, $.cookie('auth_code'), function (json) {
                    data[0].userId = json.data[0].username;
                    wistorm_api._list('employee', { uid: res.data[0].uid }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                        data[0].employee = emp.data[0];
                        wistorm_api._list('department', { objectId: res.data[0].depart }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                            data[0].department = dep.data[0]
                            wistorm_api._list('vehicle', { name: res.data[0].car_num }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (veh) {
                                data[0].vehicle = veh.data[0];
                                W.$ajax('mysql_api/list', {
                                    json_p: { apply_id: _g.applyid },
                                    table: 'ga_spstatus',
                                }, function (res1) {
                                    data[0].spstatus = res1.data;
                                    var i = 0;
                                    res1.data.forEach(ele => {
                                        wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, $.cookie('auth_code'), function (json1) {
                                            ele.userId = json1.data[0].username
                                            wistorm_api._list('employee', { uid: ele.uid }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp1) {
                                                ele.employee = emp1.data[0];
                                                i++
                                                if (i == res1.total) {
                                                    // console.log(data,'data');
                                                    mainContral(data)
                                                }
                                            })
                                        })
                                    })
                                    // console.log(res, _user, 'dd')
                                })
                            })
                        })


                    })
                })


            })
        }
        getAllMessage();

        function mainContral(data) {
            console.log(data)
            show_apply(data)
        }
        function show_apply(data) {
            var apply = data[0];
            apply.car_num ? $('#cl').text(apply.car_num) : '';
            apply.driver == 3 ? '' : $('#jsy').text(apply.driver)
            $('#days').text(apply.days || '')
            $('#peer').text(apply.peer || '');
            $('#sqr').text(apply.name || '');
            $('#sqsj').text(W.dateToString(new Date((apply.cre_tm * 1000))));
            $('#sqbm').text(apply.department.name || '');
            $('#night').text(apply.night ? '是' : '否');
            $('#dz').text(apply.province || '');
            $('#address').text(apply.address || '');
            show_audit(apply.spstatus);
            auditing(data[0])
        }

        function show_audit(data) {
            $('#auditer').empty();
            data.forEach((ele, index) => {
                if (ele.isagree == 0) {
                    senduserid = ele.userId;
                }
                var isagree = ''
                ele.isagree ? ele.isagree == 1 ? isagree = '同意' : isagree = '驳回' : isagree = '审核中';

                var tr_content = `<tr class="tr_b_b1">
                    <th>${role[ele.employee.role]}审批</th>
                    <th>${isagree}</th>
                    <th>${ele.employee.name} </th>
                    <th>${ele.advice ? ele.advice : ''}</th>
                    <th>${W.dateToString(new Date((ele.cre_tm * 1000)))}</th>
                </tr>`
                $('#auditer').append(tr_content)
            })
        }

        function auditing(data) {
            console.log(data, 'auditing');
            console.log(vehicleCaptain, 'vehicle')
            var applystatus = data.spstatus[0].sp_status
            sendname = data.name
            console.log(_g.my)
            if (_g.my && applystatus == 1) { //撤销和催办
                $('#my_button').show();
            }
            if (_g.my && applystatus == 5) { //还车
                if (data.cart) {
                    if (data.vehicle.departId == vehicleCaptain.objectId) { //通知车队还车
                        $('#carlist_back').show()
                    } else { //自己还车
                        $('#back_car').show()
                    }
                }
                // $('#back_car').show()
            }
            if (_g.my && applystatus == 6) {
                $('#print_button').show();
            }
            if (_g.auditing && applystatus == 1) {
                // if (_user.employee.role == 12 || _user.employee.role == 13) {
                // $('#other_button').show()
                data.spstatus.forEach(ele => {
                    if (ele.uid == _user.employee.uid && !ele.isagree) {
                        $('#other_button').show();
                    }
                })
                // }
            }

            if (_g.vehiclesend && applystatus == 5 && !data.car_num) {
                $('#give_car').show()
                $('#select_driver').show();
                $('#select_car').show();
                showCarDriver()
            }
            if (_g.vehiclesend && applystatus == 5 && data.car_num) {
                $('#back_carlist').show()
            }
            all_toast(data)
        }

        function showCarDriver() {
            wistorm_api._list('vehicle', { departId: _user.depart.objectId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (veh) {
                var i = 0;
                if (veh.data.length) {
                    veh.data.forEach(ele => {
                        if (ele.status == 1) { //出车
                            W.$ajax('mysql_api/list', {
                                table: 'ga_apply',
                                json_p: { car_num: ele.name, etm: 0 },
                                sorts: '-id'
                            }, function (res) {
                                ele.apply = res.data[0];
                                wistorm_api._list('employee', { name: res.data[0].name }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                                    i++;
                                    ele.driverMessage = emp.data[0];
                                    if (i == veh.data.length) {
                                        show_car(veh.data)
                                    }
                                })

                            })
                        } else {
                            i++;
                            if (i == veh.data.length) {
                                show_car(veh.data)
                            }
                        }
                    })
                } else {
                    show_car(veh.data)
                }
            })
            wistorm_api._list('employee', { departId: _user.depart.objectId, role: 9 }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                var i = 0;
                if (emp.data.length) {
                    emp.data.forEach(ele => {
                        // if (ele.status == 1) { //出车
                        W.$ajax('mysql_api/list', {
                            table: 'ga_apply',
                            json_p: { driver: ele.name, etm: 0 },
                            sorts: '-id'
                        }, function (res) {
                            ele.apply = res.data[0];
                            i++;
                            if (i == emp.data.length) {
                                show_driver(emp.data)
                            }
                        })
                    })
                } else {
                    show_driver(emp.data)
                }
            })
            function show_car(res) {
                console.log(res, 'car')
                var car_data = [];
                // var user_car = [];
                res.forEach((ele, index) => {
                    var op = {};
                    if (ele.status == 1) {
                        ele.apply && ele.driverMessage ? op.label = ele.name + '(' + ele.apply.name + ele.driverMessage.tel + ')' : ele.apply ? op.label = ele.name + '(' + ele.apply.name + ')' : op.label = ele.name;
                    } else if (ele.status == 2) {
                        op.label = ele.name + '( 维保中 )'
                    } else {
                        op.label = ele.name
                    }
                    op.value = ele.objectId;
                    var tr_content = `<option value=${op.label}>${op.label}</option>`;
                    $('#select_car').append(tr_content)
                })
            }
            function show_driver(res) {
                console.log(res, 'res')
                var driver_data = [];
                res.forEach((ele, index) => {
                    var op = {};
                    ele.apply ? op.label = ele.name + '(' + ele.apply.car_num + ')' : op.label = ele.name;
                    // op.label = ele.name
                    op.value = ele.objectId;
                    var tr_content = `<option value=${op.label}>${op.label}</option>`;
                    $('#select_driver').append(tr_content)
                    // driver_data.push(op);
                })
            }
            $('#select_car').on('change', function () {
                // console.log($(this).children('option:selected').val());
                pc_op.car = $(this).children('option:selected').val()
            })
            $('#select_driver').on('change', function () {
                // console.log($(this).children('option:selected').val())
                pc_op.driver = $(this).children('option:selected').val();
            })
        }
        //派车


        function all_toast(data) {
            console.log(data, 'toast_button');
            $('#urge').on('click', function () {  //催办
                // sendmessage(res.apply[0].aid, senduserid, username, null, '已催办')
                weui.alert('已催办', function () {
                    sendmessage(_g.applyid, senduserid, sendname, '', 2, function () {
                        history.go(0)
                    })
                })
            })

            $('#pcar_dd').on('click', function () {
                if (!pc_op.driver) {
                    weui.alert('请选择司机');
                    return;
                }
                if (!pc_op.car) {
                    weui.alert('车辆');
                    return;
                }
                W.$ajax('mysql_api/update', {
                    table: 'ga_apply',
                    json_p: { id: _g.applyid },
                    update_json: { car_num: pc_op.car, driver: pc_op.driver }
                }, function (res) {
                    wistorm_api._update('vehicle', { name: pc_op.car }, { status: 1 }, W.getCookie('auth_code'), true, function (veh) {
                        sendmessage(_g.applyid, data.userId, sendname, '已派车', 2, function () {
                            history.go(0)
                        })
                    })
                })
            })
            //撤销
            $('#backout').on('click', function () {
                var etm = ~~(new Date().getTime() / 1000)
                W.$ajax('mysql_api/update', {
                    json_p: { id: _g.applyid },
                    update_json: { etm: etm, estatus: 0, is_sh: 2 },
                    table: 'ga_apply'
                }, function (res) {
                    console.log(res)
                    W.$ajax('mysql_api/update', {
                        json_p: { apply_id: _g.applyid },
                        update_json: { sp_status: 0, },
                        table: 'ga_spstatus'
                    }, function (u_s) {
                        console.log(u_s)
                        wistorm_api._update('vehicle', { name: data.car_num }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                            console.log(veh)
                            sendmessage(_g.applyid, data.userId, sendname, '撤销成功', 1, function () {
                                history.go(0)
                            })

                        });
                    })
                })
                //update apply spstatus 

                // let etm = ~~(new Date().getTime() / 1000)
                // getJson('/up_apply', function (res) {
                //     console.log(res)
                //     // top.location
                //     sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '撤销成功')

                // }, { etm: etm, id: res.apply[0].aid, sp_status: 0 })
            })
            //同意
            $('#agree').on('click', function () {
                if (data.status == 1) { //一级审批
                    var etm = ~~(new Date().getTime() / 1000)
                    W.$ajax('mysql_api/update', {
                        json_p: { id: _g.applyid },
                        update_json: { estatus: 8, is_sh: 2 },
                        table: 'ga_apply'
                    }, function (res) {
                        console.log(res)
                        W.$ajax('mysql_api/update', {
                            json_p: { uid: _user.user.objectId },
                            update_json: { isagree: 1, sp_status: 5 },
                            table: 'ga_spstatus'
                        }, function (us) {
                            if (data.car_num) {
                                sendmessage(_g.applyid, data.userId, sendname, '审核通过', 1, function () {
                                    history.go(0)
                                })
                            } else {
                                sendmessage(_g.applyid, vehicleCaptain.employee.user.username, sendname, '派车申请', 3, function () {
                                    sendmessage(_g.applyid, data.userId, sendname, '审核通过', 1, function () {
                                        history.go(0)
                                    })
                                })
                            }
                        })
                    })
                } else if (data.status == 3) { //三级审批
                    if (_user.employee.role == 13) {
                        W.$ajax('mysql_api/update', {
                            json_p: { id: _g.applyid },
                            update_json: { estatus: 8 },
                            table: 'ga_apply'
                        }, function (res) {
                            W.$ajax('mysql_api/update', {
                                json_p: { uid: _user.user.objectId },
                                update_json: { isagree: 1 },
                                table: 'ga_spstatus'
                            }, function (res1) {
                                W.$ajax('mysql_api/update', {
                                    json_p: { apply_id: _g.applyid },
                                    update_json: { sp_status: 5 },
                                    table: 'ga_spstatus'
                                }, function (res2) {
                                    if (data.car_num) {
                                        sendmessage(_g.applyid, data.userId, sendname, '审核通过', 1, function () {
                                            history.go(0)
                                        })
                                    } else {
                                        sendmessage(_g.applyid, vehicleCaptain.employee.user.username, sendname, '派车申请', 3, function () {
                                            sendmessage(_g.applyid, data.userId, sendname, '审核通过', 1, function () {
                                                history.go(0)
                                            })
                                        })
                                    }

                                })
                            })
                        })

                    } else if (_user.employee.role == 12) {
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
                                                selectAuditer(emp.data, 1)
                                            }
                                        })
                                    })
                                })
                            })
                        } else if (data.spstatus.length == 2) {
                            wistorm_api._list('employee', { departId: '1', role: 13 }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                                var i = 0;
                                emp.data.forEach(ele => {
                                    wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                                        ele.user = json.data[0];
                                        i++;
                                        if (i == emp.data.length) {
                                            console.log(emp.data)
                                            selectAuditer(emp.data, 2)
                                        }
                                    })
                                })
                            })
                        }
                    }
                }

                function selectAuditer(data, type) {
                    $('#nextAuditer').empty();
                    var append_spstatus = {};
                    var sendid = null;
                    var _index = null;
                    data.forEach((ele, index) => {
                        var _id = 'add' + index;
                        var checked = 'checked';
                        ele.responsibility.indexOf('1') > -1 ? _index = index : index == 0 ? _index = index : ''
                        var tr_content = `
                        <label>
                            <div class="weui-cell weui-cell_access" id="` + _id + `">
                                <input type="radio" style="margin-right:5px" name='add' `+ (ele.responsibility.indexOf('1') > -1 ? checked : index == 0 ? checked : '') + `/>
                                <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                    <img src="./img/1.png" style="width: 50px;display: block">
                                </div>
                                <div class="weui-cell__bd">
                                    <p>`+ ele.name + `</p>
                                    <p style="font-size: 13px;color: #888888;">`+ role[ele.role] + `</p>
                                </div>
                            </div>
                            <label />
                        `
                        $('#nextAuditer').append(tr_content);
                        $('#' + _id).on('click', function () {
                            console.log(index)
                            append_spstatus = {
                                id: 0,
                                isagree: 0,
                                uid: data[index].uid,
                                cre_tm: ~~(new Date().getTime() / 1000),
                                apply_id: _g.applyid,
                                sp_status: 1
                            }
                            type == 1 ? append_spstatus.status = 2 : type == 2 ? append_spstatus.status = 3 : null;
                            sendid = data[index].username
                        })
                    })
                    append_spstatus = {
                        id: 0,
                        isagree: 0,
                        uid: data[_index].uid,
                        cre_tm: ~~(new Date().getTime() / 1000),
                        apply_id: _g.applyid,
                        sp_status: 1
                    }
                    type == 1 ? append_spstatus.status = 2 : type == 2 ? append_spstatus.status = 3 : null;
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
                            update_json.estatus = 4
                        } else if (type == 2) {
                            update_json.estatus = 6
                        }
                        W.$ajax('mysql_api/update', {
                            json_p: { id: _g.applyid },
                            update_json: update_json,
                            table: 'ga_apply'
                        }, function (res) {
                            W.$ajax('mysql_api/update', {
                                json_p: { uid: _user.user.objectId },
                                update_json: { isagree: 1 },
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
                        })
                    })
                }
            })
            //驳回
            $('#reject').on('click', function () {
                var etm = ~~(new Date().getTime() / 1000)
                W.$ajax('mysql_api/update', {
                    json_p: { id: _g.applyid },
                    update_json: { etm: etm, estatus: 0, is_sh: 2 },
                    table: 'ga_apply'
                }, function (res) {
                    console.log(res)
                    W.$ajax('mysql_api/update', {
                        json_p: { uid: _user.user.objectId },
                        update_json: { isagree: 2 },
                        table: 'ga_spstatus'
                    }, function (us) {
                        console.log(us)
                        W.$ajax('mysql_api/update', {
                            json_p: { apply_id: _g.applyid },
                            update_json: { sp_status: 0, },
                            table: 'ga_spstatus'
                        }, function (u_s) {
                            console.log(u_s)
                            wistorm_api._update('vehicle', { name: data.car_num }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                                console.log(veh)
                                sendmessage(_g.applyid, data.userId, sendname, '申请驳回', 1, function () {
                                    history.go(0)
                                })
                            });
                        })
                    })
                })
            })


            //车队还车
            $('#back_carlist').on('click', function () {
                var etm = ~~(new Date().getTime() / 1000)
                W.$ajax('mysql_api/update', {
                    json_p: { id: _g.applyid },
                    update_json: { estatus: 'A', etm: etm },
                    table: 'ga_apply'
                }, function (res) {
                    console.log(res)
                    W.$ajax('mysql_api/update', {
                        json_p: { apply_id: _g.applyid },
                        update_json: { sp_status: 6 },
                        table: 'ga_spstatus'
                    }, function (us) {
                        wistorm_api._update('vehicle', { name: data.car_num }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                            console.log(veh)
                            sendmessage(_g.applyid, data.userId, sendname, '还车成功', 1, function () {
                                sendmessage(_g.applyid, vehicleCaptain.employee.user.username, sendname, '还车成功', 3, function () {
                                    history.go(0)
                                })
                            })
                        });
                    })
                })
            })
            //用于我还车
            $('#back_car1').on('click', function () {
                //update apply spstatus vehicle
                var etm = ~~(new Date().getTime() / 1000)
                W.$ajax('mysql_api/update', {
                    json_p: { id: _g.applyid },
                    update_json: { estatus: 'A', etm: etm },
                    table: 'ga_apply'
                }, function (res) {
                    console.log(res)
                    W.$ajax('mysql_api/update', {
                        json_p: { apply_id: _g.applyid },
                        update_json: { sp_status: 6 },
                        table: 'ga_spstatus'
                    }, function (us) {
                        wistorm_api._update('vehicle', { name: data.car_num }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                            console.log(veh)
                            sendmessage(_g.applyid, data.userId, sendname, '还车成功', 1, function () {
                                history.go(0)
                            })
                        });
                    })
                })
            })
            //通知车队还车
            $('#carlist_back1').on('click', function () {
                weui.alert('已通知车队还车', function () {
                    sendmessage(_g.applyid, vehicleCaptain.employee.user.username, sendname, '', 3, function () {
                        history.go(0)
                    })
                })
            })

        }

        function sendmessage(id, userid, name, ti, type, callback) {
            var titles = ti || '用车申请'
            var str = 'http://jct.chease.cn' + '/my_list?applyid=' + id;
            if (type == 1) { //提交
                str += '&my=true'
            } else if (type == 2) { //审核
                str += '&auditing=true'
            } else if (type == 3) { //车队
                str += '&vehiclesend=true'
            }
            str += '&userid=' + userid
            var _desc = name + '的用车'
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
            var headstr = "<html><head><title></title></head><body><h1 style='text-align:center'>用车详情</h1>";
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
    }


    // beta()














    /**************************************华丽的分割线******************************************************* */
    function test() {
        var _g = W.getSearch();
        _user = JSON.parse(localStorage.getItem('user'))
        function getApply() {
            W.ajax('/getapply_list', {
                data: { applyid: _g.applyid },
                success: function (res) {
                    console.log(res, _user, 'dd')
                    show_apply(res)
                }
            })
        }
        getApply();

        function show_apply(data) {
            // console.log(data);
            var apply = data.apply[0];
            apply.car_num ? $('#cl').text(apply.car_num) : '';
            apply.driver == 3 ? '' : $('#jsy').text(apply.driver)
            $('#days').text(apply.days)
            $('#peer').text(apply.peer);
            $('#sqr').text(apply.aname);
            $('#sqsj').text(W.dateToString(new Date((apply.acre_tm * 1000))));
            $('#sqbm').text(apply.name);
            $('#night').text(apply.night ? '是' : '否');
            $('#dz').text(apply.province);
            $('#address').text(apply.address);

            show_audit(data.spstatus);
            auditing(data)
        }

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


        function auditing(res) {
            var _spstatus = [];
            var username = res.apply[0].aname;
            res.spstatus.forEach(ele => {
                if (ele.role == '科所队领导') {
                    _spstatus[0] = ele
                } else if (ele.role == '警务保障室领导') {
                    _spstatus[1] = ele
                } else if (ele.role == '局领导') {
                    _spstatus[2] = ele
                } else if (ele.role == '管理员') {
                    _spstatus[0] = ele
                }
            })
            res.spstatus = _spstatus;
            if (res.apply[0].etm) {
                $('#my_button').hide();
                $('#other_button').hide();
            }
            var _status = 0;
            var _sp_status = 0;
            res.apply.forEach((ele, index) => {
                // var _href = './my_list?applyid=' + ele.id + '&my=' + true;
                _status = 0;
                _sp_status = res.spstatus[0].sp_status;

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
                    if (_g.my && res.cart) { //我还车
                        $('#back_car').show()
                    } else if (_g.backing_car) { //车队还车
                        $('#back_carlist').show();
                    } else if (_g.give_car && !res.cart) { //派车
                        $('#give_car').show();
                    }
                } else if (_sp_status == 6) {
                    if (_g.my) {
                        $('#print_button').show();
                    }
                }
                //_sp_status = 0,1,4,5


                if (res.spstatus.length == 1) {
                    if (res.spstatus[0].isagree == 1) {
                        _status = 1;
                        if (res.apply[0].etm) {
                            _status = 2;
                        }
                    } else {
                        _status = 0;
                    }
                    if (res.spstatus[0].isagree == 2) {
                        _status = 3;
                    }
                    if (!res.spstatus[0].isagree && res.apply[0].etm > 0) {
                        _status = 4;
                    }
                    var _res = res;

                    $('#agree').on('click', function () {
                        var d_op = {
                            id: res.spstatus[0].sid,
                            isagree: 1,
                            applyid: _g.applyid,
                            sp_status: 5,
                        }
                        // getJson('/agree_apply', function (res) {
                        //     // console.log(res)
                        //     // sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '审批通过');
                        //     history.go(0)
                        // }, d_op)

                        W.ajax('/agree_apply', {
                            data: d_op,
                            success: function (res) {
                                sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '审批通过');
                            }
                        })
                    })
                    $('#reject').on('click', function () {
                        var re_etm = ~~(new Date().getTime() / 1000);
                        var d_op = {
                            id: res.spstatus[0].sid,
                            isagree: 2,
                            applyid: _g.applyid,
                            sp_status: 4,
                            etm: re_etm
                        }
                        // getJson('./agree_apply', function (res) {
                        //     // console.log(res)
                        //     // sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '审批驳回');
                        //     history.go(0)
                        // }, d_op);
                        W.ajax('/agree_apply', {
                            data: d_op,
                            success: function (res) {
                                sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '审批驳回');
                            }
                        })
                    })

                } else if (res.spstatus.length == 3) {
                    if (res.spstatus[0].isagree == 1 && res.spstatus[1].isagree == 1 && res.spstatus[2].isagree == 1) {
                        _status = 1;
                        if (res.apply[0].etm) {
                            _status = 2;
                        }
                    } else {
                        _status = 0;
                    }
                    if (res.spstatus[0].isagree == 2 || res.spstatus[1].isagree == 2 || res.spstatus[2].isagree == 2) {
                        _status = 3;
                    }
                    if ((!res.spstatus[0].isagree || !res.spstatus[1].isagree || !res.spstatus[2].isagree) && res.apply[0].etm > 0) {
                        _status = 4;
                    }
                    var _userid = null;
                    let userid2 = null;
                    var _sid = null;
                    var d_op = {};
                    if (!res.spstatus[0].isagree) {
                        _userid = res.spstatus[0].userid;
                        userid2 = res.spstatus[1].userid
                        _sid = res.spstatus[0].sid
                    } else if (!res.spstatus[1].isagree) {
                        _userid = res.spstatus[1].userid;
                        userid2 = res.spstatus[2].userid
                        _sid = res.spstatus[1].sid
                    } else if (!res.spstatus[2].isagree) {
                        _userid = res.spstatus[2].userid;
                        userid2 = '034237'
                        _sid = res.spstatus[2].sid;
                        d_op.sp_status = 5
                    }
                    // $('#urge').on('click', function () {
                    //     // sendmessage(res.apply[0].aid, _userid, username, null, '已催办')
                    // })


                    $('#agree').on('click', function () {
                        // var etm = 
                        d_op.id = _sid;
                        d_op.isagree = 1;
                        d_op.applyid = _g.applyid;
                        var _senid = res.apply[0].aid
                        // getJson('./agree_apply', function (res) {
                        //     // console.log(res);
                        //     // history.go(0)
                        //     // if (_user.user.role != '局领导') {
                        //     // sendmessage(_senid, _userid, username)
                        //     // } else if (_user.user.role == '局领导') {
                        //     // sendmessage(_senid, res.apply[0].userid, username, '审批通过')
                        //     // history.back();
                        //     // }
                        // }, d_op)

                        W.ajax('/agree_apply', {
                            data: d_op,
                            success: function (res) {
                                if (_user.user.role != '局领导') {
                                    sendmessage(_senid, _userid, username)
                                } else if (_user.user.role == '局领导') {
                                    sendmessage(_senid, res.apply[0].userid, username, '审批通过', function () {
                                        sendmessage(_senid, userid2, username)
                                    })
                                    // history.back();
                                }
                            }
                        })
                    })
                    $('#reject').on('click', function () {
                        var _senid = res.apply[0].aid;
                        var re_etm = ~~(new Date().getTime() / 1000);

                        // getJson('./agree_apply', function (res) {
                        //     // console.log(res);
                        //     // sendmessage(_senid, res.apply[0].userid, username, '审批驳回')
                        //     // history.go(0)
                        // }, { id: _sid, isagree: 2, applyid: res.apply[0].aid, etm: re_etm, sp_status: 4 })

                        W.ajax('/agree_apply', {
                            data: { id: _sid, isagree: 2, applyid: res.apply[0].aid, etm: re_etm, sp_status: 4 },
                            success: function (res) {
                                // history.go(0)
                                sendmessage(_senid, res.apply[0].userid, username, '审批驳回')
                            }
                        })
                    })

                    if (_user.user.role == '科所队领导' || _user.user.role == '警务保障室领导' || _user.user.role == '局领导') {
                        if (_user.user.role == '科所队领导' && res.spstatus[0].isagree) {
                            $('#other_button').hide();
                        } else if (_user.user.role == '警务保障室领导') {
                            if (!res.spstatus[0].isagree || res.spstatus[1].isagree) {
                                $('#other_button').hide();
                            }
                        } else if (_user.user.role == '局领导') {
                            if (!res.spstatus[0].isagree || !res.spstatus[1].isagree || res.spstatus[2].isagree) {
                                $('#other_button').hide();
                            }
                        }
                    }
                }
                // var use_status = '';
                // var color_status = '';
                // _status == 1 ? use_status = '已通过' : _status == 2 ? use_status = '已还车' : _status == 3 ? use_status = '驳回' : _status == 4 ? use_status = '已撤销' : use_status = '审核中';
                // _status == 1 ? color_status = '' : _status == 2 ? color_status = '' : _status == 3 ? color_status = 'no_agree' : _status == 4 ? color_status = 'back' : color_status = 'auditing';
                // var span_status = `<span class="weui-badge great ${color_status} chang_f12" style="margin-left: 5px;" id="_spstatus">${use_status}</span>`
                // $('#_spstatus_1').empty();
                // $('#_spstatus_1').append(span_status);
                // $('#_spstatus').addClass(color_status)
            })



            if (_user.user.role == '科所队领导' || _user.user.role == '警务保障室领导' || _user.user.role == '局领导') {
                // if (_status == 1 || _status == 3) {
                //     $('#other_button').hide();
                // }
            } else {
                // if (_status == 0) {
                //     $('#my_button').show();
                // } else if (_status == 2) {
                //     $('#my_button').hide();
                // }
            }
            var pc_op = {};
            if (_status == 1) {
                // $('#my_button').hide();
                // $('#other_button').hide();
                if (res.apply[0].car_num) { //还车
                    // $('#my_button').hide();
                    // $('#other_button').hide();
                    // if (res.cart[0].depart != '58' && _g.my) { //本单位和借车单位还车
                    //     $('#back_car').show();
                    // } else if (_g.my) {
                    //     $('#carlist_back').show();
                    // }
                    // if (res.cart[0].depart == '58' && !_g.my) {
                    //     $('#back_carlist').show();
                    // }
                } else { //车队派车
                    if (_user.user.role == '管理员') {
                        // $('#pcar_driver').show();
                        // $('#pcar_dd').show();
                        W.ajax('/getcar_driver', {
                            data: { depart: 58 },

                            success: function (res) {
                                console.log(res)
                                $('#select_car').empty();
                                $('#select_driver').empty();
                                res.car.forEach((ele) => {
                                    var op = {};
                                    if (ele.id) {
                                        op.label = ele.cname + ele.driver
                                    } else {
                                        op.label = ele.cname;
                                    }
                                    op.value = ele.cid
                                    var tr_content = `<option value=${op.label}>${op.label}</option>`;
                                    $('#select_car').append(tr_content)
                                })
                                res.driver.forEach((ele) => {
                                    var op = {};
                                    if (ele.id) {
                                        op.label = ele.dname + ele.car_num
                                    } else {
                                        op.label = ele.dname;
                                    }
                                    op.value = ele.did;
                                    var tr_content = `<option value=${op.label}>${op.label}</option>`;
                                    $('#select_driver').append(tr_content)
                                })

                                $('#select_car').on('change', function () {
                                    // console.log($(this).children('option:selected').val());
                                    pc_op.car = $(this).children('option:selected').val()
                                })
                                $('#select_driver').on('change', function () {
                                    // console.log($(this).children('option:selected').val())
                                    pc_op.driver = $(this).children('option:selected').val();
                                })

                            }
                        })
                    }
                }
            }

            $('#pcar_dd').on('click', function () {
                if (!pc_op.driver) {
                    weui.alert('请选择司机');
                    return;
                }
                if (!pc_op.car) {
                    weui.alert('车辆');
                    return;
                }

                pc_op.id = res.apply[0].aid;
                W.ajax('/up_applypc', {
                    data: pc_op,
                    success: function (res) {
                        // console.log(res)
                        sendmessage(res.apply[0].aid, res.apply[0].userid, username, '车队已派车')
                    }
                })
                // getJson('up_applypc', function (re) {
                //     // console.log(res)
                //     // sendmessage(res.apply[0].aid, res.apply[0].userid, username, '车队已派车')
                // }, { car: car, driver: driver, id: res.apply[0].aid })
            })


            var _res = res
            //撤销
            $('#backout').on('click', function () {
                var etm = ~~(new Date().getTime() / 1000);
                W.ajax('/up_apply', {
                    data: { etm: etm, id: res.apply[0].aid, sp_status: 0 },
                    success: function (res) {
                        // history.go(0)
                        sendmessage(_res.apply[0].aid, _user.user.userid, username, '撤销成功')
                    }
                })
                // getJson('/up_apply', function (res) {
                //     console.log(res)
                //     // top.location
                //     // sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '撤销成功')
                //     history.go(0)
                // }, { etm: etm, id: res.apply[0].aid, sp_status: 0 })
            })
            //车队还车
            $('#back_carlist').on('click', function () {
                var etm = ~~(new Date().getTime() / 1000);
                W.ajax('/up_apply', {
                    data: { etm: etm, id: res.apply[0].aid, sp_status: 6 },
                    success: function (res) {
                        // history.go(0)
                        sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '还车成功')
                    }
                })
                // getJson('/up_apply', function (res) {
                //     // sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '还车成功')
                //     history.go(0)
                // }, { etm: etm, id: res.apply[0].aid, sp_status: 6 })
            })
            //用于我还车
            $('#back_cars').on('click', function () {
                var etm = ~~(new Date().getTime() / 1000);
                W.ajax('/up_apply', {
                    data: { etm: etm, id: res.apply[0].aid, sp_status: 6 },
                    success: function (res) {
                        sendmessage(_res.apply[0].aid, _user.user.userid, username, '还车成功')
                    }
                })
                // getJson('/up_apply', function (res) {
                //     // console.log(res)
                //     history.go(0)
                // }, { etm: etm, id: res.apply[0].aid, sp_status: 6 })
            })

            // $('#carlist_back').on('click', function () {
            //     // sendmessage(_res.apply[0].aid, '034237', username, '请还车', '已通知车队还车');
            // })
        }

        $('#goback').on('click', function () {
            history.back();
        })
        $('#print').on('click', function () {
            // console.log(1)
            print()
        })

        function print() {
            var headstr = "<html><head><title></title></head><body><h1 style='text-align:center'>用车详情</h1>";
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
        function sendmessage(id, userid, name, ti, alt, callback) {
            var titles = ti || '用车申请'
            var str = 'http://jct.chease.cn' + '/my_list?applyid=' + id;
            if (alt) {
                str += '&my=true'
            }
            var _desc = name + '的用车'
            var _op_data = { touser: userid, title: titles, desc: _desc, url: str, remark: "查看详情" };
            $.ajax({
                url: 'http://h5.bibibaba.cn/send_qywx.php',
                data: _op_data,
                dataType: 'jsonp',
                crossDomain: true,
                success: function (re) {
                    if (alt) {
                        weui.alert(alt, function () {
                            if (callback) {
                                callback();
                            } else {
                                history.go(0);
                            }

                        })
                    } else {
                        if (callback) {
                            callback();
                        } else {
                            history.go(0);
                        }
                    }
                },
                error: function (err) {
                    // console.log(err)
                    if (alt) {
                        weui.alert(alt, function () {
                            if (callback) {
                                callback();
                            } else {
                                history.go(0);
                            }

                        })
                    } else {
                        if (callback) {
                            callback();
                        } else {
                            history.go(0);
                        }
                    }
                }
            })
        }
    }
})